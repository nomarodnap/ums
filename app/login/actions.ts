"use server"

import { redirect } from "next/navigation"
import { authenticateUser, createSession, destroySession } from "@/lib/auth"

export type LoginState = {
  error?: string
  isPendingVerification?: boolean
  email?: string
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน" }
  }

  try {
    const result = await authenticateUser(email, password)
    if (result.error) {
      return { error: result.error, isPendingVerification: result.isPending, email }
    }
    if (!result.user) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }
    }
    await createSession({ id: result.user.id, role: result.user.role })
  } catch (err) {
    console.error("[v0] Login error:", err)
    return { error: "เกิดข้อผิดพลาดในระบบ กรุณาลองอีกครั้ง" }
  }

  redirect("/dashboard")
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}

import { prisma } from "@/lib/db"
import { randomBytes } from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function resendVerificationAction(email: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    })

    if (!user || user.status !== "PENDING_VERIFICATION") {
      return { error: "ไม่สามารถส่งอีเมลยืนยันได้" }
    }

    // Rate limiting / spam prevention: Check if a token was recently created
    const recentToken = await prisma.verification_tokens.findFirst({
      where: {
        user_id: user.id,
        created_at: { gt: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes
      }
    })

    if (recentToken) {
      return { error: "กรุณารอสักครู่ก่อนทำรายการใหม่อีกครั้ง" }
    }

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verification_tokens.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      }
    })

    await sendVerificationEmail(email, token)

    return { success: true }
  } catch (err) {
    console.error("Resend verification error:", err)
    return { error: "เกิดข้อผิดพลาดในการส่งอีเมล" }
  }
}

