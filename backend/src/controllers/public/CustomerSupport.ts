import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { validationResult } from "express-validator";
import { CustomerSupportMessage } from "../../entities/CustomerSupport";

export class CustomerSupportPublic {
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

      const { name, email, message } = req.body;

      const customerSupportRepo = appDataSource.getRepository(
        CustomerSupportMessage
      );

      const newCustomerSupportMessage = new CustomerSupportMessage();

      newCustomerSupportMessage.name = name;
      newCustomerSupportMessage.email = email;
      newCustomerSupportMessage.message = message;

      const createCustomerSupportMessage = await customerSupportRepo.save(
        newCustomerSupportMessage
      );

      res.status(201).json({
        success: true,
        message: "You message has been sent successfully!",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          success: false,
          error: "Failed to create message request",
          message: error.message,
        });
      } else {
        return res
          .status(500)
          .json({ success: false, error: "Unknown error occurred" });
      }
    }
  }
}
