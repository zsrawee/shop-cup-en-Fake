"use server";

import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { deleteImageFromServer } from "./deleteImage";
import { revalidatePath } from "next/cache";

// Function to check if the user is an admin
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized, you must log in");
  
  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user || user.role !== "admin") throw new Error("Unauthorized, you are not an admin!");
  
  return user;
}

// 1. Delete user via profile link
export async function adminDeleteUser(url: string) {
  await checkAdmin(); // Verify admin

  // Extract username from link (example: /profile/ahmed123 -> ahmed123)
  const parts = url.split("/");
  const username = parts[parts.length - 1];

  if (!username) throw new Error("Invalid link");

  const user = await User.findOne({ username });
  if (!user) throw new Error("User not found in the system");

  // 1. Delete all seller products (if they are a seller)
  const products = await Product.find({ seller: user._id });
  for (const product of products) {
    for (const img of product.images) {
      await deleteImageFromServer(img); // Delete product images from the server
    }
  }
  await Product.deleteMany({ seller: user._id });

  // 2. Delete profile image
  if (user.avatar) await deleteImageFromServer(user.avatar);

  // 3. Delete the user themselves
  await User.findByIdAndDelete(user._id);

  revalidatePath("/admin");
  return { success: true, message: `User ${username} and all their products and images have been deleted successfully` };
}

// 2. Delete product via product link
export async function adminDeleteProduct(url: string) {
  await checkAdmin(); // Verify admin

  // Extract ID from link (example: /product/65ab... -> 65ab...)
  const parts = url.split("/");
  const productId = parts[parts.length - 1];

  if (!productId) throw new Error("Invalid link");

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  // 1. Delete product images from the server
  for (const img of product.images) {
    await deleteImageFromServer(img);
  }

  // 2. Delete product from the database
  await Product.findByIdAndDelete(productId);

  // 3. Remove product from all users' carts and wishlists (database cleanup)
  await User.updateMany(
    {},
    { 
      $pull: { 
        cart: { product: productId }, 
        wishlist: productId 
      } 
    }
  );

  revalidatePath("/admin");
  return { success: true, message: `The product has been deleted and removed from user carts successfully` };
}