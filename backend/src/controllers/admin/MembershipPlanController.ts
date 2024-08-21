import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { appDataSource } from "../../config/db";
import { MembershipPlan } from "../../entities/MembershipPlan";

export class MembershipPlanController {
  // Create Membership Plan
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

      const { name, price, duration_months, discount } = req.body;

      const MembershipPlanRepo = appDataSource.getRepository(MembershipPlan);

      // Check if a membership plan with the same name already exists
      const existingMembershipPlan = await MembershipPlanRepo.findOne({
        where: { name },
      });
      if (existingMembershipPlan) {
        return res.status(400).json({
          success: false,
          message: "Membership plan with this name already exists",
        });
      }

      const newMembershipPlan = new MembershipPlan();
      newMembershipPlan.name = name;
      newMembershipPlan.price = price;
      newMembershipPlan.duration_months = duration_months;
      newMembershipPlan.discount = discount;

      const createdMembershipPlan = await MembershipPlanRepo.save(
        newMembershipPlan
      );
      res.status(201).json({
        membership_plan: createdMembershipPlan,
        success: true,
        message: "Membership plan created successfully!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create membership plan",
        error: error,
      });
    }
  }

  // Get All Membership Plans
  async getAll(req: Request, res: Response) {
    try {
      const MembershipPlanRepo = appDataSource.getRepository(MembershipPlan);
      const membershipPlans = await MembershipPlanRepo.find();
      res.status(200).json({
        success: true,
        message: "Membership plans fetched successfully",
        membership_plans: membershipPlans,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch membership plans",
        error: error,
      });
    }
  }

  // Get Membership Plan By ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const MembershipPlanRepo = appDataSource.getRepository(MembershipPlan);
      const membershipPlan = await MembershipPlanRepo.findOne({
        where: { id: parseInt(id, 10) },
      });

      if (!membershipPlan) {
        return res.status(404).json({
          success: false,
          message: "Membership plan not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Membership plan fetched successfully",
        membership_plan: membershipPlan,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch membership plan",
        error: error,
      });
    }
  }

  // Update Membership Plan
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, price, duration_months, discount } = req.body;

      const MembershipPlanRepo = appDataSource.getRepository(MembershipPlan);
      const membershipPlan = await MembershipPlanRepo.findOne({
        where: { id: parseInt(id, 10) },
      });

      if (!membershipPlan) {
        return res.status(404).json({
          success: false,
          message: "Membership plan not found",
        });
      }

      membershipPlan.name = name;
      membershipPlan.price = price;
      membershipPlan.duration_months = duration_months;
      membershipPlan.discount = discount;

      const updatedMembershipPlan = await MembershipPlanRepo.save(
        membershipPlan
      );

      res.status(200).json({
        membership_plan: updatedMembershipPlan,
        success: true,
        message: "Membership plan updated successfully!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update membership plan",
        error: error,
      });
    }
  }

  // Delete Membership Plan
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const MembershipPlanRepo = appDataSource.getRepository(MembershipPlan);
      const membershipPlan = await MembershipPlanRepo.findOne({
        where: { id: parseInt(id, 10) },
      });

      if (!membershipPlan) {
        return res.status(404).json({
          success: false,
          message: "Membership plan not found",
        });
      }

      await MembershipPlanRepo.remove(membershipPlan);

      res.status(200).json({
        success: true,
        message: "Membership plan deleted successfully!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete membership plan",
        error: error,
      });
    }
  }
}
