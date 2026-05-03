import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer for saving
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