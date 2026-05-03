import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import TestingTools from "@/components/TestingTools";

export default async function TestingPage() {
  const session = await auth();
  
  // You must be logged in to use the sandbox page
  if (!session?.user?.email) redirect("/login");

  await connectToDB();
  const user = await User.findOne({ email: session.user.email }).lean();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-2">🛠️ Sandbox Page</h1>
          <p className="text-gray-400">Use these tools to test the project and generate data.</p>
          <p className="text-red-500 text-sm font-bold mt-2">⚠️ Warning: Do not use this page in a real production environment!</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl mb-8 border border-gray-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-gray-300">Current Status:</h2>
          <div className="flex gap-6 text-lg">
            <p>Name: <span className="text-blue-400 font-bold">{user?.name}</span></p>
            <p>Role: <span className="text-yellow-400 font-bold">{user?.role}</span></p>
          </div>
        </div>

        {/* Interactive testing buttons */}
        <TestingTools currentRole={user?.role || "user"} />

      </div>
    </div>
  );
}