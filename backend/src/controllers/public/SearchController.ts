import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { SearchKeyword } from "../../entities/SearchKeyword";
import { Product } from "../../entities/Product";
import { User } from "../../entities/Users";
import { Category } from "../../entities/Category";
import { Brand } from "../../entities/Brand";
import { Review } from "../../entities/Review";
import { Pagination, paginate } from "nestjs-typeorm-paginate";
import { Like } from "typeorm";

const BASE_URL = process.env.IMAGE_PATH || "https://api.grazle.co.in/";

export class SearchController {
  constructor() {
    this.getSearchResults = this.getSearchResults.bind(this);
    this.logSearchKeyword = this.logSearchKeyword.bind(this);
    this.getPopularSearches = this.getPopularSearches.bind(this);
    this.getSuggestedKeywords = this.getSuggestedKeywords.bind(this);
  }

  async getSearchResults(req: Request, res: Response) {
    try {
      const {
        keywords,
        latest_arrival,
        price,
        top_rated,
        popular,
        rating,
        min_price,
        max_price,
        page = 1,
        limit = 10,
        category_id,
        brand_id,
        more_suitable,
        discount,
      } = req.query;

      const minPrice = parseFloat(min_price as string);
      const maxPrice = parseFloat(max_price as string);

      const categoryId = category_id ? Number(category_id) : null;

      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);


      const distinctProductIds = productRepository
        .createQueryBuilder("product")
        .select("product.id")
        .leftJoin("product.reviews", "review")
        .addSelect("COUNT(review.id)", "reviewCount")
        .groupBy("product.id");

      // Apply keywords filter only if provided
      if (keywords) {
        distinctProductIds.where(
          "(product.title LIKE :keywords OR product.description LIKE :keywords OR product.tags LIKE :keywords)",
          { keywords: `%${keywords}%` }
        );
      }

      // Check if category_id exists and apply the filter conditionally
      if (categoryId) {
        distinctProductIds.andWhere("product.category_id = :category_id", {
          category_id: categoryId,
        });
      }

      // Log the generated query for debugging
      console.log("Generated SQL Query:", distinctProductIds.getQuery());

      if (brand_id) {
        distinctProductIds.andWhere("product.brand_id = :brand_id", {
          brand_id: Number(brand_id),
        });
      }

      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        distinctProductIds.andWhere(
          "product.price BETWEEN :minPrice AND :maxPrice",
          {
            minPrice,
            maxPrice,
          }
        );
      } else if (!isNaN(minPrice)) {
        distinctProductIds.andWhere("product.price >= :minPrice", { minPrice });
      } else if (!isNaN(maxPrice)) {
        distinctProductIds.andWhere("product.price <= :maxPrice", { maxPrice });
      }

      if (rating) {
        const ratingValue = parseInt(rating as string, 10);
        distinctProductIds
          .leftJoin("product.reviews", "review")
          .groupBy("product.id")
          .having("AVG(review.rating) >= :rating", { rating: ratingValue });
      }

      if (latest_arrival === "desc") {
        distinctProductIds.orderBy("product.created_at", "DESC");
      } else if (price === "lowest") {
        distinctProductIds.orderBy("product.price", "ASC");
      } else if (price === "highest") {
        distinctProductIds.orderBy("product.price", "DESC");
      }

      if (top_rated === "top") {
        distinctProductIds
          .leftJoin("product.reviews", "review")
          .groupBy("product.id")
          .having("AVG(review.rating) = 5.0");
      }

      if (popular === "popular") {
        distinctProductIds
          .leftJoin("product.reviews", "review")
          .groupBy("product.id")
          .orderBy("COUNT(review.id)", "DESC");
      }

      // Apply more_suitable=suitable filter
      if (more_suitable === "suitable") {
        // Apply combination of discount and popular
        distinctProductIds
          .andWhere("product.discount IS NOT NULL AND product.discount > 0") // Assuming discount is a column in the product entity
          .addOrderBy("reviewCount", "DESC"); // Sort by popularity
      }

      // Apply discount filter
      if (discount === "discount") {
        distinctProductIds.andWhere(
          "product.discount IS NOT NULL AND product.discount > 0"
        );
        distinctProductIds.addOrderBy("product.discount", "DESC");
      }

      // Apply pagination
      const paginatedIds = await paginate<{ id: number }>(distinctProductIds, {
        page: Number(page),
        limit: Number(limit),
      });

      const productQuery = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.gallery", "gallery")
        .whereInIds(paginatedIds.items.map((item) => item.id))
        .orderBy("product.created_at", "DESC");

      const products = await productQuery.getMany();

      const productsWithDetails = await Promise.all(
        products.map(async (product) => {
          try {
            const price = product.price;

            const user = product.user_id
              ? await appDataSource.getRepository(User).findOne({
                  where: { id: product.user_id },
                  relations: ["profile", "store_profile"],
                })
              : null;

            const category = product.category_id
              ? await appDataSource.getRepository(Category).findOne({
                  where: { id: product.category_id },
                })
              : null;

            const brand = product.brand_id
              ? await appDataSource.getRepository(Brand).findOne({
                  where: { id: product.brand_id },
                })
              : null;

            const reviews = await reviewRepository.find({
              where: { product_id: product.id },
            });
            const totalComments = reviews.length;
            const averageRating =
              totalComments > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                  totalComments
                : 0;

            const gallery = product.gallery.map(({ id, image }) => ({
              id,
              image: `${BASE_URL}${image}`,
            }));

            const productWithDetails = {
              ...product,
              featured_image: product.featured_image
                ? `${BASE_URL}${product.featured_image}`
                : null,
              price,
              rating: averageRating.toFixed(1),
              reviews: totalComments,
              user: user
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
              store: user?.store_profile
                ? {
                    id: user.store_profile?.id,
                    store_name: user.store_profile?.store_name,
                    store_image: user.store_profile?.store_image
                      ? `${BASE_URL}${user.store_profile?.store_image}`
                      : null,
                    store_description: user.store_profile?.store_description,
                  }
                : null,
              category: category
                ? {
                    id: category.id,
                    name: category.name,
                    image: category.image
                      ? `${BASE_URL}${category.image}`
                      : null,
                    description: category.description,
                    slug: category.slug,
                  }
                : null,
              brand: brand
                ? {
                    id: brand.id,
                    name: brand.name,
                    slug: brand.slug,
                  }
                : null,
              gallery: gallery,
            };

            return productWithDetails;
          } catch (error: any) {
            console.error("Error fetching details for product:", error.message);
            return null;
          }
        })
      );

      const filteredProducts = productsWithDetails.filter(
        (product) => product !== null
      );

      res.status(200).json({
        success: true,
        message: "Search results fetched successfully!",
        products: filteredProducts,
        meta: paginatedIds.meta,
      });
    } catch (error: any) {
      console.error("Error fetching search results:", error.message);
      res.status(500).json({ error: "Failed to fetch search results" });
    }
  }


  async getSearchResultsWithoutPagination(req: Request, res: Response) {
    try {
      const {
        keywords,
        latest_arrival,
        price,
        top_rated,
        popular,
        rating,
        min_price,
        max_price,
        category_id,
        brand_id,
        more_suitable,
        discount,
      } = req.query;
  
      const minPrice = parseFloat(min_price as string);
      const maxPrice = parseFloat(max_price as string);
      const categoryId = category_id ? Number(category_id) : null;
  
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);
  
      const distinctProductIds = productRepository
        .createQueryBuilder("product")
        .select("product.id")
        .leftJoin("product.reviews", "review")
        .addSelect("COUNT(review.id)", "reviewCount")
        .groupBy("product.id");
  
      if (keywords) {
        distinctProductIds.where(
          "(product.title LIKE :keywords OR product.description LIKE :keywords OR product.tags LIKE :keywords)",
          { keywords: `%${keywords}%` }
        );
      }
  
      if (categoryId) {
        distinctProductIds.andWhere("product.category_id = :category_id", {
          category_id: categoryId,
        });
      }
  
      if (brand_id) {
        distinctProductIds.andWhere("product.brand_id = :brand_id", {
          brand_id: Number(brand_id),
        });
      }
  
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        distinctProductIds.andWhere(
          "product.price BETWEEN :minPrice AND :maxPrice",
          {
            minPrice,
            maxPrice,
          }
        );
      } else if (!isNaN(minPrice)) {
        distinctProductIds.andWhere("product.price >= :minPrice", { minPrice });
      } else if (!isNaN(maxPrice)) {
        distinctProductIds.andWhere("product.price <= :maxPrice", { maxPrice });
      }
  
      if (rating) {
        const ratingValue = parseInt(rating as string, 10);
        distinctProductIds
          .leftJoin("product.reviews", "review")
          .groupBy("product.id")
          .having("AVG(review.rating) >= :rating", { rating: ratingValue });
      }
  
      if (latest_arrival === "desc") {
        distinctProductIds.orderBy("product.created_at", "DESC");
      } else if (price === "lowest") {
        distinctProductIds.orderBy("product.price", "ASC");
      } else if (price === "highest") {
        distinctProductIds.orderBy("product.price", "DESC");
      }
  
      if (top_rated === "top") {
        distinctProductIds
          .leftJoin("product.reviews", "review")
          .groupBy("product.id")
          .having("AVG(review.rating) = 5.0");
      }
  
      if (popular === "popular") {
        distinctProductIds
          .leftJoin("product.reviews", "review")
          .groupBy("product.id")
          .orderBy("COUNT(review.id)", "DESC");
      }
  
      if (more_suitable === "suitable") {
        distinctProductIds
          .andWhere("product.discount IS NOT NULL AND product.discount > 0")
          .addOrderBy("reviewCount", "DESC");
      }
  
      if (discount === "discount") {
        distinctProductIds.andWhere(
          "product.discount IS NOT NULL AND product.discount > 0"
        );
        distinctProductIds.addOrderBy("product.discount", "DESC");
      }
  
      // Get all product IDs without pagination
      const distinctProductIdsResults = await distinctProductIds.getMany();
  
      const productQuery = productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.gallery", "gallery")
        .whereInIds(distinctProductIdsResults.map((item) => item.id))
        .orderBy("product.created_at", "DESC");
  
      const products = await productQuery.getMany();
  
      const productsWithDetails = await Promise.all(
        products.map(async (product) => {
          try {
            const price = product.price;
  
            const user = product.user_id
              ? await appDataSource.getRepository(User).findOne({
                  where: { id: product.user_id },
                  relations: ["profile", "store_profile"],
                })
              : null;
  
            const category = product.category_id
              ? await appDataSource.getRepository(Category).findOne({
                  where: { id: product.category_id },
                })
              : null;
  
            const brand = product.brand_id
              ? await appDataSource.getRepository(Brand).findOne({
                  where: { id: product.brand_id },
                })
              : null;
  
            const reviews = await reviewRepository.find({
              where: { product_id: product.id },
            });
            const totalComments = reviews.length;
            const averageRating =
              totalComments > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                  totalComments
                : 0;
  
            const gallery = product.gallery.map(({ id, image }) => ({
              id,
              image: `${BASE_URL}${image}`,
            }));
  
            const productWithDetails = {
              ...product,
              featured_image: product.featured_image
                ? `${BASE_URL}${product.featured_image}`
                : null,
              price,
              rating: averageRating.toFixed(1),
              reviews: totalComments,
              user: user
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
              store: user?.store_profile
                ? {
                    id: user.store_profile?.id,
                    store_name: user.store_profile?.store_name,
                    store_image: user.store_profile?.store_image
                      ? `${BASE_URL}${user.store_profile?.store_image}`
                      : null,
                    store_description: user.store_profile?.store_description,
                  }
                : null,
              category: category
                ? {
                    id: category.id,
                    name: category.name,
                    image: category.image
                      ? `${BASE_URL}${category.image}`
                      : null,
                    description: category.description,
                    slug: category.slug,
                  }
                : null,
              brand: brand
                ? {
                    id: brand.id,
                    name: brand.name,
                    slug: brand.slug,
                  }
                : null,
              gallery: gallery,
            };
  
            return productWithDetails;
          } catch (error: any) {
            console.error("Error fetching details for product:", error.message);
            return null;
          }
        })
      );
  
      const filteredProducts = productsWithDetails.filter(
        (product) => product !== null
      );
  
      res.status(200).json({
        success: true,
        message: "Search results fetched successfully!",
        products: filteredProducts,
      });
    } catch (error: any) {
      console.error("Error fetching search results:", error.message);
      res.status(500).json({ error: "Failed to fetch search results" });
    }
  }
  

  async getPopularSearches(req: Request, res: Response) {
    try {
      const searchKeywordRepository =
        appDataSource.getRepository(SearchKeyword);

      // Fetch popular search keywords sorted by count in descending order
      const popularKeywords = await searchKeywordRepository.find({
        select: ["id", "keyword"],
        order: { count: "DESC" },
      });

      res.status(200).json({
        success: true,
        message: "Popular search keywords fetched successfully!",
        keywords: popularKeywords,
      });
    } catch (error: any) {
      console.error("Error fetching popular search keywords:", error.message);
      res
        .status(500)
        .json({ error: "Failed to fetch popular search keywords" });
    }
  }

  async getSuggestedKeywords(req: Request, res: Response) {
    try {
      const { keyword } = req.query;

      if (!keyword || typeof keyword !== "string") {
        return res.status(400).json({
          success: false,
          message: "Keyword is required for suggestions.",
        });
      }

      const productRepository = appDataSource.getRepository(Product);

      console.log("Searching for keyword:", keyword);

      const products = await productRepository.find({
        where: [
          { title: Like(`%${keyword}%`) },
          { description: Like(`%${keyword}%`) },
        ],
        select: ["title", "description"],
        take: 10,
      });

      console.log("Products found:", products);

      if (products.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No products found for the given keyword.",
          suggestions: [],
        });
      }

      const suggestions = products.flatMap((product) => {
        const titleKeywords = this.extractContextualKeywords(
          product.title,
          keyword
        );
        const descriptionKeywords = this.extractContextualKeywords(
          product.description,
          keyword
        );
        return [...titleKeywords, ...descriptionKeywords];
      });

      const uniqueSuggestions = Array.from(new Set(suggestions)).filter(
        (suggestion) => suggestion.toLowerCase() !== keyword.toLowerCase()
      );

      console.log("Suggestions:", uniqueSuggestions);

      res.status(200).json({
        success: true,
        message: "Keyword suggestions fetched successfully!",
        suggestions: uniqueSuggestions,
      });
    } catch (error: any) {
      console.error("Error fetching suggested keywords:", error.message);
      res.status(500).json({ error: "Failed to fetch keyword suggestions" });
    }
  }

  private extractContextualKeywords(text: string, keyword: string): string[] {
    if (!text || !keyword) return [];

    const normalizedText = text.toLowerCase();
    const normalizedKeyword = keyword.toLowerCase();

    // Split the keyword into multiple words if necessary
    const keywordWords = normalizedKeyword.split(/\s+/);

    // Split the text into words
    const words = normalizedText.split(/\s+/);
    const suggestions: string[] = [];

    // Extract phrases containing the entire keyword or parts of it
    words.forEach((word, index) => {
      const phrase = words.slice(index - 2, index + 3).join(" "); // Extract up to 2 words before and 2 words after

      if (keywordWords.every((keywordWord) => phrase.includes(keywordWord))) {
        if (phrase.trim().length > 0) {
          suggestions.push(phrase);
        }
      }
    });

    // Ensure unique suggestions and trim whitespace
    return Array.from(new Set(suggestions.map((phrase) => phrase.trim())));
  }

  private async logSearchKeyword(keyword: string): Promise<void> {
    const searchKeywordRepository = appDataSource.getRepository(SearchKeyword);

    try {
      if (keyword) {
        // Check if the keyword already exists
        let existingKeyword = await searchKeywordRepository.findOne({
          where: { keyword },
        });

        if (existingKeyword) {
          // Increment the count if keyword exists
          existingKeyword.count++;
          await searchKeywordRepository.save(existingKeyword);
        } else {
          // Create a new SearchKeyword entity if keyword does not exist
          const newKeyword = new SearchKeyword();
          newKeyword.keyword = keyword;
          newKeyword.count = 1; // Initialize count to 1
          await searchKeywordRepository.save(newKeyword);
        }
      }
    } catch (error: any) {
      console.error("Error logging search keyword:", error.message);
    }
  }
}
