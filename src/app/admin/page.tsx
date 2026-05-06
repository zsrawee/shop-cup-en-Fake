import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import AdminActionsForm from "@/components/AdminActionsForm";

export default async function AdminPage() {
  const session = await auth();

  // Page protection (if a normal user enters the link manually, kick them out)
  if (!session?.user?.email) redirect("/login");
  
  await connectToDB();
  const user = await User.findOne({ email: session.user.email }).lean();

  if (!user || user.role !== "admin") {
    redirect("/"); // Redirect to home if not admin
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="ltr">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Admin Dashboard 🛡️</h1>
          <p className="text-gray-500 mt-2">You can manage the system and delete violating content from here.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Delete Tools</h2>
          <p className="text-gray-500 text-sm mb-6">
            Copy the profile link or product link from the store, and paste it here to delete it immediately.
          </p>
          
          <AdminActionsForm />
        </div>

      </div>
    </div>
  );
}