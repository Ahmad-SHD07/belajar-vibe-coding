import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function createUser(payload: any) {
  const { name, email, password } = payload;

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser.length > 0) {
    return { error: "Email sudah terdaftar" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { success: true };
}

export async function loginUser(payload: any) {
  const { email, password } = payload;

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser.length === 0) {
    return { error: "Email atau password salah!" };
  }

  const user = existingUser[0]!;
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return { error: "Email atau password salah!" };
  }

  const token = crypto.randomUUID();

  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return { token };
}

export async function getCurrentUser(token: string) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      created_at: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0];
}
