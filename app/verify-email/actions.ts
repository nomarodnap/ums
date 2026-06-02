"use server"

import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export type VerifyEmailFormState = { error?: string; success?: boolean }

export async function verifyEmailAndSetPassword(_prev: VerifyEmailFormState, formData: FormData): Promise<VerifyEmailFormState> {
  const token = String(formData.get("token") || "")
  const password = String(formData.get("password") || "")

  if (!token || !password) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" }
  }

  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }
  }

  try {
    const verification = await prisma.verification_tokens.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verification) {
      return { error: "ลิงก์ยืนยันตัวตนไม่ถูกต้อง" }
    }

    if (verification.expires_at < new Date()) {
      return { error: "ลิงก์ยืนยันตัวตนหมดอายุแล้ว กรุณาขอลิงก์ใหม่" }
    }

    const hash = await hashPassword(password)

    // Update user status and password
    await prisma.users.update({
      where: { id: verification.user_id },
      data: {
        password_hash: hash,
        status: "ACTIVE",
        updated_at: new Date()
      }
    })

    // Delete token
    await prisma.verification_tokens.delete({
      where: { id: verification.id }
    })

    return { success: true }
  } catch (err) {
    console.error("Verify email error:", err)
    return { error: "เกิดข้อผิดพลาดในการยืนยันตัวตน" }
  }
}
