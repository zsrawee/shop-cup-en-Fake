import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  // Modify Session interface
  interface Session {
    user: {
      username?: string | null
    } & DefaultSession["user"]
  }

  // Modify User interface
  interface User {
    username?: string | null
  }
}

declare module "next-auth/jwt" {
  // Modify JWT interface
  interface JWT {
    username?: string | null
  }
}