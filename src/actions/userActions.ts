"use server";

import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";

// Add this function to the actions/userActions.ts file

export async function updateCartQuantityAction(productId: string, quantity: number) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  if (quantity < 1) {
    // If quantity is less than 1, delete the product directly
    return removeFromCartAction(productId);
  }

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("User not found");

  const item = user.cart.find((item: any) => item.product.toString() === productId);
  if (item) {
    item.quantity = quantity;
    await user.save();
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function addToCartAction(productId: string, quantity: number = 1) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("You must log in first");

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("User not found");

  const existingItem = user.cart.find((item: any) => item.product.toString() === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    // @ts-ignore
    user.cart.push({ product: productId, quantity });
  }

  await user.save();
  revalidatePath("/cart");
  
  // Return the new count for the Context to use
  return { success: true, newCartCount: user.cart.length }; 
}

export async function removeFromCartAction(productId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("User not found");
  
  user.cart = user.cart.filter((item: any) => item.product.toString() !== productId);
  await user.save();
  
  revalidatePath("/cart");
  return { success: true, newCartCount: user.cart.length };
}

export async function toggleWishlistAction(productId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("You must log in first");

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("User not found");

  // @ts-ignore
  const index = user.wishlist.indexOf(productId);
  let isAdded = false;
  
  if (index > -1) {
    user.wishlist.splice(index, 1); 
  } else {
    // @ts-ignore
    user.wishlist.push(productId); 
    isAdded = true;
  }

  await user.save();
  revalidatePath("/favorites");
  
  // Return the new count and addition status
  return { success: true, newWishlistCount: user.wishlist.length, isAdded }; 
}