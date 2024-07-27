import { Request, Response } from "express";
import { CreditLimitRequest } from "../../entities/CreditLimitRequest";
import { appDataSource } from "../../config/db";
import { validationResult } from "express-validator";

const omitTimestamps = (creditLimitRequest: CreditLimitRequest) => {
  const { created_at, updated_at, ...rest } = creditLimitRequest;
  return rest;
};

export class CreditLimitRequestController {
  async getAll(req: Request, res: Response) {
    try {
      const creditLimitRequestRepo =
        appDataSource.getRepository(CreditLimitRequest);
      const requests = await creditLimitRequestRepo.find();

      const requestsWithoutTimestamps = requests.map(omitTimestamps);

      res.status(200).json({
        request: requestsWithoutTimestamps,
        success: true,
        message: "All credit limit requests fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch credit limit requests" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const creditLimitRequestRepo =
        appDataSource.getRepository(CreditLimitRequest);
      const request = await creditLimitRequestRepo.findOne({
        where: { id: parsedId },
      });

      if (!request) {
        return res.status(404).json({
          error: "Credit Limit Request not found",
          success: false,
          message: "Credit Limit Request not found with the provided ID",
        });
      }

      res.status(200).json({
        request: omitTimestamps(request),
        success: true,
        message: "Request Details fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch credit limit request" });
    }
  }

  async create(req: Request, res: Response) {
    const creditReq = req.body;

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

      const {
        shop_name,
        phone_number,
        email,
        shop_address,
        aadhar_card,
        pin_card_number,
      } = req.body;

      const creditLimitRequestRepo = await appDataSource.getRepository(
        CreditLimitRequest
      );

      // Check if email already exists
      const existingRequest = await creditLimitRequestRepo.findOneBy({ email });
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: "This email is already associated with an existing request.",
          errors: { email: ["This email is already given with a request."] },
        });
      }

      const newRequest = new CreditLimitRequest();
      newRequest.shop_name = shop_name;
      newRequest.phone_number = phone_number;
      newRequest.email = email;
      newRequest.shop_address = shop_address;
      newRequest.aadhar_card = aadhar_card;
      newRequest.pin_card_number = pin_card_number;

      const createdRequest = await creditLimitRequestRepo.save(newRequest);
      res.status(201).json({
        request: omitTimestamps(createdRequest),
        success: true,
        message: "Credit limit request created successfully!",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to create credit limit request",
        success: false,
        message: "Failed to create credit limit request",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const parsedId = parseInt(id, 10);
      const creditLimitRequestRepo =
        appDataSource.getRepository(CreditLimitRequest);
      const existingRequest = await creditLimitRequestRepo.findOne({
        where: { id: parsedId },
      });

      if (!existingRequest) {
        return res.status(404).json({
          error: "Credit Limit Request not found",
          success: false,
          message: "Credit Limit Request not found with the provided ID",
        });
      }

      existingRequest.status = status;
      const updatedRequest = await creditLimitRequestRepo.save(existingRequest);
      res.json({
        request: omitTimestamps(updatedRequest),
        success: true,
        message: "Credit limit request updated successfully!",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update credit limit request status" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const creditLimitRequestRepo =
        appDataSource.getRepository(CreditLimitRequest);
      const request = await creditLimitRequestRepo.findOne({
        where: { id: parsedId },
      });

      if (!request) {
        return res.status(404).json({
          error: "Credit Limit Request not found",
          success: false,
          message: "Credit Limit Request not found with the provided ID",
        });
      }

      await creditLimitRequestRepo.remove(request);
      res.json({
        success: true,
        message: "Credit limit request deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete credit limit request" });
    }
  }
}
