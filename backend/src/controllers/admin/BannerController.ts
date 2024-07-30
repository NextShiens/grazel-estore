import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { appDataSource } from "../../config/db";
import { Banner } from "../../entities/Banners";

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://ecommerce-backend-api-production-84b3.up.railway.app/api/";

function getFullUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }
  return `${BASE_URL}${path.replace(/\\/g, "/")}`;
}

function transformBanner(banner: Banner): Banner {
  return {
    ...banner,
    image: getFullUrl(banner.image),
    video: getFullUrl(banner.video),
  };
}

export class BannerController {
  async getAllBanners(req: Request, res: Response) {
    try {
      const BannerRepo = appDataSource.getRepository(Banner);
      let banners = await BannerRepo.find();

      banners = banners.map(transformBanner);

      res.status(200).json({
        banners: banners,
        success: true,
        message: "All Banners fetched successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch banners",
        success: false,
        message: "Failed to fetch banners",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const BannerRepo = appDataSource.getRepository(Banner);
      const banner = await BannerRepo.findOne({ where: { id: parsedId } });

      if (!banner) {
        return res.status(404).json({
          error: "Banner not found",
          success: false,
          message: "Banner not found with the provided ID",
        });
      }

      res.status(200).json({
        banner: transformBanner(banner),
        success: true,
        message: "Banner Details fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banner" });
    }
  }

  async create(req: Request, res: Response) {
    try {
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

      const { title, position } = req.body;
      const banner_image = (req as any).files?.banner_image?.[0]?.path.replace(
        /\\/g,
        "/"
      );
      const video = (req as any).files?.video?.[0]?.path.replace(/\\/g, "/");

      const BannerRepo = appDataSource.getRepository(Banner);

      const newBanner = new Banner();
      newBanner.title = title;
      newBanner.position = position;
      newBanner.image = banner_image;
      newBanner.video = video;

      const createdBanner = await BannerRepo.save(newBanner);

      res.status(201).json({
        banner: transformBanner(createdBanner),
        success: true,
        message: "Banner created successfully!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create banner",
        error: error,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const BannerRepo = appDataSource.getRepository(Banner);
      const banner = await BannerRepo.findOne({ where: { id: parsedId } });
      if (!banner) {
        return res.status(404).json({
          error: "Banner not found",
          success: false,
          message: "Banner not found with the provided ID",
        });
      }
      await BannerRepo.remove(banner);
      res.status(200).json({
        success: true,
        message: "Banner deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete banner",
        success: false,
        message: "Failed to delete banner",
      });
    }
  }

  async activateBanner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);

      const BannerRepo = appDataSource.getRepository(Banner);
      const banner = await BannerRepo.findOne({ where: { id: parsedId } });

      if (!banner) {
        return res.status(404).json({
          error: "Banner not found",
          success: false,
          message: "Banner not found with the provided ID",
        });
      }

      banner.active = true;
      const updatedBanner = await BannerRepo.save(banner);

      res.status(200).json({
        success: true,
        message: "Banner activated successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to activate banner",
        success: false,
        message: "Failed to activate banner",
      });
    }
  }

  async deactivateBanner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);

      const BannerRepo = appDataSource.getRepository(Banner);
      const banner = await BannerRepo.findOne({ where: { id: parsedId } });

      if (!banner) {
        return res.status(404).json({
          error: "Banner not found",
          success: false,
          message: "Banner not found with the provided ID",
        });
      }

      banner.active = false;
      const updatedBanner = await BannerRepo.save(banner);

      res.status(200).json({
        success: true,
        message: "Banner deactivated successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to deactivate banner",
        success: false,
        message: "Failed to deactivate banner",
      });
    }
  }
}
