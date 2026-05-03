"use server";

import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";
import { deleteImageFromServer } from "./deleteImage";
import { auth } from "@/auth";

export async function changeName(newName: string) {
  if (!newName || newName.trim() === "") throw new Error("Name is required");
  
  const session = await auth();
  if (!session?.user?.email) throw new Error("You are not authorized");
  
  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("User not found");

  await User.findByIdAndUpdate(user._id, { name: newName.trim() });
  revalidatePath("/profile"); // Update profile pages
}

export async function changeDesc(newDesc: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("You are not authorized");

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("User not found");

  // Update description field within sellerInfo object
  await User.findByIdAndUpdate(user._id, { "sellerInfo.description": newDesc.trim() });
  revalidatePath("/profile");
}
export async function changeImage(newImageUrl: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("You are not authorized");

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("User not found");
  
  // ✅ If they have an old image, delete it from the folder first
  if (user && user.avatar && user.avatar.startsWith("/imag/")) {
    await deleteImageFromServer(user.avatar);
  }

  // Then save the new link
  await User.findByIdAndUpdate(user._id, { avatar: newImageUrl });
  revalidatePath("/profile");
}