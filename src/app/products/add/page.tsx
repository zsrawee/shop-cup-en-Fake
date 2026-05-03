import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import Link from "next/link";
import AddProductForm from "@/components/AddProductForm";

export default async function AddProductPage() {
  const session = await auth();
  
  // If not logged in, redirect to login page
  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectToDB();
  const user = await User.findOne({ email: session.user.email }).lean();

  if (!user) {
    redirect("/login");
  }

  const isSeller = user.role === "seller";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Add New Product</h1>

        {!isSeller ? (
          // ✅ If not a seller
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">🛍️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">You are not currently a seller</h2>
            <p className="text-gray-500 mb-6">You cannot add products until you upgrade your account to a seller.</p>
            <Link 
              href="/seller/change" 
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition inline-block"
            >
              Upgrade to Seller 🚀
            </Link>
          </div>
        ) : (
          // ✅ If a seller, show the form and pass their ID
          <AddProductForm userId={user._id.toString()} />
        )}
      </div>
    </div>
  );
}