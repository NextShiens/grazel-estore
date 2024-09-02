import { Request, Response } from "express";
import { paginate } from "nestjs-typeorm-paginate";
import { Product } from "../../entities/Product";
import { ProductsGallery } from "../../entities/productGallery";
import { appDataSource } from "../../config/db";
import { Category } from "../../entities/Category";
import { Brand } from "../../entities/Brand";
import { User } from "../../entities/Users";
import { Review } from "../../entities/Review";
import { In } from "typeorm";
import { UserInteractionProducts } from "../../entities/UserInteractionProducts";
import { ReviewImage } from "../../entities/ReviewImage";
import { Offer } from "../../entities/Offer";

interface ProductWithoutTtimestamps {
  id: number;
  user_id: number;
  user?: UserWithoutTtimestamps;
  category_id: number;
  category?: CategoryWithoutTtimestamps;
  brand_id: number;
  brand?: BrandWithoutTtimestamps;
  title: string;
  slug: string;
  featured_image: string | null;
  price: number;
  description: string | null;
  tags: string | null;
  active: number;
  gallery: ProductsGalleryWithoutTimestamps[];
}

interface ProductsGalleryWithoutTimestamps {
  id: number;
  image: string | null;
}

interface CategoryWithoutTtimestamps {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  active: boolean;
}

interface BrandWithoutTtimestamps {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  active: boolean;
}

interface UserWithoutTtimestamps {
  id: number;
  name: string;
  email: string;
  profile?: ProfileWithoutTtimestamps;
  // Add other user fields as necessary, but exclude the password
}

interface ProfileWithoutTtimestamps {
  id: number;
  bio: string | null;
  avatar: string | null;
  // Add other profile fields as necessary
}

interface ProductWithExtras extends Omit<Product, "reviews"> {
  featured_image: string;
  // rating: string;
  // reviewCount: number;
  gallery: Array<ProductsGallery & { image_url: string }>;
}

const BASE_URL = process.env.IMAGE_PATH || "https://api.grazle.co.in/";

const omitProductTtimestamps = async (
  product: Product
): Promise<ProductWithoutTtimestamps> => {
  const { updated_at, ...rest } = product;
  const gallery = product.gallery.map((galleryItem) =>
    omitGalleryTtimestamps(galleryItem)
  );

  const productWithoutTtimestamps: ProductWithoutTtimestamps = {
    ...rest,
    gallery,
  };

  const baseUrl = BASE_URL;

  if (productWithoutTtimestamps.featured_image) {
    productWithoutTtimestamps.featured_image = `${baseUrl}${productWithoutTtimestamps.featured_image}`;
  }

  // Fetch category
  const categoryRepo = appDataSource.getRepository(Category);
  const category = await categoryRepo.findOne({
    where: { id: productWithoutTtimestamps.category_id },
  });
  if (category) {
    productWithoutTtimestamps.category = omitTtimestamps(
      category,
      baseUrl
    ) as CategoryWithoutTtimestamps;
  }

  // Fetch brand
  const brandRepo = appDataSource.getRepository(Brand);
  const brand = await brandRepo.findOne({
    where: { id: productWithoutTtimestamps.brand_id },
  });
  if (brand) {
    productWithoutTtimestamps.brand = omitTtimestamps(
      brand,
      baseUrl
    ) as BrandWithoutTtimestamps;
  }

  // Fetch user
  const userRepo = appDataSource.getRepository(User);
  const user = await userRepo.findOne({
    where: { id: productWithoutTtimestamps.user_id },
    relations: ["profile"],
  });
  if (user) {
    productWithoutTtimestamps.user = omitUserPassword(
      omitTtimestamps(user, baseUrl)
    ) as UserWithoutTtimestamps;
  }

  return productWithoutTtimestamps;
};

const omitGalleryTtimestamps = (
  gallery: ProductsGallery
): ProductsGalleryWithoutTimestamps => {
  const { id, image } = gallery;
  return { id, image: image ? `${BASE_URL}${image}` : null };
};

const omitTtimestamps = (entity: any, baseUrl: string): any => {
  const { created_at, updated_at, ...rest } = entity;
  if (rest.image) {
    rest.image = `${baseUrl}${rest.image}`;
  }
  return rest;
};

const omitUserPassword = (user: any): UserWithoutTtimestamps => {
  const { password, profile, ...userWithoutPassword } = user;

  if (profile) {
    userWithoutPassword.profile = omitProfileTimestamps(profile);
  }

  return userWithoutPassword;
};

const omitProfileTimestamps = (profile: any): ProfileWithoutTtimestamps => {
  const { created_at, updated_at, ...profileWithoutTimestamps } = profile;
  if (profileWithoutTimestamps.avatar) {
    profileWithoutTimestamps.avatar = `${BASE_URL}${profileWithoutTimestamps.avatar}`;
  }
  return profileWithoutTimestamps;
};

export class ProductListingController {
  async getAllProducts(req: Request, res: Response) {
    try {
      const { categoryId, brandId, page = 1, limit = 10 } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);

      const distinctProductIds = productRepository
        .createQueryBuilder("product")
        .select(["product.id", "product.created_at"])
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products",
        error: error.message,
      });
    }
  }

  async getAllProductsWithoutPagination(req: Request, res: Response) {
    try {
      const { categoryId, brandId } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);

      const distinctProductIds = productRepository
        .createQueryBuilder("product")
        .select(["product.id", "product.created_at"])
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

      // Fetch full product details for all distinct product IDs
      const productIds = await distinctProductIds.getMany();
      const queryBuilder = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery")
        .whereInIds(productIds.map((item) => item.id))
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
        total: productsWithReviews.length,
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

  async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);
      const userRepository = appDataSource.getRepository(User);
      const reviewImageRepository = appDataSource.getRepository(ReviewImage);

      // Fetch the product with its gallery and brand using slug
      const product = await productRepository.findOne({
        where: { slug },
        relations: ["gallery", "offer", "faqs", "variants"],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Fetch reviews associated with the product
      const reviews = await reviewRepository.find({
        where: { product_id: product.id },
        order: { created_at: "DESC" },
        take: 10, // Limit to fetch only latest 10 reviews
      });

      // Fetch review images associated with each review
      const populatedReviews = await Promise.all(
        reviews.map(async (review) => {
          const reviewImages = await reviewImageRepository.find({
            where: { review_id: review.id },
          });
          const user = await userRepository.findOne({
            where: { id: review.user_id },
            relations: ["profile", "store_profile"],
          });

          return {
            ...review,
            reviewImages: reviewImages.map((image) => ({
              id: image.id,
              url: `${BASE_URL}${image.image_url}`,
            })),
            user: user
              ? {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  profile: user.profile
                    ? {
                        id: user.profile.id,
                        first_name: user.profile.first_name,
                        last_name: user.profile.last_name,
                        phone: user.profile.phone,
                        country: user.profile.country,
                        city: user.profile.city,
                        state: user.profile.state,
                        address: user.profile.address,
                        active: user.profile.active,
                        image: user.profile.image
                          ? `${BASE_URL}${user.profile.image}`
                          : null,
                      }
                    : null,
                }
              : null,
          };
        })
      );

      // Calculate total ratings and counts
      let totalRating = 0;
      let totalExcellentCount = 0;
      let totalVeryGoodCount = 0;
      let totalAverageCount = 0;
      let totalGoodCount = 0;
      let totalPoorCount = 0;
      let totalCommentCount = reviews.length;

      reviews.forEach((review) => {
        totalRating += review.rating;
        if (review.rating === 5) {
          totalExcellentCount++;
        } else if (review.rating === 4) {
          totalVeryGoodCount++;
        } else if (review.rating === 3) {
          totalAverageCount++;
        } else if (review.rating > 1) {
          totalGoodCount++;
        } else {
          totalPoorCount++;
        }
      });

      // Calculate average rating
      const averageRating =
        totalCommentCount > 0 ? totalRating / totalCommentCount : 0;

      // Fetch store details (user's profile) based on user_id from product
      const user = await userRepository.findOne({
        where: { id: product.user_id },
        relations: ["profile", "store_profile"],
      });

      if (!user || !user.profile) {
        return res.status(404).json({
          success: false,
          message: "Store details not found",
        });
      }

      const store = user.profile;

      // Manually calculate total_products, average_rating, and total_reviews
      const totalProducts = await productRepository.count({
        where: { user_id: product.user_id },
      });

      const storeProducts = await productRepository.find({
        where: { user_id: product.user_id },
        relations: ["reviews"],
      });

      // Get all product IDs from storeProducts
      const productIds = storeProducts.map((p) => p.id);

      // Fetch reviews for all products by their IDs
      const allReviews = await reviewRepository.find({
        where: { product_id: In(productIds) },
      });

      let totalRatingSum = 0;
      allReviews.forEach((review) => {
        totalRatingSum += review.rating;
      });

      const AllProductsAverageRating =
        allReviews.length > 0 ? totalRatingSum / allReviews.length : 0;

      let totalCommentsLength = 0;
      allReviews.forEach((review) => {
        if (review.comment && review.comment.trim().length > 0) {
          totalCommentsLength++;
        }
      });

      const AllProductsTotalReviews = totalCommentsLength;

      let storeTotalRating = 0;
      let storeTotalReviews = 0;

      storeProducts.forEach((p) => {
        p.reviews.forEach((review) => {
          storeTotalRating += review.rating;
          storeTotalReviews++;
        });
      });

      const productWithoutNestedFields: Product = {
        id: product.id,
        user_id: product.user_id,
        category_id: product.category_id,
        brand_id: product.brand_id,
        title: product.title,
        slug: product.slug,
        featured_image: product.featured_image,
        price: product.price,
        discount: product.discount,
        discounted_price: product.discounted_price,
        description: product.description,
        variants: product.variants,
        color: product.color,
        tags: product.tags,
        active: product.active,
        is_sponsored: product.is_sponsored,
        is_festival_event: product.is_festival_event,
        created_at: product.created_at,
        gallery: product.gallery,
        updated_at: product.updated_at,
        recentlyViewed: product.recentlyViewed,
        interactions: product.interactions,
        favoriteProducts: product.favoriteProducts,
        reviews: product.reviews,
        offer_id: product.offer_id,
        offer: product.offer,
        orderProducts: [],
        faqs: product.faqs,
        product_info: product.product_info,
      };

      const productWithoutTimestamps = await omitProductTtimestamps(
        productWithoutNestedFields
      );

      const productWithReviewsAndStore = {
        ...productWithoutTimestamps,
        reviews: populatedReviews,
        total_rating: {
          average_rating: averageRating.toFixed(1),
          total_rating_count: totalCommentCount,
          total_comment_count: totalCommentCount,
          total_excellent_count: totalExcellentCount,
          total_verygood_count: totalVeryGoodCount,
          total_average_count: totalAverageCount,
          total_good_count: totalGoodCount,
          total_poor_count: totalPoorCount,
        },
        store: {
          store_id: store.id,
          store_name: user?.store_profile
            ? user?.store_profile?.store_name
            : null,
          image: user?.store_profile
            ? `${BASE_URL}${user?.store_profile?.store_image}`
            : null,
          total_products: totalProducts,
          average_rating: AllProductsAverageRating.toFixed(1),
          total_reviews: AllProductsTotalReviews,
        },
      };

      res.status(200).json({
        product: productWithReviewsAndStore,
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

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);
      const userRepository = appDataSource.getRepository(User);
      const reviewImageRepository = appDataSource.getRepository(ReviewImage);

      const product = await productRepository.findOne({
        where: { id: Number(id) },
        relations: ["gallery", "offer", "faqs", "variants"],
      });
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Fetch reviews associated with the product
      const reviews = await reviewRepository.find({
        where: { product_id: product.id },
        order: { created_at: "DESC" },
        take: 10, // Limit to fetch only latest 10 reviews
      });

      // Fetch review images associated with each review
      const populatedReviews = await Promise.all(
        reviews.map(async (review) => {
          const reviewImages = await reviewImageRepository.find({
            where: { review_id: review.id },
          });
          const user = await userRepository.findOne({
            where: { id: review.user_id },
            relations: ["profile", "store_profile"],
          });

          return {
            ...review,
            reviewImages: reviewImages.map((image) => ({
              id: image.id,
              url: `${BASE_URL}${image.image_url}`,
            })),
            user: user
              ? {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  profile: user.profile
                    ? {
                        id: user.profile.id,
                        first_name: user.profile.first_name,
                        last_name: user.profile.last_name,
                        phone: user.profile.phone,
                        country: user.profile.country,
                        city: user.profile.city,
                        state: user.profile.state,
                        address: user.profile.address,
                        active: user.profile.active,
                        image: user.profile.image
                          ? `${BASE_URL}${user.profile.image}`
                          : null,
                      }
                    : null,
                }
              : null,
          };
        })
      );

      // Calculate total ratings and counts
      let totalRating = 0;
      let totalExcellentCount = 0;
      let totalVeryGoodCount = 0;
      let totalAverageCount = 0;
      let totalGoodCount = 0;
      let totalPoorCount = 0;
      let totalCommentCount = reviews.length;

      reviews.forEach((review) => {
        totalRating += review.rating;
        if (review.rating === 5) {
          totalExcellentCount++;
        } else if (review.rating === 4) {
          totalVeryGoodCount++;
        } else if (review.rating === 3) {
          totalAverageCount++;
        } else if (review.rating > 1) {
          totalGoodCount++;
        } else {
          totalPoorCount++;
        }
      });

      // Calculate average rating
      const averageRating =
        totalCommentCount > 0 ? totalRating / totalCommentCount : 0;

      // Fetch store details (user's profile) based on user_id from product
      const user = await userRepository.findOne({
        where: { id: product.user_id },
        relations: ["profile", "store_profile"],
      });

      if (!user || !user.profile) {
        return res.status(404).json({
          success: false,
          message: "Store details not found",
        });
      }

      const store = user.profile;

      // Manually calculate total_products, average_rating, and total_reviews
      const totalProducts = await productRepository.count({
        where: { user_id: product.user_id },
      });

      const storeProducts = await productRepository.find({
        where: { user_id: product.user_id },
        relations: ["reviews"],
      });

      // Get all product IDs from storeProducts
      const productIds = storeProducts.map((p) => p.id);

      // Fetch reviews for all products by their IDs
      const allReviews = await reviewRepository.find({
        where: { product_id: In(productIds) },
      });

      let totalRatingSum = 0;
      allReviews.forEach((review) => {
        totalRatingSum += review.rating;
      });

      const AllProductsAverageRating =
        allReviews.length > 0 ? totalRatingSum / allReviews.length : 0;

      let totalCommentsLength = 0;
      allReviews.forEach((review) => {
        if (review.comment && review.comment.trim().length > 0) {
          totalCommentsLength++;
        }
      });

      const AllProductsTotalReviews = totalCommentsLength;

      let storeTotalRating = 0;
      let storeTotalReviews = 0;

      storeProducts.forEach((p) => {
        p.reviews.forEach((review) => {
          storeTotalRating += review.rating;
          storeTotalReviews++;
        });
      });

      const productWithoutNestedFields: Product = {
        id: product.id,
        user_id: product.user_id,
        category_id: product.category_id,
        brand_id: product.brand_id,
        title: product.title,
        slug: product.slug,
        featured_image: product.featured_image,
        price: product.price,
        discount: product.discount,
        discounted_price: product.discounted_price,
        description: product.description,
        variants: product.variants,
        color: product.color,
        tags: product.tags,
        active: product.active,
        is_sponsored: product.is_sponsored,
        is_festival_event: product.is_festival_event,
        created_at: product.created_at,
        gallery: product.gallery,
        updated_at: product.updated_at,
        recentlyViewed: product.recentlyViewed,
        interactions: product.interactions,
        favoriteProducts: product.favoriteProducts,
        reviews: product.reviews,
        offer_id: product.offer_id,
        offer: product.offer,
        orderProducts: [],
        faqs: product.faqs,
        product_info: product.product_info,
      };

      const productWithoutTimestamps = await omitProductTtimestamps(
        productWithoutNestedFields
      );

      const productWithReviewsAndStore = {
        ...productWithoutTimestamps,
        reviews: populatedReviews,
        total_rating: {
          average_rating: averageRating.toFixed(1),
          total_rating_count: totalCommentCount,
          total_comment_count: totalCommentCount,
          total_excellent_count: totalExcellentCount,
          total_verygood_count: totalVeryGoodCount,
          total_average_count: totalAverageCount,
          total_good_count: totalGoodCount,
          total_poor_count: totalPoorCount,
        },
        store: {
          store_id: store.id,
          store_name: user?.store_profile
            ? user?.store_profile?.store_name
            : null,
          image: user?.store_profile
            ? `${BASE_URL}${user?.store_profile?.store_image}`
            : null,
          total_products: totalProducts,
          average_rating: AllProductsAverageRating.toFixed(1),
          total_reviews: AllProductsTotalReviews,
        },
      };

      res.status(200).json({
        product: productWithReviewsAndStore,
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

  async getAllReviewForSingleProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { latest_arrival, top_rated, popular, rating } = req.query;

      // Validate if id is a number
      const productId = Number(id);

      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const reviewRepository = appDataSource.getRepository(Review);
      const reviewImageRepository = appDataSource.getRepository(ReviewImage);
      const userRepository = appDataSource.getRepository(User);

      // Base query to fetch reviews
      let queryBuilder = reviewRepository
        .createQueryBuilder("review")
        .where("review.product_id = :productId", { productId });

      // Apply latest_arrival filter
      if (latest_arrival === "desc") {
        queryBuilder = queryBuilder.orderBy("review.created_at", "DESC");
      }

      // Apply top_rated filter
      if (top_rated === "top") {
        queryBuilder = queryBuilder.orderBy("review.rating", "DESC");
      }

      // Apply popular filter
      if (popular === "popular") {
        queryBuilder = queryBuilder.orderBy("review.rating", "DESC");
      }

      // Apply rating filter if provided
      if (rating) {
        const ratingValue = parseInt(rating as string, 10);
        if (ratingValue === 3) {
          queryBuilder = queryBuilder.andWhere(
            "review.rating BETWEEN 3.0 AND 3.9"
          );
        } else if (ratingValue === 4) {
          queryBuilder = queryBuilder.andWhere(
            "review.rating BETWEEN 4.0 AND 4.9"
          );
        } else if (ratingValue === 5) {
          queryBuilder = queryBuilder.andWhere("review.rating = 5.0");
        }
      }

      // Fetch all reviews associated with the product
      const reviews = await queryBuilder.getMany();

      if (!reviews || reviews.length === 0) {
        return res.status(404).json({
          reviews: [],
          success: false,
          message: "Reviews not found for the product",
        });
      }

      // Calculate total ratings and counts
      let totalRating = 0;
      let totalExcellentCount = 0;
      let totalVeryGoodCount = 0;
      let totalAverageCount = 0;
      let totalGoodCount = 0;
      let totalPoorCount = 0;
      let totalCommentCount = reviews.length;

      reviews.forEach((review) => {
        totalRating += review.rating;
        if (review.rating === 5) {
          totalExcellentCount++;
        } else if (review.rating === 4) {
          totalVeryGoodCount++;
        } else if (review.rating === 3) {
          totalAverageCount++;
        } else if (review.rating > 1) {
          totalGoodCount++;
        } else {
          totalPoorCount++;
        }
      });

      // Calculate average rating
      const averageRating =
        totalCommentCount > 0 ? totalRating / totalCommentCount : 0;

      // Fetch review images associated with each review
      const populatedReviews = await Promise.all(
        reviews.map(async (review) => {
          const reviewImages = await reviewImageRepository.find({
            where: { review_id: review.id },
          });
          const user = await userRepository.findOne({
            where: { id: review.user_id },
            relations: ["profile"],
          });

          return {
            ...review,
            reviewImages: reviewImages.map((image) => ({
              id: image.id,
              url: `${BASE_URL}${image.image_url}`,
            })),
            user: user
              ? {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  profile: user.profile
                    ? {
                        id: user.profile.id,
                        first_name: user.profile.first_name,
                        last_name: user.profile.last_name,
                        phone: user.profile.phone,
                        country: user.profile.country,
                        city: user.profile.city,
                        state: user.profile.state,
                        address: user.profile.address,
                        active: user.profile.active,
                        image: user.profile.image
                          ? `${BASE_URL}${user.profile.image}`
                          : null,
                        created_at: user.profile.created_at,
                        updated_at: user.profile.updated_at,
                      }
                    : null,
                }
              : null,
          };
        })
      );

      res.status(200).json({
        reviews: populatedReviews,
        total_rating: {
          average_rating: averageRating.toFixed(1),
          total_rating_count: totalCommentCount,
          total_comment_count: totalCommentCount,
          total_excellent_count: totalExcellentCount,
          total_verygood_count: totalVeryGoodCount,
          total_average_count: totalAverageCount,
          total_good_count: totalGoodCount,
          total_poor_count: totalPoorCount,
        },
        success: true,
        message: "Reviews retrieved successfully!",
      });
    } catch (error: any) {
      console.error("Error in getAllReviewForSingleProduct:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve reviews",
        error: error.message,
      });
    }
  }

  async relatedProduct(req: Request, res: Response) {
    try {
      const { product_id, category_id } = req.query;

      if (!product_id || !category_id) {
        return res.status(400).json({
          success: false,
          message: "Product ID and Category ID are required",
        });
      }

      const productRepository = appDataSource.getRepository(Product);

      const relatedProducts = await productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery")
        .where("product.category_id = :category_id", { category_id })
        .andWhere("product.id != :product_id", { product_id })
        .orderBy("product.created_at", "DESC")
        .limit(10)
        .getMany();

      const productsWithoutTtimestamps = await Promise.all(
        relatedProducts.map((product) => omitProductTtimestamps(product))
      );

      res.status(200).json({
        products: productsWithoutTtimestamps,
        success: true,
        message: "Related products retrieved successfully!",
      });
    } catch (error: any) {
      console.error("Error in relatedProduct:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve related products",
        error: error.message,
      });
    }
  }

  async getAllProductsWithOffer(req: Request, res: Response) {
    try {
      const { category_id, brand_id, page = 1, limit = 10 } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);

      const queryBuilder = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.gallery", "gallery")
        .leftJoinAndSelect("product.offer", "offer")
        .orderBy("product.created_at", "DESC");

      if (category_id) {
        queryBuilder.andWhere("product.category_id = :category_id", {
          category_id: Number(category_id),
        });
      }

      if (brand_id) {
        queryBuilder.andWhere("product.brand_id = :brand_id", {
          brand_id: Number(brand_id),
        });
      }

      // Filter products where offer is not null and offer.active is true
      queryBuilder.andWhere("offer.id IS NOT NULL");
      queryBuilder.andWhere("offer.active = :active", { active: true });

      const pagination = await paginate<Product>(queryBuilder, {
        page: Number(page),
        limit: Number(limit),
      });

      // Fetch reviews for each product
      const productsWithReviews: ProductWithExtras[] = await Promise.all(
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

          // Attach reviews, average rating, total reviews, and updated URLs to the product
          return {
            ...product,
            featured_image: product.featured_image
              ? `${BASE_URL}${product.featured_image}`
              : product.featured_image,
            gallery: product.gallery.map((image) => ({
              ...image,
              image_url: `${BASE_URL}${image.image}`,
            })),
            rating: averageRating.toFixed(1),
            reviewCount: totalReviews,
          };
        })
      );

      // Group products by offer
      const offersWithProducts = productsWithReviews.reduce((acc, product) => {
        const offer = product.offer;
        if (offer) {
          if (!acc[offer.id]) {
            acc[offer.id] = {
              offer,
              offer_products: [] as ProductWithExtras[],
            };
          }
          acc[offer.id].offer_products.push(product);
        }
        return acc;
      }, {} as Record<number, { offer: Offer; offer_products: ProductWithExtras[] }>);

      res.status(200).json({
        offers: Object.values(offersWithProducts),
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

  async getAllProductsWithOfferWithoutPagination(req: Request, res: Response) {
    try {
      const { category_id, brand_id } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);

      const queryBuilder = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.gallery", "gallery")
        .leftJoinAndSelect("product.offer", "offer")
        .orderBy("product.created_at", "DESC");

      if (category_id) {
        queryBuilder.andWhere("product.category_id = :category_id", {
          category_id: Number(category_id),
        });
      }

      if (brand_id) {
        queryBuilder.andWhere("product.brand_id = :brand_id", {
          brand_id: Number(brand_id),
        });
      }

      // Filter products where offer is not null and offer.active is true
      queryBuilder.andWhere("offer.id IS NOT NULL");
      queryBuilder.andWhere("offer.active = :active", { active: true });

      const products = await queryBuilder.getMany();

      // Fetch reviews for each product
      const productsWithReviews: ProductWithExtras[] = await Promise.all(
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

          // Attach reviews, average rating, total reviews, and updated URLs to the product
          return {
            ...product,
            featured_image: product.featured_image
              ? `${BASE_URL}${product.featured_image}`
              : product.featured_image,
            gallery: product.gallery.map((image) => ({
              ...image,
              image_url: `${BASE_URL}${image.image}`,
            })),
            rating: averageRating.toFixed(1),
            reviewCount: totalReviews,
          };
        })
      );

      // Group products by offer
      const offersWithProducts = productsWithReviews.reduce((acc, product) => {
        const offer = product.offer;
        if (offer) {
          if (!acc[offer.id]) {
            acc[offer.id] = {
              offer,
              offer_products: [] as ProductWithExtras[],
            };
          }
          acc[offer.id].offer_products.push(product);
        }
        return acc;
      }, {} as Record<number, { offer: Offer; offer_products: ProductWithExtras[] }>);

      res.status(200).json({
        offers: Object.values(offersWithProducts),
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

  async getProductsByUserIdWithOffer(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const productRepository = appDataSource.getRepository(Product);
      const offerRepository = appDataSource.getRepository(Offer);
      const reviewRepository = appDataSource.getRepository(Review);
      const categoryRepository = appDataSource.getRepository(Category);
      const brandRepository = appDataSource.getRepository(Brand);

      // Fetch products with active offers for the given user ID
      const products = await productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery") // Include the gallery relation
        .where("product.user_id = :userId", { userId: parseInt(userId, 10) })
        .andWhere("offer.id IS NOT NULL")
        .andWhere("offer.active = :active", { active: true })
        .orderBy("product.created_at", "DESC")
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .getMany();

      if (!products || products.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products available with active offers for this seller.",
        });
      }

      // Fetch reviews for all products in one go to optimize performance
      const productIds = products.map((product) => product.id);
      const reviews = await reviewRepository.find({
        where: { product_id: In(productIds) },
        order: { created_at: "DESC" },
      });

      // Calculate average ratings and attach reviews to respective products
      const productWithReviews = products.map((product) => {
        const productReviews = reviews.filter(
          (review) => review.product_id === product.id
        );
        const totalReviews = productReviews.length;
        const averageRating =
          totalReviews > 0
            ? productReviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            : 0;

        // Attach base URL to featured_image and gallery images
        return {
          ...product,
          featured_image: `${BASE_URL}${product.featured_image}`,
          gallery: product.gallery.map((image) => ({
            ...image,
            image_url: `${BASE_URL}${image.image}`,
          })),
          rating: averageRating.toFixed(1),
          reviews: totalReviews,
        };
      });

      // Fetch categories and brands for all products
      const categoryIds = productWithReviews.map(
        (product) => product.category_id
      );
      const brandIds = productWithReviews.map((product) => product.brand_id);

      const categories = await categoryRepository.find({
        where: { id: In(categoryIds) },
      });
      const brands = await brandRepository.find({
        where: { id: In(brandIds) },
      });

      // Map categories and brands to respective products
      const productsWithDetails = productWithReviews.map((product) => {
        const category = categories.find(
          (cat) => cat.id === product.category_id
        );
        const brand = brands.find((brand) => brand.id === product.brand_id);

        return {
          ...product,
          category: category || null,
          brand: brand || null,
        };
      });

      res.status(200).json({
        success: true,
        products: productsWithDetails,
        total: products.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(products.length / Number(limit)),
        message: "Products with active offers retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error fetching products with offer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products with active offers",
        error: error.message,
      });
    }
  }

  async getProductsByOfferId(req: Request, res: Response) {
    try {
      const { offer_id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);
      const categoryRepository = appDataSource.getRepository(Category);
      const brandRepository = appDataSource.getRepository(Brand);

      // Fetch products with the given offer ID
      const products = await productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery") // Include the gallery relation
        .where("product.offer_id = :offerId", {
          offerId: parseInt(offer_id, 10),
        })
        .andWhere("offer.active = :active", { active: true })
        .orderBy("product.created_at", "DESC")
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .getMany();

      if (!products || products.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products available for this offer.",
        });
      }

      // Fetch reviews for all products in one go to optimize performance
      const productIds = products.map((product) => product.id);
      const reviews = await reviewRepository.find({
        where: { product_id: In(productIds) },
        order: { created_at: "DESC" },
      });

      // Calculate average ratings and attach reviews to respective products
      const productWithReviews = products.map((product) => {
        const productReviews = reviews.filter(
          (review) => review.product_id === product.id
        );
        const totalReviews = productReviews.length;
        const averageRating =
          totalReviews > 0
            ? productReviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            : 0;

        // Attach base URL to featured_image and gallery images
        return {
          ...product,
          featured_image: `${BASE_URL}${product.featured_image}`,
          gallery: product.gallery.map((image) => ({
            ...image,
            image_url: `${BASE_URL}${image.image}`,
          })),
          rating: averageRating.toFixed(1),
          reviews: totalReviews,
        };
      });

      // Fetch categories and brands for all products
      const categoryIds = productWithReviews.map(
        (product) => product.category_id
      );
      const brandIds = productWithReviews.map((product) => product.brand_id);

      const categories = await categoryRepository.find({
        where: { id: In(categoryIds) },
      });
      const brands = await brandRepository.find({
        where: { id: In(brandIds) },
      });

      // Map categories and brands to respective products
      const productsWithDetails = productWithReviews.map((product) => {
        const category = categories.find(
          (cat) => cat.id === product.category_id
        );
        const brand = brands.find((brand) => brand.id === product.brand_id);

        return {
          ...product,
          category: category || null,
          brand: brand || null,
        };
      });

      res.status(200).json({
        success: true,
        products: productsWithDetails,
        total: products.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(products.length / Number(limit)),
        message: "Products for the given offer retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error fetching products for offer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products for the given offer",
        error: error.message,
      });
    }
  }

  // Get All Products with 50% Offer Conditions
  async getProductsWithFiftyPercentOffer(req: Request, res: Response) {
    try {
      const { category_id, brand_id, page = 1, limit = 10 } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);

      const queryBuilder = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.gallery", "gallery")
        .leftJoinAndSelect("product.offer", "offer")
        .orderBy("product.created_at", "DESC");

      if (category_id) {
        queryBuilder.andWhere("product.category_id = :category_id", {
          category_id: Number(category_id),
        });
      }

      if (brand_id) {
        queryBuilder.andWhere("product.brand_id = :brand_id", {
          brand_id: Number(brand_id),
        });
      }

      // Filter products where offer is not null, offer.active is true,
      // offer.discount_type is "percentage", and offer.discount_value is 50
      queryBuilder.andWhere("offer.id IS NOT NULL");
      queryBuilder.andWhere("offer.active = :active", { active: true });
      queryBuilder.andWhere("offer.discount_type = :discount_type", {
        discount_type: "percentage",
      });
      queryBuilder.andWhere("offer.discount_value = :discount_value", {
        discount_value: 50,
      });

      const pagination = await paginate<Product>(queryBuilder, {
        page: Number(page),
        limit: Number(limit),
      });

      // Fetch reviews for each product
      const productsWithReviews: ProductWithExtras[] = await Promise.all(
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

          // Attach reviews, average rating, total reviews, and updated URLs to the product
          return {
            ...product,
            featured_image: product.featured_image
              ? `${BASE_URL}${product.featured_image}`
              : product.featured_image,
            gallery: product.gallery.map((image) => ({
              ...image,
              image_url: `${BASE_URL}${image.image}`,
            })),
            rating: averageRating.toFixed(1),
            reviewCount: totalReviews,
          };
        })
      );

      // Group products by offer
      const offersWithProducts = productsWithReviews.reduce((acc, product) => {
        const offer = product.offer;
        if (offer) {
          if (!acc[offer.id]) {
            acc[offer.id] = {
              offer,
              offer_products: [] as ProductWithExtras[],
            };
          }
          acc[offer.id].offer_products.push(product);
        }
        return acc;
      }, {} as Record<number, { offer: Offer; offer_products: ProductWithExtras[] }>);

      res.status(200).json({
        offers: Object.values(offersWithProducts),
        total: pagination.meta.totalItems,
        page: pagination.meta.currentPage,
        limit: pagination.meta.itemsPerPage,
        totalPages: pagination.meta.totalPages,
        success: true,
        message: "Products with specific offer retrieved successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products",
        error: error.message,
      });
    }
  }

  async getProductsWithSeventyPercentOffer(req: Request, res: Response) {
    try {
      const { category_id, brand_id, page = 1, limit = 10 } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);

      const queryBuilder = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.gallery", "gallery")
        .leftJoinAndSelect("product.offer", "offer")
        .orderBy("product.created_at", "DESC");

      if (category_id) {
        queryBuilder.andWhere("product.category_id = :category_id", {
          category_id: Number(category_id),
        });
      }

      if (brand_id) {
        queryBuilder.andWhere("product.brand_id = :brand_id", {
          brand_id: Number(brand_id),
        });
      }

      // Filter products where offer is not null, offer.active is true,
      // offer.discount_type is "percentage", and offer.discount_value is 50
      queryBuilder.andWhere("offer.id IS NOT NULL");
      queryBuilder.andWhere("offer.active = :active", { active: true });
      queryBuilder.andWhere("offer.discount_type = :discount_type", {
        discount_type: "percentage",
      });
      queryBuilder.andWhere("offer.discount_value = :discount_value", {
        discount_value: 70,
      });

      const pagination = await paginate<Product>(queryBuilder, {
        page: Number(page),
        limit: Number(limit),
      });

      // Fetch reviews for each product
      const productsWithReviews: ProductWithExtras[] = await Promise.all(
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

          // Attach reviews, average rating, total reviews, and updated URLs to the product
          return {
            ...product,
            featured_image: product.featured_image
              ? `${BASE_URL}${product.featured_image}`
              : product.featured_image,
            gallery: product.gallery.map((image) => ({
              ...image,
              image_url: `${BASE_URL}${image.image}`,
            })),
            rating: averageRating.toFixed(1),
            reviewCount: totalReviews,
          };
        })
      );

      // Group products by offer
      const offersWithProducts = productsWithReviews.reduce((acc, product) => {
        const offer = product.offer;
        if (offer) {
          if (!acc[offer.id]) {
            acc[offer.id] = {
              offer,
              offer_products: [] as ProductWithExtras[],
            };
          }
          acc[offer.id].offer_products.push(product);
        }
        return acc;
      }, {} as Record<number, { offer: Offer; offer_products: ProductWithExtras[] }>);

      res.status(200).json({
        offers: Object.values(offersWithProducts),
        total: pagination.meta.totalItems,
        page: pagination.meta.currentPage,
        limit: pagination.meta.itemsPerPage,
        totalPages: pagination.meta.totalPages,
        success: true,
        message: "Products with specific offer retrieved successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products",
        error: error.message,
      });
    }
  }

  async getAllSponsoredProducts(req: Request, res: Response) {
    try {
      const { categoryId, brandId, page = 1, limit = 10 } = req.query;

      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);

      const queryBuilder = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery")
        .andWhere("product.is_sponsored = true") // Check if the product is sponsored
        .orderBy("product.created_at", "DESC");

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
            featured_image: `${BASE_URL}${product.featured_image}`,
            gallery: product.gallery.map((image) => ({
              ...image,
              image_url: `${BASE_URL}${image.image}`,
            })),
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

  async getAllFestivalProducts(req: Request, res: Response) {
    try {
      const { categoryId, brandId, page = 1, limit = 10 } = req.query;

      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);

      const queryBuilder = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery")
        .where("product.discount > 0")
        .andWhere("product.is_festival_event = true") // Check if the product is a festival event
        .orderBy("product.created_at", "DESC");

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
            featured_image: `${BASE_URL}${product.featured_image}`,
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

  async getAllProductsWithDiscounts(req: Request, res: Response) {
    try {
      const { categoryId, brandId, page = 1, limit = 10 } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);

      const queryBuilder = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery")
        .where("product.discount > 0")
        .orderBy("product.created_at", "DESC");

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
            featured_image: `${BASE_URL}${product.featured_image}`,
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

  async getBestOfAllProducts(req: Request, res: Response) {
    try {
      const { categoryId, brandId, page = 1, limit = 10 } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);
      const userInteractionProductsRepo = appDataSource.getRepository(
        UserInteractionProducts
      );

      // Fetch interactions grouped by product and count them
      const latestInteractions = await userInteractionProductsRepo
        .createQueryBuilder("interaction")
        .select("interaction.product_id", "product_id")
        .addSelect("COUNT(interaction.id)", "interaction_count")
        .groupBy("interaction.product_id")
        .orderBy("interaction_count", "DESC")
        .take(10)
        .getRawMany();

      // Extract product IDs and their interaction counts
      const productIds = latestInteractions.map(
        (interaction) => interaction.product_id
      );
      const productInteractionCount = latestInteractions.reduce(
        (acc, interaction) => {
          acc[interaction.product_id] = Number(interaction.interaction_count);
          return acc;
        },
        {}
      );

      if (productIds.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products found based on interactions",
        });
      }

      // Fetch products based on the extracted product IDs and filter by discount
      const productsWithDiscounts = await productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery")
        .where("product.id IN (:...productIds)", { productIds })
        .andWhere("product.discount > 0")
        .orderBy("product.discount", "DESC")
        .getMany();

      if (productsWithDiscounts.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products found in best of all list",
        });
      }

      // Sort products based on interaction count and discount value
      const sortedProducts = productsWithDiscounts.sort((a, b) => {
        const interactionCountA = productInteractionCount[a.id] || 0;
        const interactionCountB = productInteractionCount[b.id] || 0;
        if (interactionCountA !== interactionCountB) {
          return interactionCountB - interactionCountA;
        }
        return (b.discount || 0) - (a.discount || 0);
      });

      const paginatedProducts = sortedProducts.slice(
        (Number(page) - 1) * Number(limit),
        Number(page) * Number(limit)
      );

      // Fetch reviews for each product
      const productsWithReviews = await Promise.all(
        paginatedProducts.map(async (product) => {
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
            featured_image: `${BASE_URL}${product.featured_image}`,
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
        total: sortedProducts.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(sortedProducts.length / Number(limit)),
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

  async getTopSelectionProducts(req: Request, res: Response) {
    try {
      const { categoryId, brandId, page = 1, limit = 10 } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);
      const userInteractionProductsRepo = appDataSource.getRepository(
        UserInteractionProducts
      );

      // Fetch interactions grouped by product and count them, filtered by interaction type "view"
      const latestInteractions = await userInteractionProductsRepo
        .createQueryBuilder("interaction")
        .select("interaction.product_id", "product_id")
        .addSelect("COUNT(interaction.id)", "interaction_count")
        .where("interaction.interaction_type = :type", { type: "view" })
        .groupBy("interaction.product_id")
        .orderBy("interaction_count", "DESC")
        .take(10)
        .getRawMany();

      // Extract product IDs and their interaction counts
      const productIds = latestInteractions.map(
        (interaction) => interaction.product_id
      );
      const productInteractionCount = latestInteractions.reduce(
        (acc, interaction) => {
          acc[interaction.product_id] = Number(interaction.interaction_count);
          return acc;
        },
        {}
      );

      if (productIds.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products found based on interactions",
        });
      }

      // Fetch products based on the extracted product IDs and filter by discount
      const productsWithDiscounts = await productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery")
        .where("product.id IN (:...productIds)", { productIds })
        .andWhere("product.discount > 0")
        .orderBy("product.discount", "DESC")
        .getMany();

      if (productsWithDiscounts.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products found in top selection list",
        });
      }

      // Sort products based on interaction count and discount value
      const sortedProducts = productsWithDiscounts.sort((a, b) => {
        const interactionCountA = productInteractionCount[a.id] || 0;
        const interactionCountB = productInteractionCount[b.id] || 0;
        if (interactionCountA !== interactionCountB) {
          return interactionCountB - interactionCountA;
        }
        return (b.discount || 0) - (a.discount || 0);
      });

      const paginatedProducts = sortedProducts.slice(
        (Number(page) - 1) * Number(limit),
        Number(page) * Number(limit)
      );

      // Fetch reviews for each product
      const productsWithReviews = await Promise.all(
        paginatedProducts.map(async (product) => {
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
            featured_image: `${BASE_URL}${product.featured_image}`,
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
        total: sortedProducts.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(sortedProducts.length / Number(limit)),
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

  async getSeasonTopProducts(req: Request, res: Response) {
    try {
      const { categoryId, brandId, page = 1, limit = 10 } = req.query;
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);
      const userInteractionProductsRepo = appDataSource.getRepository(
        UserInteractionProducts
      );

      // Fetch interactions grouped by product and count them, filtered by interaction type "view"
      const latestInteractions = await userInteractionProductsRepo
        .createQueryBuilder("interaction")
        .select("interaction.product_id", "product_id")
        .addSelect("COUNT(interaction.id)", "interaction_count")
        .where("interaction.interaction_type = :type", { type: "purchase" })
        .groupBy("interaction.product_id")
        .orderBy("interaction_count", "DESC")
        .take(10)
        .getRawMany();

      // Extract product IDs and their interaction counts
      const productIds = latestInteractions.map(
        (interaction) => interaction.product_id
      );
      const productInteractionCount = latestInteractions.reduce(
        (acc, interaction) => {
          acc[interaction.product_id] = Number(interaction.interaction_count);
          return acc;
        },
        {}
      );

      if (productIds.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products found based on interactions",
        });
      }

      // Fetch products based on the extracted product IDs and filter by discount
      const productsWithDiscounts = await productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.offer", "offer")
        .leftJoinAndSelect("product.gallery", "gallery")
        .where("product.id IN (:...productIds)", { productIds })
        .andWhere("product.discount > 0")
        .orderBy("product.discount", "DESC")
        .getMany();

      if (productsWithDiscounts.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products found in season top picks",
        });
      }

      // Sort products based on interaction count and discount value
      const sortedProducts = productsWithDiscounts.sort((a, b) => {
        const interactionCountA = productInteractionCount[a.id] || 0;
        const interactionCountB = productInteractionCount[b.id] || 0;
        if (interactionCountA !== interactionCountB) {
          return interactionCountB - interactionCountA;
        }
        return (b.discount || 0) - (a.discount || 0);
      });

      const paginatedProducts = sortedProducts.slice(
        (Number(page) - 1) * Number(limit),
        Number(page) * Number(limit)
      );

      // Fetch reviews for each product
      const productsWithReviews = await Promise.all(
        paginatedProducts.map(async (product) => {
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
            featured_image: `${BASE_URL}${product.featured_image}`,
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
        total: sortedProducts.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(sortedProducts.length / Number(limit)),
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
}
