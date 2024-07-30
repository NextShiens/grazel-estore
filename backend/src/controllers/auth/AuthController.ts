import { Request, Response } from "express";
import { validationResult } from "express-validator";
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
import jwt from "jsonwebtoken";
import { User } from "../../entities/Users";
import { Role } from "../../entities/Roles";
import { appDataSource } from "../../config/db";
import { UserHasRole } from "../../entities/UserHasRoles";
import { JWT_SECRET } from "../../config/constants";
import { Profile } from "../../entities/Profiles";
import { StoreProfile } from "../../entities/StoreProfile";
import { NotificationSettings } from "../../entities/NotificationSettings";
const ms = require("ms");

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://ecommerce-backend-api-production-84b3.up.railway.app/api/";

export class AuthController {
  // async register(req: Request, res: Response) {
  //   try {
  //     // Validation Error Handling
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       const result = errors.mapped();

  //       const formattedErrors: Record<string, string[]> = {};
  //       for (const key in result) {
  //         formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
  //           result[key].msg,
  //         ];
  //       }

  //       const errorCount = Object.keys(result).length;
  //       const errorSuffix =
  //         errorCount > 1
  //           ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
  //           : "";

  //       const errorResponse = {
  //         success: false,
  //         message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
  //         errors: formattedErrors,
  //       };

  //       return res.status(400).json(errorResponse);
  //     }

  //     const { username, email, password, phone, role } = req.body;

  //     const userRepository = appDataSource.getRepository(User);
  //     const roleRepository = appDataSource.getRepository(Role);

  //     const existingUser = await userRepository.findOne({ where: { email } });
  //     if (existingUser) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "This email is already registered!",
  //       });
  //     }

  //     const hashedPassword = await bcrypt.hash(password, 10);

  //     const newUser = new User();
  //     newUser.username = username;
  //     newUser.email = email;
  //     newUser.password = hashedPassword;

  //     const newProfile = new Profile();
  //     newProfile.phone = phone;
  //     newUser.profile = newProfile;

  //     const userRole = await roleRepository.findOne({
  //       where: { name: role },
  //     });
  //     if (!userRole) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Invalid role!",
  //       });
  //     }

  //     const userHasRole = new UserHasRole();
  //     userHasRole.user = newUser;
  //     userHasRole.role = userRole;

  //     await appDataSource.manager.save(newUser);
  //     await appDataSource.manager.save(userHasRole);

  //     // If the role is 'seller', create a StoreProfile
  //     let storeProfile = null;
  //     if (role === "seller") {
  //       const newStoreProfile = new StoreProfile();
  //       newStoreProfile.user = newUser; // Associate StoreProfile with the new user

  //       storeProfile = await appDataSource.manager.save(newStoreProfile);
  //     }

  //     const expiresInOneDay = ms("3d");

  //     const token = jwt.sign({ userId: newUser.id, role: role }, JWT_SECRET, {
  //       expiresIn: expiresInOneDay / 1000,
  //     });

  //     const { password: _, ...userWithoutPassword } = newUser;

  //     // Remove user details from storeProfile before sending response
  //     const storeProfileResponse = storeProfile
  //       ? {
  //           id: storeProfile.id,
  //           store_name: storeProfile.store_name,
  //           store_image: storeProfile.store_image,
  //           store_description: storeProfile.store_description,
  //           account_name: storeProfile.account_name,
  //           account_number: storeProfile.account_number,
  //           bank_name: storeProfile.bank_name,
  //           bank_code: storeProfile.bank_code,
  //           created_at: storeProfile.created_at,
  //           updated_at: storeProfile.updated_at,
  //         }
  //       : null;

  //     res.status(201).json({
  //       token: token,
  //       user: {
  //         ...userWithoutPassword,
  //         role: role,
  //         ...(role === "seller" && { store_profile: storeProfileResponse }),
  //         // store_profile: storeProfileResponse,
  //       },
  //       success: true,
  //       message: "User registered and logged in successfully!",
  //     });
  //   } catch (error: any) {
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to register user",
  //       error: error.message,
  //     });
  //   }
  // }

  // async  register(req: Request, res: Response) {
  //   try {
  //     // Validation Error Handling
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       const result = errors.mapped();

  //       const formattedErrors: Record<string, string[]> = {};
  //       for (const key in result) {
  //         formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
  //           result[key].msg,
  //         ];
  //       }

  //       const errorCount = Object.keys(result).length;
  //       const errorSuffix =
  //         errorCount > 1
  //           ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
  //           : "";

  //       const errorResponse = {
  //         success: false,
  //         message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
  //         errors: formattedErrors,
  //       };

  //       return res.status(400).json(errorResponse);
  //     }

  //     const { username, email, password, phone, role } = req.body;

  //     const userRepository = appDataSource.getRepository(User);
  //     const roleRepository = appDataSource.getRepository(Role);

  //     const existingUser = await userRepository.findOne({ where: { email } });
  //     if (existingUser) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "This email is already registered!",
  //       });
  //     }

  //     const hashedPassword = await bcrypt.hash(password, 10);

  //     const newUser = new User();
  //     newUser.username = username;
  //     newUser.email = email;
  //     newUser.password = hashedPassword;

  //     const newProfile = new Profile();
  //     newProfile.phone = phone;
  //     newUser.profile = newProfile;

  //     const userRole = await roleRepository.findOne({
  //       where: { name: role },
  //     });
  //     if (!userRole) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Invalid role!",
  //       });
  //     }

  //     const userHasRole = new UserHasRole();
  //     userHasRole.user = newUser;
  //     userHasRole.role = userRole;

  //     // Create and associate notification settings
  //     const newNotificationSettings = new NotificationSettings();
  //     newNotificationSettings.user = newUser;
  //     newUser.notification_settings = newNotificationSettings;

  //     await appDataSource.manager.save(newUser);
  //     await appDataSource.manager.save(userHasRole);

  //     // If the role is 'seller', create a StoreProfile
  //     let storeProfile = null;
  //     if (role === "seller") {
  //       const newStoreProfile = new StoreProfile();
  //       newStoreProfile.user = newUser; // Associate StoreProfile with the new user

  //       storeProfile = await appDataSource.manager.save(newStoreProfile);
  //     }

  //     const expiresInOneDay = ms("3d");

  //     const token = jwt.sign({ userId: newUser.id, role: role }, JWT_SECRET, {
  //       expiresIn: expiresInOneDay / 1000,
  //     });

  //     const { password: _, ...userWithoutPassword } = newUser;

  //     // Remove user details from storeProfile before sending response
  //     const storeProfileResponse = storeProfile
  //       ? {
  //           id: storeProfile.id,
  //           store_name: storeProfile.store_name,
  //           store_image: storeProfile.store_image,
  //           store_description: storeProfile.store_description,
  //           account_name: storeProfile.account_name,
  //           account_number: storeProfile.account_number,
  //           bank_name: storeProfile.bank_name,
  //           bank_code: storeProfile.bank_code,
  //           created_at: storeProfile.created_at,
  //           updated_at: storeProfile.updated_at,
  //         }
  //       : null;

  //     res.status(201).json({
  //       token: token,
  //       user: {
  //         ...userWithoutPassword,
  //         role: role,
  //         ...(role === "seller" && { store_profile: storeProfileResponse }),
  //       },
  //       success: true,
  //       message: "User registered and logged in successfully!",
  //     });
  //   } catch (error: any) {
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to register user",
  //       error: error.message,
  //     });
  //   }
  // }

  async register(req: Request, res: Response) {
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

      const { username, email, password, phone, role } = req.body;

      const userRepository = appDataSource.getRepository(User);
      const roleRepository = appDataSource.getRepository(Role);
      const notificationSettingsRepository =
        appDataSource.getRepository(NotificationSettings);

      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "This email is already registered!",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User();
      newUser.username = username;
      newUser.email = email;
      newUser.password = hashedPassword;

      const newProfile = new Profile();
      newProfile.phone = phone;
      newUser.profile = newProfile;

      const userRole = await roleRepository.findOne({
        where: { name: role },
      });
      if (!userRole) {
        return res.status(400).json({
          success: false,
          message: "Invalid role!",
        });
      }

      const userHasRole = new UserHasRole();
      userHasRole.user = newUser;
      userHasRole.role = userRole;

      await appDataSource.manager.save(newUser);
      await appDataSource.manager.save(userHasRole);

      // Create and associate notification settings
      const newNotificationSettings = new NotificationSettings();
      newNotificationSettings.user = newUser;
      await notificationSettingsRepository.save(newNotificationSettings);

      // If the role is 'seller', create a StoreProfile
      let storeProfile = null;
      if (role === "seller") {
        const newStoreProfile = new StoreProfile();
        newStoreProfile.user = newUser; // Associate StoreProfile with the new user

        storeProfile = await appDataSource.manager.save(newStoreProfile);
      }

      const expiresInOneDay = ms("3d");

      const token = jwt.sign({ userId: newUser.id, role: role }, JWT_SECRET, {
        expiresIn: expiresInOneDay / 1000,
      });

      const { password: _, ...userWithoutPassword } = newUser;

      // Remove user details from storeProfile before sending response
      const storeProfileResponse = storeProfile
        ? {
            id: storeProfile.id,
            store_name: storeProfile.store_name,
            store_image: storeProfile.store_image,
            store_description: storeProfile.store_description,
            account_name: storeProfile.account_name,
            account_number: storeProfile.account_number,
            bank_name: storeProfile.bank_name,
            bank_code: storeProfile.bank_code,
            created_at: storeProfile.created_at,
            updated_at: storeProfile.updated_at,
          }
        : null;

      res.status(201).json({
        token: token,
        user: {
          ...userWithoutPassword,
          role: role,
          ...(role === "seller" && { store_profile: storeProfileResponse }),
        },
        success: true,
        message: "User registered and logged in successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to register user",
        error: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
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

      const { email, password } = req.body;
      const userRepository = appDataSource.getRepository(User);
      const userHasRoleRepository = appDataSource.getRepository(UserHasRole);

      const user = await userRepository.findOne({
        where: { email },
        relations: ["profile"],
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password!",
        });
      }

      if (!user.active) {
        return res.status(403).json({
          success: false,
          message: "Your account is deactivated!",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password!",
        });
      }

      // Fetch user's role
      const userRoleRelation = await userHasRoleRepository.findOne({
        where: { user: { id: user.id } },
        relations: ["role"],
      });

      if (!userRoleRelation) {
        return res.status(500).json({
          success: false,
          message: "User role not found!",
        });
      }

      const userRole = userRoleRelation.role.name;

      const expiresInOneDay = ms("3d");

      const token = jwt.sign({ userId: user.id, role: userRole }, JWT_SECRET, {
        expiresIn: expiresInOneDay / 1000,
      });

      // Prefix the base URL to the profile image if it exists
      if (user.profile && user.profile.image) {
        user.profile.image = `${BASE_URL}${user.profile.image}`;
      }

      // Exclude the password field from the response
      const { password: _, ...userWithoutPassword } = user;

      let storeProfileResponse = null;

      // If user role is seller, fetch the store profile
      if (userRole === "seller") {
        const storeProfileRepository =
          appDataSource.getRepository(StoreProfile);
        const storeProfile = await storeProfileRepository.findOne({
          where: { user: { id: user.id } },
        });

        if (storeProfile) {
          storeProfileResponse = {
            id: storeProfile.id,
            store_name: storeProfile.store_name,
            store_image: storeProfile.store_image,
            store_description: storeProfile.store_description,
            account_name: storeProfile.account_name,
            account_number: storeProfile.account_number,
            bank_name: storeProfile.bank_name,
            bank_code: storeProfile.bank_code,
            created_at: storeProfile.created_at,
            updated_at: storeProfile.updated_at,
          };
        }
      }

      res.status(200).json({
        token: token,
        user: {
          ...userWithoutPassword,
          role: userRole,
          ...(userRole === "seller" && { store_profile: storeProfileResponse }),
        },
        success: true,
        message: "Logged in successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to log in",
        error: error.message,
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
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

      const { email } = req.body;
      const userRepository = appDataSource.getRepository(User);

      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Email not found!",
        });
      }

      const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT as string, 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const resetUrl = `http://yourapp.com/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: '"Grazle" <no-reply@yourapp.com>',
        to: email,
        subject: "Password Reset",
        text: `You requested a password reset. Use the following link to reset your password: ${resetUrl}`,
        html: `<p>You requested a password reset. Use the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: "Password reset email sent!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
        error: error.message,
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
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

      const { new_password } = req.body;
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required!",
        });
      }

      const decoded = jwt.verify(token as string, JWT_SECRET) as {
        userId: number;
      };
      const userId = decoded.userId;

      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid token!",
        });
      }

      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      user.password = hashedNewPassword;

      await userRepository.save(user);

      res.status(200).json({
        success: true,
        message: "Password reset successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to reset password",
        error: error.message,
      });
    }
  }

  async activateAccount(req: Request, res: Response) {
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

      const { email, password } = req.body;
      const userRepository = appDataSource.getRepository(User);

      // Fetch user by email
      const user = await userRepository.findOne({
        where: { email },
        relations: ["profile"],
      });

      // Check if user exists
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password!",
        });
      }

      // Check if password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password!",
        });
      }

      // Check if user account is already active
      if (user.active) {
        return res.status(200).json({
          success: true,
          message: "Your account is already activated!",
        });
      }

      // Activate user account
      user.active = true;
      await userRepository.save(user);

      // Send success response
      res.status(200).json({
        success: true,
        message: "Your account has been activated!",
      });
    } catch (error: any) {
      console.error("Error activating account:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to activate account",
        error: error.message,
      });
    }
  }
}
