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

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const parsedId = parseInt(id, 10);
  
      // Validate the status value
      const validStatuses = ["completed", "reject"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status value",
          success: false,
          message: "Status must be either 'completed' or 'reject'",
        });
      }
  
      const creditLimitRequestRepo = appDataSource.getRepository(CreditLimitRequest);
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
        request: updatedRequest,
        success: true,
        message: "Credit limit request status updated successfully!",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update credit limit request status" });
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
