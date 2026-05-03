"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar({ 
  isLoggedIn, 
  username, 
  role 
}: { 
  isLoggedIn: boolean; 
  username: string; 
  role: string; 
}) {
  const { cartCount, wishlistCount } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  // ✅ Basic store links (visible to everyone)
  const storeLinks = [
    { href: "/products", label: "Products", icon: "🛍️" },
    { href: "/cart", label: "Cart", icon: "🛒", badge: cartCount },
    { href: "/orders", label: "My Orders", icon: "📦" },
    { href: "/aaa", label: "test", icon: "🅰️" }, // Additional link
  ];

  // ✅ User links (change based on login and role)
  const authLinks = isLoggedIn
    ? [
        { href: `/profile/${username}`, label: "Profile", icon: "👤" },
        { href: "/seller/change", label: "Sellers", icon: "🏪" },
        // Admin link appears only if role is admin
        ...(role === 'admin' ? [{ href: "/admin", label: "Dashboard", icon: "🛡️" }] : []),
      ]
    : [
        { href: "/login", label: "Login", icon: "🔑" },
      ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16" dir="rtl">
          
          {/* Logo */}
          <Link href="/" className="text-xl font-extrabold text-blue-600">
            Shop-cup 🚀
          </Link>

          {/* Desktop links (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-5">
            {storeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1 text-sm font-semibold transition ${
                  isActive(link.href) ? "text-blue-600" : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <span>{link.icon}</span> {link.label}
                {/* Badge count (for cart and wishlist) */}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-2 -left-3 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Separator between store links and user links */}
            <div className="w-px h-6 bg-gray-200"></div>

            {/* User links (Profile/Login/Admin) */}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1 text-sm font-semibold transition ${
                  isActive(link.href) ? "text-blue-600" : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <span>{link.icon}</span> {link.label}
              </Link>
            ))}
          </div>

          {/* Side menu button (visible only on mobile) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden text-gray-600 text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* === Side Menu (Drawer) for Mobile === */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" dir="rtl">
          {/* Dimmed background */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDrawerOpen(false)}></div>
          
          {/* Sliding menu content from the right */}
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl p-6 flex flex-col gap-2 transform transition-transform duration-300">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl font-bold text-blue-600">Menu</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-2xl text-gray-500">✕</button>
            </div>
            
            {/* Store links on mobile */}
            {storeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsDrawerOpen(false)} // Close menu on click
                className={`flex items-center gap-3 p-3 rounded-xl transition ${
                  isActive(link.href) ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-semibold">{link.label}</span>
                {/* Badge count on mobile */}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="mr-auto bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Separator on mobile */}
            <hr className="my-3"/>

            {/* User links on mobile */}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsDrawerOpen(false)} // Close menu on click
                className={`flex items-center gap-3 p-3 rounded-xl transition ${
                  isActive(link.href) ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-semibold">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}