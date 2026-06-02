"use server"

import { prisma } from "@/lib/db"
import { randomBytes } from "crypto"
import { sendResetPasswordEmail } from "@/lib/email"

export type ForgotPasswordFormState = { error?: string; success?: boolean; isPendingVerification?: boolean; email?: string }

export async function requestPasswordReset(_prev: ForgotPasswordFormState, formData: FormData): Promise<ForgotPasswordFormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase()

  if (!email) {
    return { error: "กรุณากรอกอีเมล" }
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    })

    // We still return success even if user not found to prevent email enumeration
    if (!user || !user.is_active) {
      return { success: true }
    }

    if (user.status === "PENDING_VERIFICATION") {
      return { error: "บัญชีนี้ยังไม่ได้ยืนยันตัวตน กรุณายืนยันตัวตนจากอีเมลที่ได้รับก่อน", isPendingVerification: true, email }
    }

    // Rate limiting / spam prevention: Check if a token was recently created
    const recentToken = await prisma.reset_tokens.findFirst({
      where: {
        user_id: user.id,
        created_at: { gt: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes
      }
    })

    if (recentToken) {
      return { error: "กรุณารอสักครู่ก่อนทำรายการใหม่อีกครั้ง" }
    }

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.reset_tokens.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      }
    })

    await sendResetPasswordEmail(email, token)

    return { success: true }
  } catch (err) {
    console.error("Forgot password error:", err)
    return { error: "เกิดข้อผิดพลาดในการส่งอีเมลรีเซ็ตรหัสผ่าน" }
  }
}
