import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/db";
import {User } from "@/models/User";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        await connectToDB();
        
        // 1. Search for user by email
        const email = credentials?.email as string;
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const isMock = !process.env.MONGODB_URI;

        // 2. Check password (bypass if in mock mode)
        if (!isMock) {
          const isMatch = await bcrypt.compare(credentials.password as string, user.password);
          if (!isMatch) throw new Error("Incorrect password");
        }

        return user; // Success
      },
    }),
  ],callbacks: {
    async session({ session, token }) {
      // Here we add the username to the session to be available everywhere
      if (token.username) {
        session.user.username = token.username as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // On first login, we take the username from the database and put it in the Token
      if (user) {
        token.username = user.username; 
      }
      return token;
    },
  },
  pages: {
    signIn: "/login", // The page we will create in a bit
  },
});