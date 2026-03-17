import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { userService } from "@/server/users/services/user.service";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const { role, onboarded } = await userService.getProfile(user.id);
      return {
        user: {
          ...user,
          role,
          onboarded,
        },
        session,
      };
    }),
  ],
});
