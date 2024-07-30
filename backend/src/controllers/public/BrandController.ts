import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Brand } from "../../entities/Brand";
import { paginate } from "nestjs-typeorm-paginate";

const omitTimestamps = (brand: Brand) => {
  const { created_at, updated_at, ...rest } = brand;
  return rest;
};

export class BrandListingController {
  async getAllBrands(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const brandRepo = appDataSource.getRepository(Brand);

      const queryBuilder = brandRepo.createQueryBuilder("brand");

      const pagination = await paginate<Brand>(queryBuilder, {
        page: Number(page),
        limit: Number(limit),
      });

      const brandsWithoutTimestamps = pagination.items.map(omitTimestamps);

      res.status(200).json({
        brands: brandsWithoutTimestamps,
        total: pagination.meta.totalItems,
        page: pagination.meta.currentPage,
        limit: pagination.meta.itemsPerPage,
        totalPages: pagination.meta.totalPages,
        success: true,
        message: "All Brands fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  }

  async getBrandById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const brandRepo = appDataSource.getRepository(Brand);
      const brand = await brandRepo.findOne({ where: { id: parsedId } });

      if (!brand) {
        return res.status(404).json({
          error: "Brand not found",
          success: false,
          message: "Brand not found with the provided ID",
        });
      }

      res.status(200).json({
        brand: omitTimestamps(brand),
        success: true,
        message: "Brand Details fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brand" });
    }
  }

  async getBrandBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const brandRepo = appDataSource.getRepository(Brand);
      const brand = await brandRepo.findOne({ where: { slug } });

      if (!brand) {
        return res.status(404).json({
          error: "Brand not found",
          success: false,
          message: "Brand not found with the provided slug",
        });
      }

      res.status(200).json({
        brand: omitTimestamps(brand),
        success: true,
        message: "Brand Details fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brand" });
    }
  }
}
