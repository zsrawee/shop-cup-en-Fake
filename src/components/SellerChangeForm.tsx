"use client";

import { useState, useTransition } from "react";
import { becomeSeller, abandonSellerRole } from "@/actions/sellerActions";
import Link from "next/link";

export default function SellerChangeForm({ currentRole }: { currentRole: string }) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isNowSeller, setIsNowSeller] = useState(false);

  // Upgrade button (without password)
  const handleBecomeSeller = () => {
    startTransition(async () => {
      const res = await becomeSeller();
      if (res?.success) {
        setIsNowSeller(true); // Show congratulations message
      }
    });
  };

  // Abandon role form (with password)
  const handleAbandonSeller = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    startTransition(async () => {
      const res = await abandonSellerRole(password);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  // ✅ Regular user interface (one button only without password)
  if (currentRole === "user" && !isNowSeller) {
    return (
      <div className="text-center py-10 bg-blue-50 rounded-2xl border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">I want to be a seller</h2>
        <button 
          onClick={handleBecomeSeller} 
          disabled={isPending}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isPending ? "Upgrading..." : "Upgrade my account to seller 🚀"}
        </button>
      </div>
    );
  }

  // ✅ Congratulations interface (appears immediately after upgrade)
  if (currentRole === "seller" || isNowSeller) {
    return (
      <div className="space-y-8">
        {/* Congratulations message and add product */}
        <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100">
          <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 Congratulations! You are now a seller</h2>
          <p className="text-gray-600 mb-6">Do you want to add your first product?</p>
          <Link 
            href="/products/add" 
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition inline-block"
          >
            Add product ➕
          </Link>
        </div>

        {/* Abandon role section (here only we ask for password) */}
        <div className="text-center py-6 bg-red-50 rounded-2xl border border-red-200">
          <h3 className="text-lg font-bold text-red-800 mb-2">Abandon Seller Role</h3>
          <p className="text-red-600 text-sm mb-4">All your products will be permanently deleted.</p>
          
          <form onSubmit={handleAbandonSeller} className="max-w-xs mx-auto space-y-3">
            <input 
              type="password" 
              placeholder="Enter password to confirm" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-red-300 p-2.5 rounded-xl bg-white text-gray-900 text-center focus:ring-2 focus:ring-red-500 outline-none" 
            />
            {error && <p className="text-red-700 text-xs font-bold">{error}</p>}
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 text-sm"
            >
              {isPending ? "Deleting..." : "Confirm Abandon Role"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}