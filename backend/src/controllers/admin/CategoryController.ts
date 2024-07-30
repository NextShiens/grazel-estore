import slugify from "slugify";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { validationResult } from "express-validator";
import { Category } from "../../entities/Category";
import { appDataSource } from "../../config/db";

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://ecommerce-backend-api-production-84b3.up.railway.app/api/";


interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const omitTimestamps = (category: Category) => {
  const { created_at, updated_at, ...rest } = category;
  return rest;
};

export class CategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const categoryRepo = appDataSource.getRepository(Category);
      const categories = await categoryRepo.find();

      const categoriesWithBaseUrl = categories.map((category) => ({
        ...omitTimestamps(category),
        image: category.image ? BASE_URL + category.image : null,
      }));

      res.status(200).json({
        categories: categoriesWithBaseUrl,
        success: true,
        message: "All Categories fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  async getById(req: Request, res: Response) {
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

      const categoryWithBaseUrl = {
        ...omitTimestamps(category),
        image: category.image ? BASE_URL + category.image : null,
      };

      res.status(200).json({
        category: categoryWithBaseUrl,
        success: true,
        message: "Category Details fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const categoryRepo = appDataSource.getRepository(Category);
      const category = await categoryRepo.findOne({ where: { slug } });

      if (!category) {
        return res.status(404).json({
          error: "Category not found",
          success: false,
          message: "Category not found with the provided ID",
        });
      }

      const categoryWithBaseUrl = {
        ...omitTimestamps(category),
        image: category.image ? BASE_URL + category.image : null,
      };

      res.status(200).json({
        category: categoryWithBaseUrl,
        success: true,
        message: "Category Details fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
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

      const { name, active, description } = req.body;
      const image = (req as any).file?.path.replace(/\\/g, "/");

      const categoryRepo = appDataSource.getRepository(Category);
      const existingCategory = await categoryRepo.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }

      const newCategory = new Category();
      newCategory.name = name;
      newCategory.description = description;
      newCategory.slug = slugify(name, { lower: true });
      newCategory.image = image;
      newCategory.active = active !== undefined ? active : true;

      const createdCategory = await categoryRepo.save(newCategory);

      const categoryWithBaseUrl = {
        ...omitTimestamps(createdCategory),
        image: createdCategory.image ? BASE_URL + createdCategory.image : null,
      };

      res.status(201).json({
        category: categoryWithBaseUrl,
        success: true,
        message: "Category created successfully!",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          success: false,
          error: "Failed to create category",
          message: error.message,
        });
      } else {
        return res.status(500).json({
          success: false,
          error: "Unknown error occurred",
        });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const { name, active, description } = req.body;
      const categoryRepo = appDataSource.getRepository(Category);
      const existingCategory = await categoryRepo.findOne({
        where: { id: parsedId },
      });

      if (!existingCategory) {
        return res.status(404).json({
          error: "Category not found",
          success: false,
          message: "Category not found with the provided ID",
        });
      }

      const image = (req as any).file?.path.replace(/\\/g, "/");

      if (image) {
        if (existingCategory.image) {
          const oldImagePath = path.join(
            __dirname,
            "../../../bucket/category",
            path.basename(existingCategory.image)
          );
          try {
            fs.unlinkSync(oldImagePath);
            console.log("Old image deleted successfully");
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
        existingCategory.image = image;
      }

      if (name) {
        existingCategory.name = name;
        existingCategory.slug = slugify(name, { lower: true });
      }
      if (description) {
        existingCategory.description = description;
      }
      if (active !== undefined) {
        existingCategory.active = active;
      }

      const updatedCategory = await categoryRepo.save(existingCategory);

      const categoryWithBaseUrl = {
        ...omitTimestamps(updatedCategory),
        image: updatedCategory.image ? BASE_URL + updatedCategory.image : null,
      };

      res.json({
        category: categoryWithBaseUrl,
        success: true,
        message: "Category updated successfully!",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Failed to update category",
          success: false,
          message: error.message,
        });
      } else {
        return res.status(500).json({
          error: "Unknown error occurred",
          success: false,
        });
      }
    }
  }

  async delete(req: Request, res: Response) {
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

      // Delete the image associated with the category
      if (category.image) {
        const imagePath = path.join(
          __dirname,
          "../../bucket/category",
          path.basename(category.image)
        );
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Failed to delete image:", err);
          }
        });
      }

      await categoryRepo.remove(category);

      const categoryWithBaseUrl = {
        ...omitTimestamps(category),
        image: category.image ? BASE_URL + category.image : null,
      };

      res.json({
        success: true,
        category: categoryWithBaseUrl,
        message: "Category deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
}
