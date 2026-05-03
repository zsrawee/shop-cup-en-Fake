"use server";
// Add this at the top of the file if not present
import { deleteImageFromServer } from "./deleteImage"; 
import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("You are not authorized");

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    throw new Error("You must be a seller to add products");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string);

  if (!title || isNaN(price)) {
    throw new Error("Title and correct price are required");
  }

  // 2. ✅ Extract images (new edit)
  // We use getAll because we send several links with the same name "images" from the Client
  const images = formData.getAll("images") as string[];

  // 3. Save product in database
  await connectToDB();
  
  await Product.create({
    title,
    description,
    price,
    stock: isNaN(stock) ? 1 : stock,
    images,
    seller: user._id, 
  });

  redirect(`/profile/${user.username}`);
}


// ✅ Delete product with its images function
export async function deleteProduct(productId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("You are not authorized");

  await connectToDB();

  // 1. Fetch product to ensure it belongs to this seller and to delete its images
  const product = await Product.findById(productId).populate("seller");
  
  if (!product) throw new Error("Product not found");
  
  // Security: Ensure the person deleting is the owner of the product itself
  if ((product.seller as any).email !== session.user.email) {
    throw new Error("You cannot delete a product that does not belong to you");
  }

  // 2. Delete images from local server
  if (product.images && product.images.length > 0) {
    for (const imgUrl of product.images) {
      await deleteImageFromServer(imgUrl);
    }
  }

  // 3. Delete product from database
  await Product.findByIdAndDelete(productId);

  // 4. Clean up user carts and wishlists
  await User.updateMany(
    {},
    { 
      $pull: { 
        cart: { product: productId }, 
        wishlist: productId 
      } 
    }
  );

  revalidatePath("/seller");
  revalidatePath("/profile");
  return { success: true };
}