import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Banner } from "../../entities/Banners";

const BASE_URL = process.env.IMAGE_PATH || "https://api.grazle.co.in/";

export class BannerController {
  async getBannersByPosition(req: Request, res: Response) {
    try {
      const { position, type } = req.params;
      const parsedPosition = parseInt(position, 10);

      const BannerRepo = appDataSource.getRepository(Banner);
      const banners = await BannerRepo.find({
        where: { position: parsedPosition, active: true, type: type as any },
      });

      // Attach base URL to image and video fields
      const bannersWithBaseUrl = banners.map((banner) => ({
        ...banner,
        image: banner.image ? `${BASE_URL}${banner.image}` : null,
        video: banner.video ? `${BASE_URL}${banner.video}` : null,
      }));

      res.status(200).json({
        banners: bannersWithBaseUrl,
        success: true,
        message: `Active Banners fetched successfully for position ${parsedPosition} and type ${type}`,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch active banners by position and type",
        success: false,
        message: "Failed to fetch active banners by position and type",
      });
    }
  }
}
