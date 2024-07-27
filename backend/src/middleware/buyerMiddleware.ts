import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants";
import { User } from "../entities/Users";
import { appDataSource } from "../config/db";

export const buyerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  // Check if token is missing
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized!",
    });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid token",
      });
    }

    try {
      // Extract user role from the decoded token payload
      const userRole = decoded.role;

      if (userRole !== "buyer") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: User does not have buyer role",
        });
      }

      // Fetch user from database based on the decoded user ID (optional if needed)
      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
        relations: ["profile"], // Adjust relations as necessary
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      // Attach user to the request object directly
      (req as any).user = user;
      next();
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to authenticate user",
        error: error.message,
      });
    }
  });
};
