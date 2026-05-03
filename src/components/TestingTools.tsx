"use client";

import { useState, useTransition } from "react";
import { toggleAdminRole, seedProducts } from "@/actions/testingActions";

export default function TestingTools({ currentRole }: { currentRole: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleToggleAdmin = () => {
    setMessage("");
    startTransition(async () => {
      try {
        const res = await toggleAdminRole();
        setMessage(`✅ Your role has been changed to: ${res.newRole}. Please Refresh (F5) the page to update the Navbar.`);
      } catch (error: any) {
        setMessage(`❌ Error: ${error.message}`);
      }
    });
  };

  const handleSeed = (count: number) => {
    if (!confirm(`Are you sure you want to create ${count} fake products?`)) return;
    setMessage("");
    startTransition(async () => {
      try {
        const res = await seedProducts(count);
        setMessage(`✅ ${res.count} products created successfully! Check the products page or seller dashboard.`);
      } catch (error: any) {
        setMessage(`❌ Error: ${error.message}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Success or error messages */}
      {message && (
        <div className="bg-gray-800 border border-gray-700 text-gray-200 p-4 rounded-xl text-sm">
          {message}
        </div>
      )}

      {/* Toggle Admin */}
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <h3 className="text-lg font-bold mb-4 text-gray-300">Toggle Admin Permissions</h3>
        <button
          onClick={handleToggleAdmin}
          disabled={isPending}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-xl font-extrabold transition disabled:opacity-50"
        >
          {isPending ? "Changing..." : `Switch to ${currentRole === 'admin' ? 'Regular User' : 'Admin 🛡️'}`}
        </button>
      </div>

      {/* Generate Products */}
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <h3 className="text-lg font-bold mb-4 text-gray-300">Generate Fake Products (Seed Data)</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => handleSeed(10)}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            Create 10 products
          </button>
          <button
            onClick={() => handleSeed(100)}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            Create 100 products
          </button>
          <button
            onClick={() => handleSeed(1000)}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            Create 1000 products 🚀
          </button>
        </div>
      </div>

    </div>
  );
}