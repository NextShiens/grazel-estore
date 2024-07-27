import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants";
import { User } from "../entities/Users";
import { appDataSource } from "../config/db";

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({
      success: false,
      message: "Unauthorized!",
    });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      console.log("Token verification failed", err);
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid token",
      });
    }

    try {
     

      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
        relations: ["profile"],
      });

      if (!user) {
        console.log("User not found");
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      const userRole = decoded.role;

      if (userRole !== "admin") {
        console.log("User does not have admin role");
        return res.status(403).json({
          success: false,
          message: "Forbidden: User does not have admin role",
        });
      }

      // Attach user to the request object directly
      (req as any).user = user;

      next();
    } catch (error: any) {
      console.log("Error fetching user:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to authenticate user",
        error: error.message,
      });
    }
  });
};
