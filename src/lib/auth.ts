import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import {
  SESSION_COOKIE,
  signSession,
  verifySession,
  type SessionPayload,
} from "./session";

export type { SessionPayload };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Read and verify the session cookie (no DB hit). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export interface CurrentUser {
  id: string;
  login: string;
  fullName: string;
  role: string;
  active: boolean;
  permissions: string[];
}

/** Fetch the current user from DB (fresh role/active state). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.active) return null;
  return {
    id: user.id,
    login: user.login,
    fullName: user.fullName,
    role: user.role,
    active: user.active,
    permissions: user.permissions ? JSON.parse(user.permissions) : [],
  };
}

/** Require an authenticated user; redirect to /login otherwise. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require the owner role; redirect otherwise. */
export async function requireOwner(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "owner") redirect("/");
  return user;
}

export function isOwner(user: { role: string } | null): boolean {
  return user?.role === "owner";
}

/** Validate credentials and create a session cookie. Returns error message or null. */
export async function login(
  loginName: string,
  password: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { login: loginName.trim() },
  });
  if (!user) return "Неверный логин или пароль";
  if (!user.active) return "Аккаунт заблокирован";
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return "Неверный логин или пароль";

  const token = await signSession({
    userId: user.id,
    role: user.role,
    login: user.login,
    fullName: user.fullName,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "login", entity: "User", entityId: user.id },
  });
  return null;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
