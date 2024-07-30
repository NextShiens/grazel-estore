import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { validationResult } from "express-validator";
import { Feedback } from "../../entities/Feedback";

export class FeedbackController {
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

      const { name, email, subject, message } = req.body;

      const feedbackRepo = appDataSource.getRepository(Feedback);

      // Check if email already exists
      const existingRequest = await feedbackRepo.findOneBy({ email });
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: "This email is already given with a request.",
          errors: { email: ["This email is already given with a request."] },
        });
      }

      const newFeedback = new Feedback();
      newFeedback.name = name;
      newFeedback.email = email;
      newFeedback.subject = subject;
      newFeedback.message = message;

      const createdRequest = await feedbackRepo.save(newFeedback);
      res.status(201).json({
        request: newFeedback,
        success: true,
        message: "Feedback has been sent successfully!",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to sent feedback",
        success: false,
        message: "Failed to sent feedback",
      });
    }
  }
}
