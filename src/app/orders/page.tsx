import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { redirect } from "next/navigation";
import Link from "next/link";

// ✅ Function to convert order status to text and style
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return { text: 'Pending', style: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' };
    case 'processing':
      return { text: 'Processing', style: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📦' };
    case 'shipped':
      // ✨ Required status: Shipped
      return { text: 'Shipped', style: 'bg-green-100 text-green-800 border-green-300 ring-2 ring-green-400 ring-offset-1', icon: '🚚' };
    case 'delivered':
      return { text: 'Delivered', style: 'bg-gray-100 text-gray-800 border-gray-200', icon: '✅' };
    case 'cancelled':
      return { text: 'Cancelled', style: 'bg-red-100 text-red-800 border-red-200', icon: '❌' };
    default:
      return { text: 'Unknown', style: 'bg-gray-100 text-gray-800 border-gray-200', icon: '❓' };
  }
};

export default async function OrdersPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectToDB();

  // 1. Fetch user ID
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) redirect("/login");

  // 2. Fetch all orders for this user and sort from newest to oldest
  // Use populate to fetch product details within each order
  const orders = await Order.find({ customer: user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "items",
      populate: {
        path: "product",
        model: "Product"
      }
    })
    .lean();

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen" dir="rtl">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders 📦</h1>

      {orders.length === 0 ? (
        // No orders state
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-gray-500 text-lg mb-6">You haven't made any orders yet</p>
          <Link 
            href="/products" 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Shop Now 🛒
          </Link>
        </div>
      ) : (
        // Orders list
        <div className="space-y-6">
          {orders.map((order: any) => {
            const statusInfo = getStatusStyle(order.status);
            
            return (
              <div key={order._id.toString()} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* Order header (Date, Status, Total) */}
                <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order Date: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Order ID: #{order._id.toString().substring(0, 8)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-extrabold text-gray-900">${order.totalAmount}</span>
                    {/* Order status badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${statusInfo.style}`}>
                      <span>{statusInfo.icon}</span> {statusInfo.text}
                    </span>
                  </div>
                </div>

                {/* Product details within the order */}
                <div className="p-4 divide-y divide-gray-50">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 py-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border">
                        {item.product && item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product?.title || "Product"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📸</div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm">
                          {item.product ? item.product.title : "Product no longer available"}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1">Quantity: {item.quantity}</p>
                      </div>

                      {/* Product price at time of purchase */}
                      <div className="text-left">
                        <p className="font-bold text-gray-800 text-sm">${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping address (Optional) */}
                {order.shippingAddress && (
                  <div className="px-4 pb-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-800 border border-blue-100">
                      📍 Shipping Address: {order.shippingAddress}
                    </div>
                  </div>
                )}

                {/* Special alert if order is "Shipped" */}
                {order.status === 'shipped' && (
                  <div className="bg-green-50 p-3 border-t border-green-100 text-center">
                    <p className="text-green-700 font-bold text-sm animate-pulse">🚚 Your order is on its way! Get ready to receive it.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}