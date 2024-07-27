import { Request, Response } from "express";
import { validationResult } from "express-validator";
const bcrypt = require("bcrypt");
import fs from "fs";
import path from "path";
import { appDataSource } from "../../config/db";
import { User } from "../../entities/Users";

interface MulterRequest extends Request {
  file?: {
    path: string;
    filename: string;
  };
}

export class ProfileController {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.body.userId; // Extract user ID from token

      // Fetch user profile details along with their role
      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ["profile", "userHasRole", "userHasRole.role"],
      });

      // Check if user exists
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found!",
        });
      }

      // Exclude the password, created_at, and updated_at fields from the response
      const {
        password: _,
        created_at,
        updated_at,
        userHasRole,
        profile: {
          created_at: profile_created_at,
          updated_at: profile_updated_at,
          ...profileWithoutDates
        },
        ...userWithoutPasswordAndDates
      } = user;

      // Extract role name from user's role
      const roleName = user.userHasRole?.role?.name || "Unknown";

      res.status(200).json({
        user: {
          ...userWithoutPasswordAndDates,
          profile: profileWithoutDates,
          role: roleName,
        },
        success: true,
        message: "Profile has been retrieved successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
        error: error.message,
      });
    }
  }

  async editProfile(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const checkReq = req.body;

      const { id } = req.params;
      const { username, email, ...profileFields } = req.body;

      const profileImage = (req as any).file?.path.replace(/\\/g, "/");

      const updatedUserFields: Partial<User> = {};
      if (username) updatedUserFields.username = username;
      if (email) updatedUserFields.email = email;

      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["profile"],
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          success: false,
          message: "User not found with the provided ID",
        });
      }

      Object.assign(user, updatedUserFields);

      if (Object.keys(profileFields).length > 0 && user.profile) {
        Object.assign(user.profile, profileFields);
      }

      if (profileImage) {
        if (user.profile.image) {
          const oldImagePath = path.join(
            __dirname,
            "../../../bucket/user",
            path.basename(user.profile.image)
          );
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log("Old image deleted successfully");
            } else {
              console.log("Old image does not exist");
            }
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
        user.profile.image = profileImage;
      }

      await userRepository.save(user);

      // Construct the response object to exclude certain fields
      const responseUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: {
          id: user.profile.id,
          first_name: user.profile.first_name,
          last_name: user.profile.last_name,
          phone: user.profile.phone,
          country: user.profile.country,
          city: user.profile.city,
          state: user.profile.state,
          // store_name: user.profile.store_name,
          address: user.profile.address,
          active: user.profile.active,
          image: user.profile.image,
          userId: user.profile.user,
        },
      };

      res.status(201).json({
        user: responseUser,
        success: true,
        message: "Profile updated successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  }

  async changePassword(req: Request, res: Response) {
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

      const userId = req.body.userId; // Extract user ID from token

      const { old_password, new_password } = req.body;

      // Fetch user
      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      // Check if user exists
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found!",
        });
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(
        old_password,
        user.password
      );
      if (!isOldPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid old password!",
        });
      }

      // Hash and update the new password
      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      user.password = hashedNewPassword;

      // Save the updated user
      await userRepository.save(user);

      res.status(200).json({
        success: true,
        message: "Password changed successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to change password",
        error: error.message,
      });
    }
  }


}
