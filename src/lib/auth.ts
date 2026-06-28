import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { admin, openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "gate_staff",
        input: false, // not settable by user on signup
      },
    },
  },
  plugins: [
    openAPI(),
    admin({
      defaultRole: "gate_staff",
      adminRoles: ["admin"],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;