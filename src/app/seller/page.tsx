import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { getSellerProducts } from "@/lib/data";
import { redirect } from "next/navigation";
import Link from "next/link";
import SellerDashboard from "@/components/SellerDashboard";
import SellerChangeForm from "@/components/SellerChangeForm";

export default async function SellerPage() {
  const session = await auth();

  // If not logged in or not a seller, redirect
  if (!session?.user?.email) redirect("/login");
  
  await connectToDB();
  const user = await User.findOne({ email: session.user.email }).lean();

  if (!user || user.role !== "seller") {
    // If normal user, redirect to upgrade page
    redirect("/seller/change");
  }

  // Fetch seller products
  const products = await getSellerProducts(user._id.toString());

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ✅ Professional Dashboard */}
        <SellerDashboard 
          user={JSON.parse(JSON.stringify(user))} 
          products={JSON.parse(JSON.stringify(products))} 
        />

        {/* === Danger Zone (Giving up role) === */}
        <div className="max-w-2xl mx-auto border-t pt-8">
          <SellerChangeForm 
            userId={user._id.toString()} 
            currentRole={user.role} 
          />
        </div>

      </div>
    </div>
  );
}