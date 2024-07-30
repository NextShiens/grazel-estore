import { Request, Response } from "express";
import slugify from "slugify";
import { validationResult } from "express-validator";
import { Brand } from "../../entities/Brand";
import { appDataSource } from "../../config/db";

const omitTimestamps = (brand: Brand) => {
  const { created_at, updated_at, ...rest } = brand;
  return rest;
};

export class BrandController {
  async getAll(req: Request, res: Response) {
    try {
      const BrandRepo = appDataSource.getRepository(Brand);
      let brands = await BrandRepo.find();

      const brandsWithoutTimestamps = brands.map(omitTimestamps);

      res.status(200).json({
        brands: brandsWithoutTimestamps,
        success: true,
        message: "All Brands fetched successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch brands",
        success: false,
        message: "Failed to fetch brands",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const BrandRepo = appDataSource.getRepository(Brand);
      const brand = await BrandRepo.findOne({ where: { id: parsedId } });

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

  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const BrandRepo = appDataSource.getRepository(Brand);
      const brand = await BrandRepo.findOne({ where: { slug } });

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

  async create(req: Request, res: Response) {
    try {
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

      const { name, active } = req.body;

      const BrandRepo = appDataSource.getRepository(Brand);

      // Check if a brand with the same name already exists
      const existingBrand = await BrandRepo.findOne({ where: { name } });
      if (existingBrand) {
        return res.status(400).json({
          success: false,
          message: "Brand with this name already exists",
        });
      }

      const newBrand = new Brand();
      newBrand.name = name;
      newBrand.slug = slugify(name, { lower: true });
      newBrand.active = active !== undefined ? active : true;

      const createdBrand = await BrandRepo.save(newBrand);
      res.status(201).json({
        brand: omitTimestamps(createdBrand),
        success: true,
        message: "Brand created successfully!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create brand",
        error: error,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const updatedBrandData = req.body as Brand;

      if (!updatedBrandData.name) {
        return res.status(400).json({
          error: "Name is required",
          success: false,
          message: "Name field is required for updating the brand",
        });
      }

      const BrandRepo = appDataSource.getRepository(Brand);
      const existingBrand = await BrandRepo.findOne({
        where: { id: parsedId },
      });

      if (!existingBrand) {
        return res.status(404).json({
          error: "Brand not found",
          success: false,
          message: "Brand not found with the provided ID",
        });
      }

      const updatedBrand = await BrandRepo.save({
        ...existingBrand,
        ...updatedBrandData,
      });

      res.status(200).json({
        brand: omitTimestamps(updatedBrand),
        success: true,
        message: "Brand updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to update brand",
        success: false,
        message: "Failed to update brand",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const BrandRepo = appDataSource.getRepository(Brand);
      const brand = await BrandRepo.findOne({ where: { id: parsedId } });
      if (!brand) {
        return res.status(404).json({
          error: "Brand not found",
          success: false,
          message: "Brand not found with the provided ID",
        });
      }
      await BrandRepo.remove(brand);
      res.status(200).json({
        success: true,
        message: "Brand deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete brand",
        success: false,
        message: "Failed to delete brand",
      });
    }
  }
}
