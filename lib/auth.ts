import "server-only"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { prisma } from "./db"
import type { User, UserRole } from "./db"

const SESSION_COOKIE = "fisheries_session"
const SESSION_DURATION_DAYS = 7

function getSecret() {
  const secret = process.env.SESSION_SECRET || process.env.DATABASE_URL || "fisheries-dev-secret-change-in-production-2025"
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export interface SessionPayload {
  sessionId: string
  userId: number
  role: UserRole
  [key: string]: unknown
}

async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getSecret())
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(user: Pick<User, "id" | "role">): Promise<void> {
  const sessionId = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)

  await prisma.sessions.create({
    data: {
      id: sessionId,
      user_id: user.id,
      expires_at: expiresAt,
    }
  })

  const token = await signToken({ sessionId, userId: user.id, role: user.role })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    const payload = await verifyToken(token)
    if (payload?.sessionId) {
      await prisma.sessions.deleteMany({
        where: { id: payload.sessionId }
      })
    }
  }

  cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const session = await prisma.sessions.findFirst({
    where: {
      id: payload.sessionId,
      expires_at: { gt: new Date() },
      user: { is_active: true }
    },
    include: { user: true }
  })

  if (!session || !session.user) return null

  const u = session.user
  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    department: u.department,
    role: u.role as UserRole,
    is_active: u.is_active,
    created_at: u.created_at.toISOString(),
    updated_at: u.updated_at.toISOString()
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
  return user
}

export async function requireRole(roles: UserRole[]): Promise<User> {
  const user = await requireUser()
  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN")
  }
  return user
}

export async function authenticateUser(email: string, password: string): Promise<{ user?: User, error?: string, isPending?: boolean }> {
  const user = await prisma.users.findFirst({
    where: {
      email: { equals: email, mode: 'insensitive' },
      is_active: true
    }
  })
  
  if (!user) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }

  if (user.status === "PENDING_VERIFICATION") {
    return { error: "บัญชีนี้ยังไม่ได้ยืนยันตัวตน กรุณาตรวจสอบอีเมล", isPending: true }
  }

  if (!user.password_hash) {
    return { error: "บัญชีนี้ยังไม่ได้ตั้งรหัสผ่าน กรุณายืนยันตัวตนผ่านอีเมล" }
  }

  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      department: user.department,
      role: user.role as UserRole,
      is_active: user.is_active,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString()
    }
  }
}
