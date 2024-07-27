import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Category } from "../../entities/Category";
import { paginate } from "nestjs-typeorm-paginate";

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://ecommerce-backend-api-production-84b3.up.railway.app/api/";

const omitTimestamps = (category: Category) => {
  const { created_at, updated_at, ...rest } = category;
  if (rest.image) {
    rest.image = `${BASE_URL}${rest.image}`;
  }
  return rest;
};


export class CategoryListingController {
  async getAllCategories(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const categoryRepo = appDataSource.getRepository(Category);

      const queryBuilder = categoryRepo.createQueryBuilder("category");

      const pagination = await paginate<Category>(queryBuilder, {
        page: Number(page),
        limit: Number(limit),
      });

      const categoriesWithoutTimestamps = pagination.items.map(omitTimestamps);

      res.status(200).json({
        categories: categoriesWithoutTimestamps,
        total: pagination.meta.totalItems,
        page: pagination.meta.currentPage,
        limit: pagination.meta.itemsPerPage,
        totalPages: pagination.meta.totalPages,
        success: true,
        message: "All Categories fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const categoryRepo = appDataSource.getRepository(Category);
      const category = await categoryRepo.findOne({ where: { id: parsedId } });

      if (!category) {
        return res.status(404).json({
          error: "Category not found",
          success: false,
          message: "Category not found with the provided ID",
        });
      }

      res.status(200).json({
        category: omitTimestamps(category),
        success: true,
        message: "Category Details fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  }

  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const categoryRepo = appDataSource.getRepository(Category);
      const category = await categoryRepo.findOne({ where: { slug } });

      if (!category) {
        return res.status(404).json({
          error: "Category not found",
          success: false,
          message: "Category not found with the provided slug",
        });
      }

      res.status(200).json({
        category: omitTimestamps(category),
        success: true,
        message: "Category Details fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  }
}
