import { Request, Response } from "express";
import { validationResult } from "express-validator";
import slugify from "slugify";
import fs from "fs";
import path from "path";
import { Product } from "../../entities/Product";
import { ProductsGallery } from "../../entities/productGallery";
import { Category } from "../../entities/Category";
import { Brand } from "../../entities/Brand";
import { appDataSource } from "../../config/db";
import { paginate } from "nestjs-typeorm-paginate";
import { ProductFaqs } from "../../entities/ProductFaqs";
import { ProductVariant } from "../../entities/ProductVariant";
import { Review } from "../../entities/Review";
import { User } from "../../entities/Users";
import { v4 as uuidv4 } from "uuid";

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://ecommerce-backend-api-production-84b3.up.railway.app/api/";

interface ProductWithoutTimestamps {
  id: number;
  user_id: number;
  category_id: number;
  brand_id: number;
  title: string;
  slug: string;
  featured_image: string;
  price: number;
  description: string;
  tags: string;
  active: number;
  gallery: ProductsGalleryWithoutTimestamps[];
  category?: any;
  brand?: any;
}

interface ProductsGalleryWithoutTimestamps {
  id: number;
  image: string;
}

const addBaseUrlToImage = (imagePath: string | null | undefined): string => {
  return imagePath ? `${BASE_URL}${imagePath}` : "";
};

const omitCategoryTimestamps = (category: any) => {
  const { created_at, updated_at, ...rest } = category;
  return {
    ...rest,
    image: addBaseUrlToImage(category.image),
  };
};

const omitBrandTimestamps = (brand: any) => {
  const { created_at, updated_at, ...rest } = brand;
  return rest;
};

const omitProductTimestamps = async (
  product: Product
): Promise<ProductWithoutTimestamps> => {
  const { created_at, updated_at, ...rest } = product;
  const gallery = product.gallery?.map(omitGalleryTimestamps) || [];

  // Fetch category and brand details
  const category = await appDataSource
    .getRepository(Category)
    .findOne({ where: { id: product.category_id } });
  const brand = await appDataSource
    .getRepository(Brand)
    .findOne({ where: { id: product.brand_id } });

  return {
    ...rest,
    featured_image: addBaseUrlToImage(rest.featured_image),
    gallery,
    category: category ? omitCategoryTimestamps(category) : null,
    brand: brand ? omitBrandTimestamps(brand) : null,
  };
};

const omitGalleryTimestamps = (
  gallery: ProductsGallery
): ProductsGalleryWithoutTimestamps => {
  const { id, image } = gallery;
  return { id, image: addBaseUrlToImage(image) };
};

export class ProductController {
  //  Create Product
  async createProduct(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not authenticated",
        });
      }
      const getUserId = user.id;

      const userRepository = appDataSource.getRepository(User);

      const seller = await userRepository.findOne({
        where: { id: user.id },
        relations: ["profile", "store_profile"],
      });

      const sellerProfileActiveStatus = seller?.store_profile.active;

      if (!sellerProfileActiveStatus) {
        return res.status(201).json({
          success: false,
          message:
            "Your store profile is under review by our administrator. We appreciate your patience and will notify you once the approval process is complete. Thank you for your understanding.",
        });
      }

      // Validation Error Handling
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const result = errors.mapped();

        const formattedErrors: Record<string, string[]> = {};
        for (const key in result) {
          formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
            result[key].msg,
          ];
        }

        const errorCount = Object.keys(result).length;
        const errorSuffix =
          errorCount > 1
            ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
            : "";

        const errorResponse = {
          success: false,
          message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
          errors: formattedErrors,
        };

        return res.status(400).json(errorResponse);
      }

      const {
        category_id,
        brand_id,
        title,
        price,
        discount,
        description,
        tags,
        color,
        product_info,
        questions,
        answers,
        variants,
      } = req.body;

      const featured_image = (
        req as any
      ).files?.featured_image?.[0]?.path.replace(/\\/g, "/");

      const gallery_images =
        (req as any).files?.gallery_images?.map((file: any) =>
          file.path.replace(/\\/g, "/")
        ) || [];

      const productRepository = appDataSource.getRepository(Product);
      const galleryRepository = appDataSource.getRepository(ProductsGallery);
      const faqsRepository = appDataSource.getRepository(ProductFaqs);
      const variantRepository = appDataSource.getRepository(ProductVariant);


      let slug = slugify(title, { lower: true });

      const existingProduct = await productRepository.findOne({
        where: { title },
      });

      if (existingProduct) {
        // Append a unique 6-character string to the slug to avoid duplication
        slug = `${slug}-${uuidv4().slice(0, 6)}`;
      }


      const product = new Product();
      product.user_id = getUserId;
      product.category_id = category_id;
      product.brand_id = brand_id;
      product.title = title;
      product.slug = slug;
      product.featured_image = featured_image;
      product.price = price;
      product.description = description;
      product.color = color;
      product.tags = tags;
      product.product_info = product_info;

      if (discount && !isNaN(parseFloat(discount))) {
        product.discount = parseFloat(discount);
        const discountAmount = parseFloat(discount) / 100;
        product.discounted_price = product.price * (1 - discountAmount);
      } else {
        product.discount = null;
        product.discounted_price = product.price;
      }

      await productRepository.save(product);

      if (gallery_images.length > 0) {
        const galleryEntries = gallery_images.map((image: string) => {
          const galleryEntry = new ProductsGallery();
          galleryEntry.product = product;
          galleryEntry.image = image;
          return galleryEntry;
        });

        await galleryRepository.save(galleryEntries);
      }

      let faqEntries: ProductFaqs[] = [];
      if (questions && answers && questions.length === answers.length) {
        faqEntries = questions.map((question: string, index: number) => {
          const faqEntry = new ProductFaqs();
          faqEntry.product = product;
          faqEntry.question = question;
          faqEntry.answer = answers[index];
          return faqEntry;
        });

        await faqsRepository.save(faqEntries);
      }

      if (variants && Array.isArray(variants) && variants.length > 0) {
        const variantEntries = variants.map((variant: any) => {
          const productVariant = new ProductVariant();
          productVariant.variant = variant.variant;
          productVariant.price = variant.price;
          productVariant.color = variant.color;
          productVariant.measurements = variant.measurements;
          productVariant.product = product;
          return productVariant;
        });

        await variantRepository.save(variantEntries);
      }

      const savedProduct = await productRepository.findOne({
        where: { id: product.id },
        relations: ["gallery", "faqs", "variants"],
      });

      if (savedProduct) {
        res.status(201).json({
          product: savedProduct,
          success: true,
          message: "Product created successfully!",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to fetch saved product details",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to create product",
        error: error.message,
      });
    }
  }

  async getProducts(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      const { categoryId, brandId, page = 1, limit = 10 } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);

      const queryBuilder = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.gallery", "gallery")
        .where("product.user_id = :userId", { userId: user.id });
      // .orderBy("product.created_at", "DESC"); // Order by creation date in descending order

      if (categoryId) {
        queryBuilder.andWhere("product.category_id = :categoryId", {
          categoryId: Number(categoryId),
        });
      }

      if (brandId) {
        queryBuilder.andWhere("product.brand_id = :brandId", {
          brandId: Number(brandId),
        });
      }

      const pagination = await paginate<Product>(queryBuilder, {
        page: Number(page),
        limit: Number(limit),
      });

      // Fetch reviews for each product
      const productsWithReviews = await Promise.all(
        pagination.items.map(async (product) => {
          const reviews = await reviewRepository.find({
            where: { product_id: product.id },
            order: { created_at: "DESC" },
          });

          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;

          // Attach reviews, average rating, and total reviews to the product
          return {
            ...product,
            rating: averageRating.toFixed(1),
            reviews: totalReviews,
          };
        })
      );

      res.status(200).json({
        products: productsWithReviews,
        total: pagination.meta.totalItems,
        page: pagination.meta.currentPage,
        limit: pagination.meta.itemsPerPage,
        totalPages: pagination.meta.totalPages,
        success: true,
        message: "Products retrieved successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products",
        error: error.message,
      });
    }
  }

  // Get Single Product by Slug
  async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const productRepository = appDataSource.getRepository(Product);

      const product = await productRepository.findOne({
        where: { slug },
        relations: ["gallery", "offer", "faqs", "variants"],
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res.status(200).json({
        product: await omitProductTimestamps(product),
        success: true,
        message: "Product retrieved successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve product",
        error: error.message,
      });
    }
  }

  // Update Product
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { category_id, brand_id, title, price, description, tags } =
        req.body;

      const productRepository = appDataSource.getRepository(Product);
      const galleryRepository = appDataSource.getRepository(ProductsGallery);

      const product = await productRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["gallery"],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      product.category_id = category_id || product.category_id;
      product.brand_id = brand_id || product.brand_id;
      product.title = title || product.title;
      product.price = price || product.price;
      product.description = description || product.description;
      product.tags = tags || product.tags;

      const featured_image = (
        req as any
      ).files?.featured_image?.[0]?.path.replace(/\\/g, "/");
      const gallery_images =
        (req as any).files?.gallery_images?.map((file: any) =>
          file.path.replace(/\\/g, "/")
        ) || [];

      if (featured_image) {
        if (product.featured_image) {
          const oldImagePath = path.join(
            __dirname,
            "../../..",
            product.featured_image
          );
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Failed to delete old image:", err);
          });
        }
        product.featured_image = featured_image;
      }

      await productRepository.save(product);

      if (gallery_images.length > 0) {
        const existingGallery = product.gallery || [];

        for (const galleryItem of existingGallery) {
          const oldGalleryPath = path.join(
            __dirname,
            "../../..",
            galleryItem.image
          );
          fs.unlink(oldGalleryPath, (err) => {
            if (err) console.error("Failed to delete old gallery image:", err);
          });

          await galleryRepository.remove(galleryItem);
        }

        const newGalleryEntries = gallery_images.map((image: string) => {
          const galleryEntry = new ProductsGallery();
          galleryEntry.product_id = product.id;
          galleryEntry.image = image;
          return galleryEntry;
        });

        await galleryRepository.save(newGalleryEntries);
      }

      res.status(200).json({
        product: {
          ...omitProductTimestamps(product),
          gallery: gallery_images.map((image: string) => ({
            id: 0, // Since the gallery entry might not have an id yet
            image: addBaseUrlToImage(image),
          })),
        },
        success: true,
        message: "Product updated successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update product",
        error: error.message,
      });
    }
  }

  // Delete Product
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productRepository = appDataSource.getRepository(Product);
      const galleryRepository = appDataSource.getRepository(ProductsGallery);

      const product = await productRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["gallery"],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.featured_image) {
        const oldImagePath = path.join(
          __dirname,
          "../../..",
          product.featured_image
        );
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Failed to delete old image:", err);
        });
      }

      const existingGallery = product.gallery || [];

      for (const galleryItem of existingGallery) {
        const oldGalleryPath = path.join(
          __dirname,
          "../../..",
          galleryItem.image
        );
        fs.unlink(oldGalleryPath, (err) => {
          if (err) console.error("Failed to delete old gallery image:", err);
        });

        await galleryRepository.remove(galleryItem);
      }

      await productRepository.remove(product);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to delete product",
        error: error.message,
      });
    }
  }

  // Delete Image from Product Gallery
  async deleteProductImage(req: Request, res: Response) {
    try {
      const { productId, imageId } = req.params;
      const productRepository = appDataSource.getRepository(Product);
      const galleryRepository = appDataSource.getRepository(ProductsGallery);

      const product = await productRepository.findOne({
        where: { id: parseInt(productId) },
        relations: ["gallery"],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const galleryImage = product.gallery.find(
        (image) => image.id === parseInt(imageId)
      );

      if (!galleryImage) {
        return res.status(404).json({
          success: false,
          message: "Image not found in product gallery",
        });
      }

      const imagePath = path.join(
        __dirname,
        "../../bucket/product",
        path.basename(galleryImage.image)
      );

      try {
        fs.unlinkSync(imagePath);
        console.log("Gallery image deleted successfully");
      } catch (err) {
        console.error("Failed to delete gallery image:", err);
      }

      await galleryRepository.remove(galleryImage);

      res.status(200).json({
        success: true,
        message: "Image deleted from product gallery successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to delete image from product gallery",
        error: error.message,
      });
    }
  }

  // Make Product Festival Event
  async makeProductFestival(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const productRepository = appDataSource.getRepository(Product);
      const galleryRepository = appDataSource.getRepository(ProductsGallery);

      const product = await productRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["gallery", "offer", "faqs", "variants"],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Toggle the is_sponsored status
      product.is_festival_event = !product.is_festival_event;

      await productRepository.save(product);

      // Reload the product to get the updated gallery images
      const updatedProduct = await productRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["gallery", "offer", "faqs", "variants"],
      });

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Failed to retrieve updated product",
        });
      }

      res.status(200).json({
        success: true,
        message: `Product festival event status changed successfully! Now it is ${
          product.is_festival_event ? "added" : "removed"
        }.`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update product",
        error: error.message,
      });
    }
  }
}
