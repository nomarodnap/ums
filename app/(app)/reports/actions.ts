"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"

export type BillFormState = {
  error?: string
  success?: boolean
}

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null
  const n = Number.parseFloat(String(value))
  return Number.isNaN(n) ? null : n
}

function parseInt10(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null
  const n = Number.parseInt(String(value), 10)
  return Number.isNaN(n) ? null : n
}

function parseDate(value: FormDataEntryValue | null): Date | null {
  if (!value || value === "") return null
  const str = String(value).trim()

  if (str.includes('/')) {
    const parts = str.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const yearBE = parseInt(parts[2], 10)
      const yearCE = yearBE > 2400 ? yearBE - 543 : yearBE
      const d = new Date(yearCE, month, day)
      return Number.isNaN(d.getTime()) ? null : d
    }
  }

  if (str.includes('-')) {
    const parts = str.split('-')
    if (parts.length === 3) {
      const yearVal = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const yearCE = yearVal > 2400 ? yearVal - 543 : yearVal
      const d = new Date(yearCE, month, day)
      return Number.isNaN(d.getTime()) ? null : d
    }
  }

  const d = new Date(str)
  return Number.isNaN(d.getTime()) ? null : d
}

function parseCheckbox(value: FormDataEntryValue | null): boolean {
  return value === "true" || value === "on"
}

export async function createBillAction(_prev: BillFormState, formData: FormData): Promise<BillFormState> {
  let user
  try {
    user = await requireRole(["ADMIN", "STAFF"])
  } catch {
    return { error: "คุณไม่มีสิทธิ์บันทึกรายการ" }
  }

  // File Upload handling function
  async function processFile(file: File | null): Promise<string | null> {
    if (!file || file.size === 0) return null
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("ขนาดไฟล์ต้องไม่เกิน 5MB")
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = path.extname(file.name)
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`
    
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadsDir, { recursive: true })
    await fs.writeFile(path.join(uploadsDir, filename), buffer)
    return `/uploads/${filename}`
  }

  let receiptFileUrl = null
  let directPayFileUrl = null
  let ktbFileUrl = null

  try {
    receiptFileUrl = await processFile(formData.get("receipt_file") as File | null)
    directPayFileUrl = await processFile(formData.get("direct_pay_file") as File | null)
    ktbFileUrl = await processFile(formData.get("ktb_file") as File | null)
  } catch (err: any) {
    console.error("File upload error:", err)
    return { error: err.message || "อัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่" }
  }

  const year = parseInt10(formData.get("billing_year"))
  const month = parseInt10(formData.get("billing_month"))
  const invoiceYear = parseInt10(formData.get("invoice_year"))
  const invoiceMonth = parseInt10(formData.get("invoice_month"))
  const amount = parseNumber(formData.get("amount"))

  if (amount === null) {
    return { error: "กรุณากรอกจำนวนเงิน" }
  }
  if (month !== null && (month < 1 || month > 12)) return { error: "เดือนไม่ถูกต้อง" }
  if (amount < 0) return { error: "จำนวนเงินต้องไม่ติดลบ" }

  const proxy_agency = String(formData.get("proxy_agency") || "").trim() || null

  if (proxy_agency) {
    const validAgency = await prisma.users.findFirst({
      where: { full_name: proxy_agency }
    })
    if (!validAgency) {
      return { error: "พิมพ์ชื่อหน่วยงานที่ฝากเบิกไม่ถูกต้อง" }
    }
  }

  const idStr = formData.get("id")
  const id = idStr ? parseInt10(idStr) : null

  const commonData = {
    own_agency: String(formData.get("own_agency") || "").trim() || null,
    proxy_agency: String(formData.get("proxy_agency") || "").trim() || null,
    meter_no: String(formData.get("meter_no") || "").trim() || null,
    invoice_date: parseDate(formData.get("invoice_date")),
    invoice_year: invoiceYear,
    invoice_month: invoiceMonth,
    receive_date: parseDate(formData.get("receive_date")),
    proxy_send_date: parseDate(formData.get("proxy_send_date")),
    payer_receive_date: parseDate(formData.get("payer_receive_date")),
    note: String(formData.get("note") || "").trim() || null,
    updated_at: new Date()
  } as any

  if (receiptFileUrl) commonData.receipt_file_url = receiptFileUrl
  if (directPayFileUrl) commonData.direct_pay_file_url = directPayFileUrl
  if (ktbFileUrl) commonData.ktb_file_url = ktbFileUrl

  try {
    if (id) {
      // UPDATE: Only update the fields that the user is allowed to fill in
      await prisma.utility_bills.update({
        where: { id },
        data: {
          ...commonData,
          status: "SUBMITTED",
          reject_reason: null, // Clear the reject reason on resubmit
        }
      })
    } else {
      // CREATE: Save to base columns since there is no original data
      await prisma.utility_bills.create({
        data: {
          ...commonData,
          status: "SUBMITTED",
          created_by: user.id,
          reference_no: "", // Fallback
          billing_year: year,
          billing_month: month,
          amount: amount,
          cost_center: String(formData.get("cost_center") || "").trim() || null,
          document_date: parseDate(formData.get("document_date")),
          document_no: String(formData.get("document_no") || "").trim() || null,
          document_type: String(formData.get("document_type") || "").trim() || null,
          gl_code: String(formData.get("gl_code") || "").trim() || null,
          budget_code: String(formData.get("budget_code") || "").trim() || null,
        }
      })
    }
  } catch (err) {
    console.error("[v0] Create bill error:", err)
    return { error: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง" }
  }

  revalidatePath("/dashboard")
  revalidatePath("/reports")
  revalidatePath("/analytics")
  redirect("/reports")
}

export async function deleteBillAction(id: number): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireRole(["ADMIN", "STAFF"])
  } catch {
    return { error: "คุณไม่มีสิทธิ์ลบรายการ" }
  }

  try {
    await prisma.utility_bills.delete({ where: { id } })
  } catch (err) {
    console.error("[v0] Delete bill error:", err)
    return { error: "ไม่สามารถลบรายการได้" }
  }

  revalidatePath("/dashboard")
  revalidatePath("/reports")
  revalidatePath("/analytics")
  return { success: true }
}

export async function updateBillStatusAction(prev: BillFormState, formData: FormData): Promise<BillFormState> {
  let user
  try {
    user = await requireRole(["ADMIN"])
  } catch {
    return { error: "คุณไม่มีสิทธิ์ทำรายการนี้" }
  }

  const idStr = formData.get("id")
  const id = idStr ? parseInt10(idStr) : null
  const status = formData.get("status") as string
  const reject_reason = formData.get("reject_reason") as string | null

  if (!id) {
    return { error: "ไม่พบข้อมูลรายการ" }
  }

  if (!["APPROVED", "RETURNED", "REJECTED"].includes(status)) {
    return { error: "สถานะไม่ถูกต้อง" }
  }
  
  if ((status === "RETURNED" || status === "REJECTED") && !reject_reason?.trim()) {
    return { error: "กรุณาระบุเหตุผล" }
  }

  try {
    await prisma.utility_bills.update({
      where: { id },
      data: {
        status,
        reject_reason: (status === "RETURNED" || status === "REJECTED") ? reject_reason : null,
        approved_by: status === "APPROVED" ? user.id : null,
        approved_at: status === "APPROVED" ? new Date() : null,
        updated_at: new Date()
      }
    })
  } catch (err) {
    console.error("[v0] Update bill status error:", err)
    return { error: "ไม่สามารถอัปเดตสถานะรายการได้" }
  }

  revalidatePath("/dashboard")
  revalidatePath("/reports")
  revalidatePath("/status")
  revalidatePath("/analytics")
  return { success: true }
}
