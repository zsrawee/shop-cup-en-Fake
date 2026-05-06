import { connectToDB } from "@/lib/db";
import {User} from "@/models/User";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { RegisterSchema } from "@/lib/validations";

export default function RegisterPage() {
  
  // Registration handler function (Server Action)
  async function handleRegister(formData: FormData) {
    "use server";

    // 1. Transform and validate data with Zod
    const data = Object.fromEntries(formData.entries());
    const result = RegisterSchema.safeParse(data);

    if (!result.success) {
      // If validation fails (e.g., short password)
      console.log("Input error:", result.error.flatten().fieldErrors);
      return; 
    }

    const { name, email, password } = result.data;

    try {
      await connectToDB();

      // 2. Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("Email is already registered");
        return;
      }

      // 3. Encrypt password
      const hashedPassword = await bcrypt.hash(password, 10);


      // Function to convert name to slug (username)
// 1. Full function definition
const generateUsername = (name: string) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[^\w]/g, ''); // Remove symbols
}; // Make sure to close the bracket here

// 2. Now call the function and use it (must be inside handleRegister)
const baseUsername = generateUsername(name);

const isTaken = await User.findOne({ username: baseUsername });
const finalUsername = isTaken 
  ? `${baseUsername}${Math.floor(Math.random() * 1000)}` 
  : baseUsername;

// 3. Actual creation
await User.create({
  name,
  email,
  username: finalUsername,
  password: hashedPassword,
});

      console.log("✅ Account created successfully");

    } catch (error) {
      console.error("An error occurred during registration:", error);
      return;
    }

    // 5. Redirect to login page after success
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans" dir="ltr">
      <form
        action={handleRegister}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl transition-all duration-300"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Create New Account
        </h2>

        <div className="flex flex-col gap-5">
          {/* Name field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 mr-1">Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-gray-300 p-3 text-right text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 mr-1">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="example@mail.com"
              className="w-full rounded-lg border border-gray-300 p-3 text-right text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 mr-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="********"
              className="w-full rounded-lg border border-gray-300 p-3 text-right text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
            <p className="text-[10px] text-gray-400 mt-1">Must be at least 8 characters</p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
          >
            Create Account
          </button>
        </div>

        {/* Redirect link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-bold hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}