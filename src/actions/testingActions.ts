"use server";

import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";

// 1. Admin toggle function
export async function toggleAdminRole() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("You must log in first");

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("User not found");

  // Toggle role
  user.role = user.role === "admin" ? "user" : "admin";
  
  // If admin, ensure they have seller permissions as well to add products
  if (user.role === "admin" && !user.sellerInfo) {
    user.sellerInfo = {
      storeName: "Demo Admin Store",
      description: "This is a system testing account",
      isVerified: true,
      rating: 5
    };
  }

  await user.save();
  
  // Refresh the entire UI to change the Navbar
  revalidatePath("/", "layout"); 
  return { success: true, newRole: user.role };
}

// 2. Seed fake products function
export async function seedProducts(count: number) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("You must log in first");

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("User not found");

  // Ensure the user is a seller or admin to link products to them
  if (user.role !== "seller" && user.role !== "admin") {
    user.role = "seller";
    user.sellerInfo = { storeName: "Demo Store", description: "Store Description", isVerified: true, rating: 4.5 };
    await user.save();
  }

  const products = [];
  
  // Words to generate random and variable product names
  const adjectives = ["Black", "White", "Beautiful", "Excellent", "Fast", "New", "Used", "Small", "Large"];
  const nouns = ["Laptop", "Phone", "Headphones", "Screen", "Keyboard", "Mouse", "Printer", "Camera", "Watch"];

  for (let i = 0; i < count; i++) {
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);

    products.push({
      title: `Product ${randomAdj} ${randomNoun} ${randomNum}`,
      description: "This product was automatically generated to test the store's performance and design. You can delete it from the seller or admin dashboard.",
      price: Math.floor(Math.random() * 500) + 10, // Price between 10 and 510
      stock: Math.floor(Math.random() * 100) + 1,
      seller: user._id,
      category: "Testing",
      // Static fake image from placeholder site
      images: [`https://via.placeholder.com/300x300/0ea5e9/ffffff?text=Product+${i+1}`]
    });
  }

  // Insert products in bulk in the database (fastest way)
  await Product.insertMany(products);

  revalidatePath("/products");
  revalidatePath("/seller");
  return { success: true, count };
}