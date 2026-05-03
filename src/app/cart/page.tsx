import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import Link from "next/link";
import CartItemActions from "@/components/CartItemActions";

export default async function CartPage() {
  const session = await auth();
  
  // If not logged in, redirect to login page
  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectToDB();

  // Fetch user and use populate to get product data in the cart
  const user = await User.findOne({ email: session.user.email })
    .populate("cart.product")
    .lean();

  if (!user) redirect("/login");

  // Filter deleted products (if a product is in the cart but the seller deleted it)
  const validCartItems = user.cart.filter((item: any) => item.product !== null);
  
  // Calculate total
  const totalAmount = validCartItems.reduce((acc: number, item: any) => {
    return acc + (item.product.price * item.quantity);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen" dir="rtl">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart 🛒</h1>

      {validCartItems.length === 0 ? (
        // Empty cart state
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-gray-500 text-lg mb-6">Your cart is currently empty</p>
          <Link 
            href="/products" 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Browse Products 🛍️
          </Link>
        </div>
      ) : (
        // Products in cart state
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Product list (Right column) */}
          <div className="lg:col-span-2 space-y-4">
            {validCartItems.map((item: any) => (
              <div 
                key={item.product._id.toString()} 
                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={item.product.images?.[0] || "/placeholder.png"} 
                    alt={item.product.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{item.product.title}</h3>
                  <p className="text-blue-600 font-extrabold text-lg">${item.product.price}</p>
                  
                  {/* Quantity and delete buttons (Client Component) */}
                  <div className="mt-2">
                    <CartItemActions 
                      productId={item.product._id.toString()} 
                      quantity={item.quantity} 
                    />
                  </div>
                </div>

                {/* Total price for this product (Price x Quantity) */}
                <div className="text-left">
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="font-extrabold text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary (Left column) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Number of products</span>
                  <span>{validCartItems.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <hr />
                <div className="flex justify-between font-extrabold text-xl text-gray-900">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>        
            <Link 
              href="/checkout" 
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-md block text-center"
            >
              Complete Purchase 💳
            </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}