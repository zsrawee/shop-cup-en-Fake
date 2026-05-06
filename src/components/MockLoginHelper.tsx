"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function MockLoginHelper() {
  const { data: session } = useSession();

  useEffect(() => {
    // If we have a session, save user info to localStorage for mock testing
    if (session?.user) {
      localStorage.setItem("mock_user", JSON.stringify({
        email: session.user.email,
        name: session.user.name,
        username: (session.user as any).username,
        role: (session.user as any).role || "user",
      }));
      console.log("✅ [MOCK] User identity saved to localStorage");
    }
  }, [session]);

  return null; // This component doesn't render anything
}
