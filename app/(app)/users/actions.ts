"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { randomBytes } from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export type UserFormState = { error?: string; success?: boolean }

export async function createUserAction(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  try {
    await requireRole(["ADMIN"])
  } catch {
    return { error: "คุณไม่มีสิทธิ์ดำเนินการ" }
  }

  const email = String(formData.get("email") || "").trim().toLowerCase()
  const fullName = String(formData.get("short_name") || "").trim()
  const department = String(formData.get("department") || "").trim() || ""
  const costCenter = String(formData.get("cost_center") || "").trim() || null
  const role = String(formData.get("role") || "USER")

  if (!email || !fullName) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" }
  }
  if (!["ADMIN", "STAFF", "USER"].includes(role)) {
    return { error: "บทบาทไม่ถูกต้อง" }
  }

  try {
    const existing = await prisma.users.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    })
    if (existing) {
      return { error: "อีเมลนี้ถูกใช้งานแล้ว" }
    }

    const user = await prisma.users.create({
      data: {
        email,
        short_name: fullName,
        department,
        cost_center: costCenter,
        role,
        status: "PENDING_VERIFICATION",
        updated_at: new Date()
      }
    })

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

  } catch (err) {
    console.error("[v0] Create user error:", err)
    return { error: "ไม่สามารถสร้างผู้ใช้งานได้" }
  }

  revalidatePath("/users")
  return { success: true }
}

export async function toggleUserActiveAction(id: number): Promise<UserFormState> {
  try {
    await requireRole(["ADMIN"])
  } catch {
    return { error: "คุณไม่มีสิทธิ์ดำเนินการ" }
  }
  try {
    const user = await prisma.users.findUnique({ where: { id } })
    if (user) {
      await prisma.users.update({
        where: { id },
        data: { is_active: !user.is_active, updated_at: new Date() }
      })
    }
  } catch (err) {
    console.error("[v0] Toggle user error:", err)
    return { error: "ไม่สามารถอัปเดตสถานะได้" }
  }
  revalidatePath("/users")
  return { success: true }
}

export async function updateUserRoleAction(id: number, role: string): Promise<UserFormState> {
  try {
    await requireRole(["ADMIN"])
  } catch {
    return { error: "คุณไม่มีสิทธิ์ดำเนินการ" }
  }
  if (!["ADMIN", "STAFF", "USER"].includes(role)) {
    return { error: "บทบาทไม่ถูกต้อง" }
  }
  try {
    await prisma.users.update({
      where: { id },
      data: { role, updated_at: new Date() }
    })
  } catch (err) {
    console.error("[v0] Update role error:", err)
    return { error: "ไม่สามารถอัปเดตบทบาทได้" }
  }
  revalidatePath("/users")
  return { success: true }
}
