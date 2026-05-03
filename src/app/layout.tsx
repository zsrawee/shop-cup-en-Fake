import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/navBar";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import "./globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialCartCount = 0;
  let initialWishlistCount = 0;
  let isLoggedIn = false;
  let username = "";
  let role = "user"; // ✅ Added the variable

  const session = await auth();
  
  if (session?.user?.email) {
    isLoggedIn = true;
    await connectToDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (user) {
      initialCartCount = user.cart?.length || 0;
      initialWishlistCount = user.wishlist?.length || 0;
      username = user.username;
      role = user.role; // ✅ Fetch the role (user, seller, admin)
    }
  }

  return (
    <html lang="en">
      <body>
        <AppProvider initialCart={initialCartCount} initialWishlist={initialWishlistCount}>
          {/* ✅ Pass the role to the Navbar */}
          <Navbar isLoggedIn={isLoggedIn} username={username} role={role} />
          <main className="min-h-screen">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}