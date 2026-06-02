"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { approveBill, revertBillToSubmitted } from "@/lib/queries"

export async function approveBillAction(billId: number) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return { error: "ไม่มีสิทธิ์ในการยืนยันรายงาน" }
  }

  try {
    await approveBill(billId, user.id)
    revalidatePath("/status")
    return { success: true }
  } catch (error) {
    console.error("Approve bill error:", error)
    return { error: "เกิดข้อผิดพลาดในการยืนยันรายงาน" }
  }
}

export async function revertBillAction(billId: number) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return { error: "ไม่มีสิทธิ์ในการยกเลิกการยืนยัน" }
  }

  try {
    await revertBillToSubmitted(billId)
    revalidatePath("/status")
    return { success: true }
  } catch (error) {
    console.error("Revert bill error:", error)
    return { error: "เกิดข้อผิดพลาดในการยกเลิกการยืนยัน" }
  }
}
