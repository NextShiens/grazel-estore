import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants";
import { User } from "../entities/Users";
import { appDataSource } from "../config/db";

export const authMiddleware = (
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

  // Verify the token asynchronously
  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid token",
      });
    }

    try {
      // Fetch user from database
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

      // Attach user to the request object
      (req as any).user = user;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  });
};