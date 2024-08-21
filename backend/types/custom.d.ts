// src/types/custom.d.ts

import { Request } from "express";

declare module "express" {
  export interface Request {
    files?: {
      featured_image?: {
        [key: string]: any;
      }[];
      gallery_images?: {
        [key: string]: any;
      }[];
    };
  }
}
