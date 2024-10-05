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
import axios from "axios";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const BASE_URL = process.env.IMAGE_PATH || "https://api.grazle.co.in/";

export class AuthController {
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

      const expiresInOneDay = ms("14d");

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
            store_image: storeProfile.store_image
              ? `${BASE_URL}${storeProfile.store_image}`
              : storeProfile.store_image,
            store_about: storeProfile.store_about,
            store_description: storeProfile.store_description,
            store_url: storeProfile.store_url,
            business_license: storeProfile.business_license
              ? `${BASE_URL}${storeProfile.business_license}`
              : storeProfile.business_license,
            tax_id: storeProfile.tax_id
              ? `${BASE_URL}${storeProfile.tax_id}`
              : storeProfile.tax_id,
            proof_of_address: storeProfile.proof_of_address
              ? `${BASE_URL}${storeProfile.proof_of_address}`
              : storeProfile.proof_of_address,
            gst: storeProfile.gst,
            pan: storeProfile.pan,
            pin_code: storeProfile.pin_code,
            city: storeProfile.city,
            state: storeProfile.state,
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

  async registerSeller(req: Request, res: Response) {
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
        username,
        email,
        password,
        phone,
        city,
        state,
        pin_code,
        store_about,
        store_name,
        gst,
        pan,
        store_description,
        store_url,
        account_name,
        account_number,
        bank_code,
        bank_name,
      } = req.body;

      const store_image = (req as any).files?.store_image?.[0]?.path.replace(
        /\\/g,
        "/"
      );
      const business_license = (
        req as any
      ).files?.business_license?.[0]?.path.replace(/\\/g, "/");
      const tax_id = (req as any).files?.tax_id?.[0]?.path.replace(/\\/g, "/");
      const proof_of_address = (
        req as any
      ).files?.proof_of_address?.[0]?.path.replace(/\\/g, "/");

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
        where: { name: "seller" },
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

      const newStoreProfile = new StoreProfile();
      newStoreProfile.user = newUser;
      newStoreProfile.city = city;
      newStoreProfile.state = state;
      newStoreProfile.pin_code = pin_code;
      newStoreProfile.store_about = store_about;
      newStoreProfile.store_name = store_name;
      newStoreProfile.business_license = business_license;
      newStoreProfile.tax_id = tax_id;
      newStoreProfile.proof_of_address = proof_of_address;
      newStoreProfile.store_image = store_image;
      newStoreProfile.gst = gst;
      newStoreProfile.pan = pan;
      newStoreProfile.store_description = store_description;
      newStoreProfile.store_url = store_url;
      newStoreProfile.account_name = account_name;
      newStoreProfile.account_number = account_number;
      newStoreProfile.bank_code = bank_code;
      newStoreProfile.bank_name = bank_name;
      storeProfile = await appDataSource.manager.save(newStoreProfile);

      const expiresInOneDay = ms("3d");

      const token = jwt.sign(
        { userId: newUser.id, role: "seller" },
        JWT_SECRET,
        {
          expiresIn: expiresInOneDay / 1000,
        }
      );

      const { password: _, ...userWithoutPassword } = newUser;

      // Remove user details from storeProfile before sending response
      const storeProfileResponse = storeProfile
        ? {
            id: storeProfile.id,
            store_name: storeProfile.store_name,
            store_image: storeProfile.store_image
              ? `${BASE_URL}${storeProfile.store_image}`
              : storeProfile.store_image,
            store_about: storeProfile.store_about,
            store_description: storeProfile.store_description,
            store_url: storeProfile.store_url,
            business_license: storeProfile.business_license
              ? `${BASE_URL}${storeProfile.business_license}`
              : storeProfile.business_license,
            tax_id: storeProfile.tax_id
              ? `${BASE_URL}${storeProfile.tax_id}`
              : storeProfile.tax_id,
            proof_of_address: storeProfile.proof_of_address
              ? `${BASE_URL}${storeProfile.proof_of_address}`
              : storeProfile.proof_of_address,
            gst: storeProfile.gst,
            pan: storeProfile.pan,
            pin_code: storeProfile.pin_code,
            city: storeProfile.city,
            state: storeProfile.state,
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
          role: "seller",
          store_profile: storeProfileResponse,
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
        host: "smtp.hostinger.com",
        port: 465,
        auth: {
          user: "info@grazle.co.in",
          pass: "Hemant@12#%$#^5q26",
        },
      });

      const resetUrl = `https://grazle.co.in/ResetPassword?token=${resetToken}`;

      const mailOptions = {
        from: '"Grazle" <info@grazle.co.in>',
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

  async googleLogin(req: Request, res: Response) {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Google access token is required",
      });
      return;
    }

    try {
      // Verify the token with Google
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error("Token payload is invalid");
      }

      // Extract user info from payload
      const { sub: googleId, name, email, picture } = payload;

      // Check if user exists in the database
      const userRepository = appDataSource.getRepository(User);
      const roleRepository = appDataSource.getRepository(Role);
      let user = await userRepository.findOne({
        where: { email },
        relations: ["profile"],
      });

      if (!user) {
        // Create a new user if not found
        user = new User();
        user.google_id = googleId;
        user.username = name || "";
        user.email = email || "";
        user.password = ""; // No password for Google login
        user.active = true;

        // Create and associate a profile for the user
        const userProfile = new Profile();
        userProfile.first_name = name?.split(" ")[0] || "";
        userProfile.last_name = name?.split(" ")[1] || "";
        userProfile.image = picture || "";
        user.profile = userProfile;

        await appDataSource.manager.save(user);

        const userRole = await roleRepository.findOne({
          where: { name: "buyer" },
        });
        if (!userRole) {
          return res.status(400).json({
            success: false,
            message: "Invalid role!",
          });
        }

        const userHasRole = new UserHasRole();
        userHasRole.user = user;
        userHasRole.role = userRole;

        await appDataSource.manager.save(user);
        await appDataSource.manager.save(userHasRole);
      }

      const expiresInOneDay = ms("14d");

      const jwt_token = jwt.sign(
        { userId: user.id, role: "buyer" },
        JWT_SECRET,
        {
          expiresIn: expiresInOneDay / 1000,
        }
      );

      // Respond with user data and token
      res.status(200).json({
        success: true,
        message: "User logged in with google successfully!",
        token: jwt_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          profile: user.profile,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to authenticate user",
        error: error.message,
      });
    }
  }
}
