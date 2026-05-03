import { connectToDB } from "@/lib/db";
import { Product } from "@/models/Product";

export async function getSellerProducts(sellerId: string) {
  await connectToDB();
  
  // Fetch products and sort them from newest to oldest
  const products = await Product.find({ seller: sellerId })
    .sort({ createdAt: -1 })
    .lean(); // .lean() converts them to plain JavaScript objects for increased speed
    
  return products;
}