"use server";

import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { deleteImageFromServer } from "./deleteImage";

// Upgrade user to seller
export async function becomeSeller() {
  const session = await auth();
  if (!session?.user?.email) return { error: "You are not authorized" };

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return { error: "User not found" };

  const updateData: any = { role: "seller" };
  
  if (!user.sellerInfo || !user.sellerInfo.storeName) {
    updateData.sellerInfo = {
      storeName: "My New Store",
      description: "",
      isVerified: false,
      rating: 0,
    };
  }

  await User.findByIdAndUpdate(user._id, updateData);

  revalidatePath("/seller/change");
  revalidatePath("/profile");
  return { success: true };
}

// Abandon seller role (requires password)
export async function abandonSellerRole(plainPassword: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "You are not authorized" };

  await connectToDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return { error: "User not found" };

  const isMatch = await bcrypt.compare(plainPassword, user.password);
  if (!isMatch) {
    return { error: "Incorrect password!" };
  }

  // ✅✅ New step: Fetch all seller products to delete their images first
  const sellerProducts = await Product.find({ seller: user._id });
  
  for (const product of sellerProducts) {
    if (product.images && product.images.length > 0) {
      for (const imgUrl of product.images) {
        // Delete each image from the server
        await deleteImageFromServer(imgUrl);
      }
    }
  }

  // Now delete products from the database after cleaning up images
  await Product.deleteMany({ seller: user._id });

  // Revert role to regular user and delete store info
  await User.findByIdAndUpdate(user._id, {
    role: "user",
    $unset: { sellerInfo: "" }, 
  });

  revalidatePath("/seller/change");
  revalidatePath("/profile");
  return { success: true };
}