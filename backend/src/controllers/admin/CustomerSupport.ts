import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { CustomerSupportMessage } from "../../entities/CustomerSupport";

export class CustomerSupportAdmin {
  async getAll(req: Request, res: Response) {
    try {
      const customerSupportRepo = appDataSource.getRepository(
        CustomerSupportMessage
      );
      const customerSupportMessages = await customerSupportRepo.find();

      return res.json({
        support_messages: customerSupportMessages,
        success: true,
        message: "All customer support message fetched successfully",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch customer support messages" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);

      const customerSupportRepo = appDataSource.getRepository(
        CustomerSupportMessage
      );

      const customerSupportMessage = await customerSupportRepo.findOne({
        where: { id: parsedId },
      });

      if (!customerSupportMessage) {
        return res.status(404).json({
          error: "Customer Support Message not found",
          success: false,
          message: "Customer Support Message not found with the provided ID",
        });
      }

      res.status(200).json({
        address: customerSupportMessage,
        success: true,
        message: "Customer Support Message Details fetched successfully",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch Customer Support Message" });
    }
  }
}
