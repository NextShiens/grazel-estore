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
import { ProductDimensions } from "../../entities/ProductDimensions";

const BASE_URL = process.env.IMAGE_PATH || "https://api.grazle.co.in/";

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

// Utility function to check if a file exists
const fileExists = (filePath: string): boolean => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error("Error checking file existence:", err);
    return false;
  }
};

const generateUniqueSku = async (): Promise<string> => {
  const productRepository = appDataSource.getRepository(Product);
  let isUnique = false;
  let sku: string = ""; // Initialize with a default value

  while (!isUnique) {
    // Define the SKU format
    const prefix = "PRD-";
    const date = new Date().toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
    const uniquePart = uuidv4().slice(0, 6).toUpperCase(); // 6-character unique part

    // Combine parts to form the SKU
    sku = `${prefix}${date}-${uniquePart}`;

    // Check if SKU already exists
    const existingProduct = await productRepository.findOne({ where: { sku } });

    if (!existingProduct) {
      isUnique = true;
    }
  }

  return sku;
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
        dimensions,
      } = req.body;

      const featured_image = (
        req as any
      ).files?.featured_image?.[0]?.path.replace(/\\/g, "/");

      const gallery_images =
        (req as any).files?.gallery_images?.map((file: any) =>
          file.path.replace(/\\/g, "/")
        ) || [];

      // Check if gallery images exceed the limit
      if (gallery_images.length > 7) {
        return res.status(400).json({
          success: false,
          message: "You can upload a maximum of 7 gallery images.",
        });
      }

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

      // Generate unique SKU with professional format
      const sku = await generateUniqueSku();

      const product = new Product();
      product.user_id = getUserId;
      product.category_id = category_id;
      product.brand_id = brand_id;
      product.title = title;
      product.slug = slug;
      product.sku = sku;
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

      // Handling Dimensions for the Product
      if (dimensions) {
        const productDimensions = new ProductDimensions();
        productDimensions.length = dimensions.length;
        productDimensions.width = dimensions.width;
        productDimensions.height = dimensions.height;
        productDimensions.weight = dimensions.weight;
        product.dimensions = productDimensions; // Linking dimensions to product
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

          // Handling Dimensions for Variants
          if (variant.dimensions) {
            const variantDimensions = new ProductDimensions();
            variantDimensions.length = variant.dimensions.length;
            variantDimensions.width = variant.dimensions.width;
            variantDimensions.height = variant.dimensions.height;
            variantDimensions.weight = variant.dimensions.weight;
            productVariant.dimensions = variantDimensions;
          }

          productVariant.product = product;
          return productVariant;
        });

        await variantRepository.save(variantEntries);
      }

      const savedProduct = await productRepository.findOne({
        where: { id: product.id },
        relations: ["gallery", "faqs", "variants", "dimensions"],
      });

      if (savedProduct) {
        // Concatenate BASE_URL with featured_image and gallery images
        savedProduct.featured_image = savedProduct.featured_image
          ? `${BASE_URL}${savedProduct.featured_image}`
          : savedProduct.featured_image;
        if (savedProduct.gallery) {
          savedProduct.gallery = savedProduct.gallery.map((g) => ({
            ...g,
            image: `${BASE_URL}${g.image}`,
          }));
        }

        return res.status(201).json({
          success: true,
          message: "Product created successfully",
          data: savedProduct,
        });
      } else {
        return res.status(500).json({
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

      const distinctProductIds = productRepository
        .createQueryBuilder("product")
        .select(["product.id", "product.created_at"])
        .where("product.user_id = :userId", { userId: user.id })
        .orderBy("product.created_at", "DESC");

      if (categoryId) {
        distinctProductIds.andWhere("product.category_id = :categoryId", {
          categoryId: Number(categoryId),
        });
      }

      if (brandId) {
        distinctProductIds.andWhere("product.brand_id = :brandId", {
          brandId: Number(brandId),
        });
      }

      // Paginate based on distinct product IDs
      const paginatedIds = await paginate<{ id: number }>(distinctProductIds, {
        page: Number(page),
        limit: Number(limit),
      });

      // Fetch full product details for the paginated product IDs
      const queryBuilder = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery")
        .whereInIds(paginatedIds.items.map((item) => item.id))
        .orderBy("product.created_at", "DESC");

      const products = await queryBuilder.getMany();

      // Fetch reviews for each product
      const productsWithReviews = await Promise.all(
        products.map(async (product) => {
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

          return {
            ...product,
            featured_image: product?.featured_image
              ? `${BASE_URL}${product?.featured_image}`
              : null,
            gallery: product.gallery.map((image) => ({
              ...image,
              image: `${BASE_URL}${image.image}`,
            })),
            rating: averageRating.toFixed(1),
            reviews: totalReviews,
          };
        })
      );

      res.status(200).json({
        products: productsWithReviews,
        total: paginatedIds.meta.totalItems,
        page: paginatedIds.meta.currentPage,
        limit: paginatedIds.meta.itemsPerPage,
        totalPages: paginatedIds.meta.totalPages,
        success: true,
        message: "Products retrieved successfully!",
      });

      // res.status(200).json({
      //   products: productsWithReviews,
      //   total: pagination.meta.totalItems,
      //   page: pagination.meta.currentPage,
      //   limit: pagination.meta.itemsPerPage,
      //   totalPages: pagination.meta.totalPages,
      //   success: true,
      //   message: "Products retrieved successfully!",
      // });
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
        relations: [
          "gallery",
          "offer",
          "faqs",
          "variants",
          "product_dimensions",
        ],
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      // Concatenate BASE_URL with featured_image and gallery images
      product.featured_image = product.featured_image
        ? `${BASE_URL}${product.featured_image}`
        : product.featured_image;

      if (product.gallery && Array.isArray(product.gallery)) {
        product.gallery = product.gallery.map((g) => ({
          ...g,
          image: `${BASE_URL}${g.image}`,
        }));
      }

      return res.status(200).json({ success: true, product });
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
        dimensions,
      } = req.body;

      const productRepository = appDataSource.getRepository(Product);
      const galleryRepository = appDataSource.getRepository(ProductsGallery);
      const faqsRepository = appDataSource.getRepository(ProductFaqs);
      const variantRepository = appDataSource.getRepository(ProductVariant);
      const dimensionsRepository =
        appDataSource.getRepository(ProductDimensions);

      const product = await productRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["gallery", "faqs", "variants", "dimensions"],
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
      product.color = color || product.color;
      product.product_info = product_info || product.product_info;

      if (discount && !isNaN(parseFloat(discount))) {
        product.discount = parseFloat(discount);
        const discountAmount = parseFloat(discount) / 100;
        product.discounted_price = product.price * (1 - discountAmount);
      } else {
        product.discount = null;
        product.discounted_price = product.price;
      }

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

      // Check gallery image limit
      const existingGalleryCount = product.gallery ? product.gallery.length : 0;
      const newGalleryCount = gallery_images.length;

      if (existingGalleryCount + newGalleryCount > 7) {
        return res.status(400).json({
          success: false,
          message: `You cannot upload more than 7 gallery images. Current count: ${existingGalleryCount}, New images: ${newGalleryCount}`,
        });
      }

      await productRepository.save(product);

      if (gallery_images.length > 0) {
        const newGalleryEntries = gallery_images.map((image: string) => {
          const galleryEntry = new ProductsGallery();
          galleryEntry.product_id = product.id;
          galleryEntry.image = image;
          return galleryEntry;
        });

        await galleryRepository.save(newGalleryEntries);
      }

      // Updating FAQs
      if (questions && answers && questions.length === answers.length) {
        const existingFaqs = product.faqs || [];

        await faqsRepository.remove(existingFaqs);

        const faqEntries = questions.map((question: string, index: number) => {
          const faqEntry = new ProductFaqs();
          faqEntry.product = product;
          faqEntry.question = question;
          faqEntry.answer = answers[index];
          return faqEntry;
        });

        await faqsRepository.save(faqEntries);
      }

      // Updating Variants
      if (variants && Array.isArray(variants) && variants.length > 0) {
        // const existingVariants = product.variants || [];

        // Remove existing variants
        // await variantRepository.remove(existingVariants);

        const variantEntries = variants.map((variant: any) => {
          const productVariant = new ProductVariant();
          productVariant.variant = variant.variant;
          productVariant.price = variant.price;
          productVariant.color = variant.color;

          // Handle dimensions for variants if provided
          if (variant.dimensions) {
            const variantDimensions = new ProductDimensions();
            variantDimensions.length = variant.dimensions.length;
            variantDimensions.width = variant.dimensions.width;
            variantDimensions.height = variant.dimensions.height;
            variantDimensions.weight = variant.dimensions.weight;
            // Save the dimensions if not already saved
            variantRepository
              .save(variantDimensions)
              .then((savedDimensions) => {
                productVariant.dimensions = savedDimensions;
              });
          }

          productVariant.product = product;
          return productVariant;
        });

        await variantRepository.save(variantEntries);
      }

      // Updating Dimensions
      if (dimensions) {
        // Check if dimensions exist for the product
        let productDimensions = product.dimensions;

        if (!productDimensions) {
          // Create new dimensions if not present
          productDimensions = new ProductDimensions();
          productDimensions.product = product;
        }

        productDimensions.length = dimensions.length;
        productDimensions.width = dimensions.width;
        productDimensions.height = dimensions.height;
        productDimensions.weight = dimensions.weight;

        await dimensionsRepository.save(productDimensions);
      }

      const updatedProduct = await productRepository.findOne({
        where: { id: product.id },
        relations: ["gallery", "faqs", "variants", "dimensions"],
      });

      if (updatedProduct) {
        res.status(200).json({
          product: updatedProduct,
          success: true,
          message: "Product updated successfully!",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to fetch updated product details",
        });
      }
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
      const faqsRepository = appDataSource.getRepository(ProductFaqs);
      const variantRepository = appDataSource.getRepository(ProductVariant);

      // Load the product and its related records
      const product = await productRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["gallery", "faqs", "variants"],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Delete related files
      if (product.featured_image) {
        const oldImagePath = path.join(
          __dirname,
          "../../..",
          product.featured_image
        );
        if (fileExists(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Failed to delete old image:", err);
          });
        } else {
          console.warn("Featured image file does not exist:", oldImagePath);
        }
      }

      if (product.gallery && product.gallery.length > 0) {
        for (const galleryItem of product.gallery) {
          const oldGalleryPath = path.join(
            __dirname,
            "../../..",
            galleryItem.image
          );
          if (fileExists(oldGalleryPath)) {
            fs.unlink(oldGalleryPath, (err) => {
              if (err)
                console.error("Failed to delete old gallery image:", err);
            });
          } else {
            console.warn("Gallery image file does not exist:", oldGalleryPath);
          }
          await galleryRepository.remove(galleryItem);
        }
      }

      // Remove related records before deleting the product
      if (product.faqs && product.faqs.length > 0) {
        await faqsRepository.remove(product.faqs);
      }

      if (product.variants && product.variants.length > 0) {
        await variantRepository.remove(product.variants);
      }

      // Delete the product
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

  // Delete Product FAQ
  async deleteProductFaq(req: Request, res: Response) {
    try {
      const { productId, faqId } = req.params;
      const productRepository = appDataSource.getRepository(Product);
      const faqsRepository = appDataSource.getRepository(ProductFaqs);

      // Find the product
      const product = await productRepository.findOne({
        where: { id: parseInt(productId) },
        relations: ["faqs"],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Find the FAQ
      const faq = product.faqs.find((faq) => faq.id === parseInt(faqId));

      if (!faq) {
        return res.status(404).json({
          success: false,
          message: "FAQ not found in product",
        });
      }

      // Remove the FAQ
      await faqsRepository.remove(faq);

      res.status(200).json({
        success: true,
        message: "FAQ deleted successfully from product!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to delete FAQ",
        error: error.message,
      });
    }
  }

  // Delete Product Variant
  async deleteProductVariant(req: Request, res: Response) {
    try {
      const { productId, variantId } = req.params;
      const productRepository = appDataSource.getRepository(Product);
      const variantRepository = appDataSource.getRepository(ProductVariant);

      // Find the product
      const product = await productRepository.findOne({
        where: { id: parseInt(productId) },
        relations: ["variants"],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Find the variant
      const variant = product.variants.find(
        (variant) => variant.id === parseInt(variantId)
      );

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Variant not found in product",
        });
      }

      // Remove the variant
      await variantRepository.remove(variant);

      res.status(200).json({
        success: true,
        message: "Variant deleted successfully from product!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to delete variant",
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
