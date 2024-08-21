import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Offer } from "../../entities/Offer";
import { Product } from "../../entities/Product";
import { appDataSource } from "../../config/db";
import { In } from "typeorm";
import { UserDeviceToken } from "../../entities/UserDeviceToken";
import { sendPushNotification } from "../../services/notificationService";

export class OfferController {
  async createOffer(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

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
        title,
        description,
        discount_type,
        discount_value,
        start_date,
        end_date,
      } = req.body;

      const offerRepository = appDataSource.getRepository(Offer);

      // Create the offer object
      const offer = new Offer();
      offer.user_id = userId;
      offer.name = title;
      offer.description = description;
      offer.discount_type = discount_type;
      offer.discount_value = discount_value;
      offer.start_date = start_date;
      offer.end_date = end_date;
      offer.active = true;

      // Save the offer
      const savedOffer = await offerRepository.save(offer);

      res.status(201).json({
        success: true,
        message: "Offer Created",
        data: savedOffer,
      });
    } catch (error: any) {
      console.error("Error creating offer:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while creating the offer.",
        error: error.message,
      });
    }
  }

  async getOffersByUser(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const offerRepository = appDataSource.getRepository(Offer);

      // Find all offers by user_id
      const offers = await offerRepository.find({
        where: {
          user_id: userId,
        },
        relations: ["products"], // Load related products
      });

      res.status(200).json({
        success: true,
        message: "Offers fetched successfully",
        data: offers,
      });
    } catch (error: any) {
      console.error("Error fetching offers:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching offers.",
        error: error.message,
      });
    }
  }

  async getSingleOfferDetails(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;
      const { id } = req.params;

      const offerRepository = appDataSource.getRepository(Offer);

      // Find the offer by id and user_id, and load related products
      const offer = await offerRepository.findOne({
        where: {
          id: parseInt(id, 10),
          user_id: userId,
        },
        relations: ["products"], // Load related products
      });

      if (!offer) {
        return res.status(404).json({
          success: false,
          message: "Offer not found or you do not have access to this offer.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Offer fetched successfully",
        data: offer,
      });
    } catch (error: any) {
      console.error("Error fetching offer:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching the offer.",
        error: error.message,
      });
    }
  }

  async updateOffer(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;
      const { id } = req.params; // Assuming you pass offer id in the URL params

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
        title,
        description,
        discount_type,
        discount_value,
        start_date,
        end_date,
      } = req.body;

      const offerRepository = appDataSource.getRepository(Offer);

      // Ensure user can update only their own offers
      const offer = await offerRepository.findOne({
        where: {
          id: parseInt(id, 10),
          user_id: userId,
        },
      });

      if (!offer) {
        return res.status(404).json({
          success: false,
          message: "Offer not found",
        });
      }

      // Update offer details
      offer.name = title;
      offer.description = description;
      offer.discount_type = discount_type;
      offer.discount_value = discount_value;
      offer.start_date = start_date;
      offer.end_date = end_date;

      // Save the updated offer
      const updatedOffer = await offerRepository.save(offer);

      res.status(200).json({
        success: true,
        message: "Offer updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating offer:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating the offer.",
        error: error.message,
      });
    }
  }

  async deleteOffer(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;
      const { id } = req.params; // Assuming you pass offer id in the URL params

      const offerRepository = appDataSource.getRepository(Offer);
      const productRepository = appDataSource.getRepository(Product);

      // Ensure user can delete only their own offers
      const offer = await offerRepository.findOne({
        where: {
          id: parseInt(id, 10),
          user_id: userId,
        },
      });

      if (!offer) {
        return res.status(404).json({
          success: false,
          message: "Offer not found or you do not have access to this offer.",
        });
      }

      // Set the offer field to null for all related products
      await productRepository
        .createQueryBuilder()
        .update(Product)
        .set({ offer: null })
        .where("offer_id = :offerId", { offerId: offer.id })
        .execute();

      // Delete the offer
      await offerRepository.remove(offer);

      res.status(200).json({
        success: true,
        message: "Offer deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting offer:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting the offer.",
        error: error.message,
      });
    }
  }

  async applyOffer(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const offerId = parseInt(req.params.offer_id, 10);
      const productId = parseInt(req.body.product_id, 10);
      // Validate offerId presence and validity
      if (isNaN(offerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer_id provided in URL parameters.",
        });
      }

      // Validate productId presence and validity
      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "product_id must be a valid integer.",
        });
      }

      const offerRepository = appDataSource.getRepository(Offer);
      const productRepository = appDataSource.getRepository(Product);
      const deviceTokenRepo = appDataSource.getRepository(UserDeviceToken);

      // Ensure the offer exists and belongs to the user
      const offer = await offerRepository.findOne({
        where: { id: offerId, user_id: userId },
      });

      if (!offer) {
        return res.status(404).json({
          success: false,
          message: "Offer not found or you do not have access to this offer.",
        });
      }

      // Find product by productId belonging to the user
      const product = await productRepository.findOne({
        where: {
          id: productId,
          user_id: userId,
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found or you do not have access to this product.",
        });
      }

      // Apply the offer to the product
      product.offer = offer;
      await productRepository.save(product);

      // Fetch all device tokens
      const deviceTokens = await deviceTokenRepo.find();

      if (deviceTokens.length > 0) {
        // Extract tokens from the records
        const tokens = deviceTokens.map(
          (tokenRecord) => tokenRecord.device_token
        );

        // Send push notification
        const notificationTitle = "Exclusive Offer Available";
        const notificationMessage = `We are excited to inform you that a new offer has been applied to selected products. Explore the latest promotions and take advantage of these exclusive deals today!`;

        await Promise.all(
          tokens.map((token) =>
            sendPushNotification(
              token,
              notificationTitle,
              notificationMessage,
              { Offer: offer.name }
            )
          )
        );
      }

      res.status(200).json({
        success: true,
        message: `Offer applied successfully to product ${product.id}.`,
        data: product,
      });
    } catch (error: any) {
      console.error("Error applying offer:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while applying the offer.",
        error: error.message,
      });
    }
  }

  async applyOfferMultiProducts(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const offerId = parseInt(req.params.offer_id, 10);
      const productIds = JSON.parse(req.body.product_ids);

      // Validate offerId presence and validity
      if (isNaN(offerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer_id provided in URL parameters.",
        });
      }

      // Validate productIds presence and validity
      if (
        !Array.isArray(productIds) ||
        productIds.some((id) => isNaN(parseInt(id, 10)))
      ) {
        return res.status(400).json({
          success: false,
          message: "product_ids must be a valid array of integers.",
        });
      }

      const offerRepository = appDataSource.getRepository(Offer);
      const productRepository = appDataSource.getRepository(Product);
      const deviceTokenRepo = appDataSource.getRepository(UserDeviceToken);

      // Ensure the offer exists and belongs to the user
      const offer = await offerRepository.findOne({
        where: { id: offerId, user_id: userId },
      });

      if (!offer) {
        return res.status(404).json({
          success: false,
          message: "Offer not found or you do not have access to this offer.",
        });
      }

      // Find products by productIds belonging to the user
      const products = await productRepository.find({
        where: {
          id: In(productIds),
          user_id: userId,
        },
      });

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No valid products found or you do not have access to these products.",
        });
      }

      // Apply the offer to each product
      const updatedProducts = [];
      for (const product of products) {
        product.offer = offer;
        await productRepository.save(product);
        updatedProducts.push(product);
      }

      // Fetch all device tokens
      const deviceTokens = await deviceTokenRepo.find();

      if (deviceTokens.length > 0) {
        // Extract tokens from the records
        const tokens = deviceTokens.map(
          (tokenRecord) => tokenRecord.device_token
        );

        // Send push notification
        const notificationTitle = "Exclusive Offer Available";
        const notificationMessage = `We are excited to inform you that a new offer has been applied to selected products. Explore the latest promotions and take advantage of these exclusive deals today!`;

        await Promise.all(
          tokens.map((token) =>
            sendPushNotification(
              token,
              notificationTitle,
              notificationMessage,
              { Offer: offer.name }
            )
          )
        );
      }

      res.status(200).json({
        success: true,
        message: `Offer applied successfully to products.`,
        data: updatedProducts,
      });
    } catch (error: any) {
      console.error("Error applying offer:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while applying the offer.",
        error: error.message,
      });
    }
  }
}
