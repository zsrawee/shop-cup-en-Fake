"use client";

import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/context/AppContext";
import MockLoginHelper from "./MockLoginHelper";

export function Providers({ 
  children, 
  initialCart, 
  initialWishlist 
}: { 
  children: React.ReactNode; 
  initialCart: number; 
  initialWishlist: number; 
}) {
  return (
    <SessionProvider>
      <AppProvider initialCart={initialCart} initialWishlist={initialWishlist}>
        <MockLoginHelper />
        {children}
      </AppProvider>
    </SessionProvider>
  );
}
