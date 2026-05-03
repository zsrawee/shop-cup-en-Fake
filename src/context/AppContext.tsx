"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AppContextType {
  cartCount: number;
  wishlistCount: number;
  setCartCount: (count: number) => void;
  setWishlistCount: (count: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children, initialCart, initialWishlist }: { children: ReactNode, initialCart: number, initialWishlist: number }) {
  const [cartCount, setCartCount] = useState(initialCart);
  const [wishlistCount, setWishlistCount] = useState(initialWishlist);

  // If a page update (revalidate) occurs and the server values change, we update the state
  useEffect(() => {
    setCartCount(initialCart);
  }, [initialCart]);

  useEffect(() => {
    setWishlistCount(initialWishlist);
  }, [initialWishlist]);

  return (
    <AppContext.Provider value={{ cartCount, wishlistCount, setCartCount, setWishlistCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}