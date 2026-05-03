import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // If logged in, redirect to profile immediately
  if (session?.user) {
    // Preferred to use username stored in database
    redirect(`/profile/${session.user.username}`);
  }

  // If not logged in, show a welcome page instead of an error
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to our platform 🚀</h1>
      <p className="text-gray-600 mb-8 text-lg">You are not currently logged in, join us now.</p>
      
      <div className="flex gap-4">
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Login
        </Link>
        <Link href="/register" className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition">
          Create Account
        </Link>
      </div>
    </div>
  );
}