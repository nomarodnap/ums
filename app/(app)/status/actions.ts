"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { approveBill, revertBillToSubmitted } from "@/lib/queries"
import { prisma } from "@/lib/db"

async function notifyStatusChange(billId: number, statusText: string) {
  const bill = await prisma.utility_bills.findUnique({
    where: { id: billId },
    select: { cost_center: true, reference_no: true }
  })
  if (!bill || !bill.cost_center) return

  const targetUsers = await prisma.users.findMany({
    where: {
      cost_center: bill.cost_center,
      is_active: true
    },
    select: { id: true }
  })

  if (targetUsers.length > 0) {
    await prisma.notifications.createMany({
      data: targetUsers.map(u => ({
        user_id: u.id,
        title: "แจ้งผลการตรวจสอบรายงาน",
        message: `รายงานค่าสาธารณูปโภค เลขที่เอกสาร ${bill.reference_no || "-"} ได้รับการปรับปรุงสถานะเป็น "${statusText}" เรียบร้อยแล้ว`,
        type: "STATUS_CHANGE",
        bill_id: billId,
        created_at: new Date(),
      }))
    })
  }
}


export async function approveBillAction(billId: number) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return { error: "ไม่มีสิทธิ์ในการยืนยันรายงาน" }
  }

  try {
    await approveBill(billId, user.id)
    await notifyStatusChange(billId, "อนุมัติรายการ")
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
