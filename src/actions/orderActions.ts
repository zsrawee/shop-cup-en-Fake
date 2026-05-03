"use server";

import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrderAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("You must log in first");

  const shippingAddress = formData.get("shippingAddress") as string;
  if (!shippingAddress || shippingAddress.trim() === "") {
    throw new Error("Shipping address is required");
  }

  await connectToDB();

  // 1. Fetch user with cart products
  const user = await User.findOne({ email: session.user.email }).populate("cart.product");

  if (!user || user.cart.length === 0) {
    throw new Error("Your cart is empty, cannot complete the order");
  }

  // 2. Calculate total and prepare order items with stock check
  let totalAmount = 0;
  const orderItems = [];

  for (const item of user.cart) {
    const product = item.product as any; // Cast populated product

    if (!product) {
      throw new Error("Some products in your cart are deleted or no longer available");
    }

    if (product.stock < item.quantity) {
      throw new Error(`The requested quantity of ${product.title} is not available in stock (only ${product.stock} available)`);
    }

    const itemPrice = product.price; 
    totalAmount += itemPrice * item.quantity;
    
    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: itemPrice,
    });
  }

  // 3. Create order in database
  await Order.create({
    customer: user._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
    status: 'pending', // Pending
    paymentStatus: 'unpaid' // Unpaid (assuming Cash on Delivery)
  });

  // 4. Update stock (decrease sold quantity)
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // 5. Empty user cart after purchase
  user.cart = [];
  await user.save();

  // 6. Update cache and redirect user to orders page
  revalidatePath("/cart");
  revalidatePath("/orders");
  redirect("/orders");
}