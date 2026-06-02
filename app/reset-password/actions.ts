"use server"

import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export type ResetPasswordFormState = { error?: string; success?: boolean }

export async function resetPassword(_prev: ResetPasswordFormState, formData: FormData): Promise<ResetPasswordFormState> {
  const token = String(formData.get("token") || "")
  const password = String(formData.get("password") || "")

  if (!token || !password) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" }
  }

  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }
  }

  try {
    const resetToken = await prisma.reset_tokens.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      return { error: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง" }
    }

    if (resetToken.expires_at < new Date()) {
      return { error: "ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว กรุณาขอลิงก์ใหม่" }
    }

    const hash = await hashPassword(password)

    // Update user password
    await prisma.users.update({
      where: { id: resetToken.user_id },
      data: {
        password_hash: hash,
        status: "ACTIVE", // Just in case they were pending
        updated_at: new Date()
      }
    })

    // Delete token so it can't be used again
    await prisma.reset_tokens.delete({
      where: { id: resetToken.id }
    })

    return { success: true }
  } catch (err) {
    console.error("Reset password error:", err)
    return { error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" }
  }
}
