// Compatible Edge : n'utilise ni Prisma ni bcrypt (utilisé par le middleware)
import type { NextAuthConfig } from "next-auth";

export default {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const isPublic = nextUrl.pathname.startsWith("/login");
      if (isPublic) return loggedIn ? Response.redirect(new URL("/", nextUrl)) : true;
      return loggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as any).role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
