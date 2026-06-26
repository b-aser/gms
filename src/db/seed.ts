import { uuidv4 } from "better-auth";
import { db } from ".";
import { accounts, users } from "./schema";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

// Gate staff user
const staffId = randomUUID();
const staffPassword = await bcrypt.hash("staff1234", 10);

await db.insert(users).values({
  id: staffId,
  name: "Gate Staff",
  email: "staff@wedding.com",
  emailVerified: true,
  role: "gate_staff",
});

await db.insert(accounts).values({
  id: randomUUID(),
  accountId: staffId,
  providerId: "credential",
  userId: staffId,
  password: staffPassword,
  createdAt: new Date(),
  updatedAt: new Date(),
});

console.log("✅ Staff seeded: staff@wedding.com / staff1234");