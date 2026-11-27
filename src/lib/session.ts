import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "tc_session";

export interface SessionPayload {
  userId: string;
  role: string;
  login: string;
  fullName: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET is not set or too short");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: String(payload.userId),
      role: String(payload.role),
      login: String(payload.login),
      fullName: String(payload.fullName),
    };
  } catch {
    return null;
  }
}
