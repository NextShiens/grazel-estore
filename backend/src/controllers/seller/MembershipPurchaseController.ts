import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { UserMembership } from "../../entities/UserMembership";
import { MembershipPlan } from "../../entities/MembershipPlan";
import { User } from "../../entities/Users";
import { validationResult } from "express-validator";
import { Product } from "../../entities/Product";
import { In } from "typeorm";
import { ProductVariant } from "../../entities/ProductVariant";

export class UserMembershipController {
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

  async purchaseMembership(req: Request, res: Response) {
    try {
      const getUser = (req as any).user;
      const userId = getUser.id;

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

      const { membership_plan_id } = req.body;

      const userRepo = appDataSource.getRepository(User);
      const membershipPlanRepo = appDataSource.getRepository(MembershipPlan);
      const userMembershipRepo = appDataSource.getRepository(UserMembership);

      // Check if user exists
      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if membership plan exists
      const membershipPlan = await membershipPlanRepo.findOne({
        where: { id: membership_plan_id },
      });
      if (!membershipPlan) {
        return res.status(404).json({
          success: false,
          message: "Membership plan not found",
        });
      }

      // Check if user already has an active membership
      const activeMembership = await userMembershipRepo.findOne({
        where: { user: { id: userId }, is_active: true },
      });
      if (activeMembership) {
        return res.status(400).json({
          success: false,
          message: "User already has an active membership",
        });
      }

      // Calculate start and end date
      // const startDate = new Date();
      // const endDate = new Date();
      // endDate.setMonth(endDate.getMonth() + membershipPlan.duration_months);

      // Create new membership
      const newMembership = new UserMembership();
      newMembership.user = user;
      newMembership.membership_plan = membershipPlan;
      // newMembership.start_date = startDate;
      // newMembership.end_date = endDate;
      newMembership.payment_status = "notpaid"; // Update to "paid" after payment confirmation

      const createdMembership = await userMembershipRepo.save(newMembership);
      res.status(201).json({
        membership: createdMembership,
        success: true,
        message: "Membership created successfully!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to purchase membership",
        error: error,
      });
    }
  }

  async confirmPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;

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

      const { transaction_id, payment_status } = req.body;

      const userMembershipRepo = appDataSource.getRepository(UserMembership);
      const membershipPlanRepo = appDataSource.getRepository(MembershipPlan);

      // Find membership by id and load the membership_plan relation
      const membership = await userMembershipRepo.findOne({
        where: { id: parseInt(id, 10) },
        relations: ["membership_plan"], // Load the membership_plan relation
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: "Membership not found",
        });
      }

      const membershipPlan = membership.membership_plan;
      if (!membershipPlan) {
        return res.status(404).json({
          success: false,
          message: "Membership plan not found",
        });
      }

      // Calculate start and end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + membershipPlan.duration_months);

      // Update payment status to "paid"
      membership.transaction_id = transaction_id;
      membership.payment_status = payment_status;
      if (payment_status === "paid") {
        membership.is_active = true;
        membership.start_date = startDate;
        membership.end_date = endDate;
        membership.status = "active";
      } else {
        membership.is_active = false;
      }

      await userMembershipRepo.save(membership);

      res.status(200).json({
        success: true,
        message: "Payment status updated successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update payment",
        error: error.message,
      });
    }
  }

  async getUserMemberships(req: Request, res: Response) {
    try {
      const getUser = (req as any).user;
      const id = getUser.id;

      const userMembershipRepo = appDataSource.getRepository(UserMembership);

      // Find memberships by user ID
      const memberships = await userMembershipRepo.find({
        where: { user: { id: parseInt(id, 10) } },
        relations: ["membership_plan"],
      });

      if (!memberships || memberships.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No memberships found for the user",
        });
      }

      res.status(200).json({
        success: true,
        memberships: memberships,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch user memberships",
        error: error,
      });
    }
  }

  async getActiveMembershipByUserId(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const userMembershipRepo = appDataSource.getRepository(UserMembership);

      // Find active membership by user ID
      const activeMembership = await userMembershipRepo.findOne({
        where: { user: { id: parseInt(userId, 10) }, is_active: true },
        relations: ["membership_plan"],
      });

      if (!activeMembership) {
        return res.status(404).json({
          success: false,
          message: "No active membership found for the seller",
        });
      }

      res.status(200).json({
        success: true,
        membership_plan: activeMembership.membership_plan,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch active membership",
        error: error,
      });
    }
  }

  async applyMembership(req: Request, res: Response) {
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

      // Parse the product_ids, quantities, and variant_ids from JSON strings to arrays
      const product_ids = JSON.parse(req.body.product_ids);
      const quantities = JSON.parse(req.body.quantities);
      const variant_ids = JSON.parse(req.body.variant_ids); // Assuming this is passed from client

      const productRepo = appDataSource.getRepository(Product);
      const userMembershipRepo = appDataSource.getRepository(UserMembership);
      const variantRepo = appDataSource.getRepository(ProductVariant);

      // Fetch products by IDs using In operator
      const products = await productRepo.find({
        where: { id: In(product_ids) },
        relations: ["offer", "variants"],
      });

      if (!products || products.length !== product_ids.length) {
        return res.status(404).json({
          success: false,
          message: "Some products not found",
        });
      }

      // Fetch variants for products if variant_ids are provided
      const variants =
        variant_ids && variant_ids.length > 0
          ? await variantRepo.find({
              where: { id: In(variant_ids) },
            })
          : [];

      // Calculate base_total
      let base_total = 0;
      const productMap = new Map<number, Product>(
        products.map((p) => [p.id, p])
      );
      const variantMap = new Map<number, ProductVariant>(
        variants.map((v) => [v.id, v])
      );

      for (let i = 0; i < product_ids.length; i++) {
        const product = productMap.get(product_ids[i]);
        const variantId = variant_ids[i];

        if (!product) continue;

        let price = product.price;

        if (variantId) {
          const variant = variantMap.get(variantId);
          if (variant) {
            price = variant.price || product.price; // Fallback to product price if variant price is not set
          }
        }

        base_total += price * quantities[i];
      }

      // Calculate subtotal after applying offer discounts
      let subtotalAfterOffer = 0;
      const productsWithOffer = products.map((product, index) => {
        let finalPrice = product.price;
        if (product.offer) {
          if (product.offer.discount_type === "percentage") {
            finalPrice =
              product.price -
              (product.price * product.offer.discount_value) / 100;
          } else if (product.offer.discount_type === "fixed") {
            finalPrice = product.price - product.offer.discount_value;
          }
        }

        // Check if there's a variant price
        const variantId = variant_ids[index];
        if (variantId) {
          const variant = variantMap.get(variantId);
          if (variant) {
            finalPrice = variant.price || finalPrice; // Use variant price if available
          }
        }

        subtotalAfterOffer += finalPrice * quantities[index];
        return {
          ...product,
          finalPrice,
          quantity: quantities[index],
        };
      });

      if (subtotalAfterOffer < 5000) {
        return res.status(400).json({
          success: false,
          message:
            "Subtotal after offers must be at least 5000 to apply membership",
        });
      }

      // Find active membership by user ID
      const activeMembership = await userMembershipRepo.findOne({
        where: { user: { id: parseInt(userId, 10) }, is_active: true },
        relations: ["membership_plan"],
      });

      if (!activeMembership) {
        return res.status(404).json({
          success: false,
          message: "No active membership found for the user",
        });
      }

      // Apply membership discount to each product
      const membershipDiscount = activeMembership.membership_plan.discount;
      const discountedProducts = productsWithOffer.map((product) => {
        const discountedPrice =
          product.finalPrice - (product.finalPrice * membershipDiscount) / 100;
        return {
          ...product,
          subscription_plan_discount_applied: discountedPrice,
        };
      });

      // Calculate discounted subtotal after membership discount
      let discountedSubtotal = 0;
      for (const product of discountedProducts) {
        discountedSubtotal +=
          product.subscription_plan_discount_applied * product.quantity;
      }

      res.status(200).json({
        success: true,
        message: "Membership discount applied successfully",
        base_total: base_total,
        offer_applied_subtotal: subtotalAfterOffer,
        member_plan_applied_subtotal: discountedSubtotal,
        products: discountedProducts,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to apply membership",
        error: error.message,
      });
    }
  }
}
