import { signIn } from "@/auth";
import { LoginSchema } from "@/lib/validations";
import { AuthError } from "next-auth";

export default function LoginPage() {
  
  async function handleLogin(formData: FormData) {
    "use server";

    // 1. Transform and validate data with Zod
    const data = Object.fromEntries(formData.entries());
    const result = LoginSchema.safeParse(data);

    if (!result.success) {
      console.log("Login data incomplete");
      return;
    }

    const { email, password } = result.data;
    try {
      // 2. Attempt to login using NextAuth
      // We use "credentials" because we defined it in the auth.ts file
      await signIn("credentials", {
        email,
        password,
        redirectTo: `/profile `, // Destination after success
      });

    } catch (error) {
      // 3. Error handling (if password is wrong or user does not exist)
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            console.log("Invalid email or password");
            return;
          default:
            console.log("An error occurred during login");
            return;
        }
      }
      
      // Note: Next.js needs to throw redirect outside the try/catch block
      throw error; 
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans" dir="rtl">
      <form
        action={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl transition-all duration-300"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Login
        </h2>

        <div className="flex flex-col gap-5">
          {/* Email */}
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

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 mr-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="********"
              className="w-full rounded-lg border border-gray-300 p-3 text-right text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="mt-2 w-full h-full rounded-lg bg-green-600 py-3 font-semibold text-green-900 transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 "
          >
            Login
          </button>
        </div>

        {/* Additional links */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 font-bold hover:underline">
            Create an account now
          </a>
        </p>
      </form>
    </div>
  );
}