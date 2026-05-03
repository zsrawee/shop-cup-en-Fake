"use server";

import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

export async function deleteImageFromServer(imageUrl: string) {
  if (!imageUrl) return { success: false, message: "No link provided" };

  try {
    // 1. If the image is from Cloudinary ☁️
    if (imageUrl.includes("cloudinary.com")) {
      const parts = imageUrl.split("/upload/");
      if (parts.length >= 2) {
        let pathPart = parts[1];
        if (pathPart.match(/^v\d+\//)) {
          pathPart = pathPart.replace(/^v\d+\//, "");
        }
        const publicId = pathPart.split(".")[0];
        
        await cloudinary.uploader.destroy(publicId);
        return { success: true };
      }
    }

    // 2. If the image is local (old path starting with /imag/)
    if (imageUrl.startsWith("/imag/")) {
      const absolutePath = path.join(process.cwd(), "public", imageUrl);
      
      try {
        await fs.unlink(absolutePath);
        return { success: true };
      } catch (error: any) {
        if (error.code === "ENOENT") {
          return { success: true, message: "Image does not exist" };
        }
        throw error;
      }
    }

    return { success: false, message: "Image link not supported" };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false, message: "Failed to delete image" };
  }
}