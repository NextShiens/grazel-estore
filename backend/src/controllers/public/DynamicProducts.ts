import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Product } from "../../entities/Product";
import { Review } from "../../entities/Review";

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://api.grazle.co.in/";

async function getRandomProducts(limit: number): Promise<Product[]> {
  const productRepository = appDataSource.getRepository(Product);

  // Log total count of products
  const totalProducts = await productRepository.count();

  const products = await productRepository
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.gallery", "gallery")
    .leftJoinAndSelect("product.offer", "offer")
    .orderBy("RAND()")
    .limit(limit)
    .getMany();

  return products;
}

export async function getProductsDynamically(req: Request, res: Response) {
  try {
    const randomProducts = await getRandomProducts(10);

    const reviewRepository = appDataSource.getRepository(Review);

    // Fetch reviews for each product
    const productsWithReviews = await Promise.all(
      randomProducts.map(async (product) => {
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

        // Attach base URL to featured_image and gallery images
        const productWithBaseUrl = {
          ...product,
          featured_image: product.featured_image
            ? `${BASE_URL}${product.featured_image}`
            : null,
          gallery: product.gallery.map((image) => ({
            ...image,
            image: `${BASE_URL}${image.image}`,
          })),
          rating: averageRating.toFixed(1),
          reviews: totalReviews,
        };

        return productWithBaseUrl;
      })
    );

    res.status(200).json({
      products: productsWithReviews,
      success: true,
      message: "Random products retrieved successfully!",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve random products",
      error: error.message,
    });
  }
}
