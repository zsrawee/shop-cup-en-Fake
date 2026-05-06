import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { isMock } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (isMock) {
      console.warn("⚠️ [MOCK] Bypassing Cloudinary upload. Returning dummy URL.");
      // Return a random dummy image from Unsplash
      const dummyUrl = `https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=500&sig=${Math.random()}`;
      return NextResponse.json({ url: dummyUrl });
    }

    // Convert file to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload via Stream to Cloudinary
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "shop_cup" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: imageUrl });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}