import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Feedback } from "../../entities/Feedback";

export class FeedbackController {
  async getAll(req: Request, res: Response) {
    try {
      const feedbackRepo = appDataSource.getRepository(Feedback);
      const feedbacks = await feedbackRepo.find();

      res.status(200).json({
        feedbacks: feedbacks,
        success: true,
        message: "All feedbacks fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedbacks" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const feedbackRepo = appDataSource.getRepository(Feedback);
      const request = await feedbackRepo.findOne({
        where: { id: parsedId },
      });

      if (!request) {
        return res.status(404).json({
          error: "Feedback not found",
          success: false,
          message: "Feedback not found with the provided ID",
        });
      }

      res.status(200).json({
        feedback: request,
        success: true,
        message: "Feedback details fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const feedbackRepo =
        appDataSource.getRepository(Feedback);
      const request = await feedbackRepo.findOne({
        where: { id: parsedId },
      });

      if (!request) {
        return res.status(404).json({
          error: "Feedback not found",
          success: false,
          message: "Feedback not found with the provided ID",
        });
      }

      await feedbackRepo.remove(request);
      res.json({
        success: true,
        message: "Feedback deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete Feedback" });
    }
  }
}
