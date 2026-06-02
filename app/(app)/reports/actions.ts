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

  // File Upload handling
  let fileUrl = null
  const file = formData.get("file") as File | null
  if (file && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) {
      return { error: "ขนาดไฟล์ต้องไม่เกิน 5MB" }
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = path.extname(file.name)
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`
    
    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    try {
      await fs.mkdir(uploadsDir, { recursive: true })
      await fs.writeFile(path.join(uploadsDir, filename), buffer)
      fileUrl = `/uploads/${filename}`
    } catch (err) {
      console.error("File upload error:", err)
      return { error: "อัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่" }
    }
  }

  const typeId = parseInt10(formData.get("utility_type_id"))
  const year = parseInt10(formData.get("billing_year"))
  const month = parseInt10(formData.get("billing_month"))
  const amount = parseNumber(formData.get("amount"))
  
  if (!typeId || !year || !month || amount === null) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน (ประเภทรายการ, ปี, เดือน, จำนวนเงิน)" }
  }
  if (month < 1 || month > 12) return { error: "เดือนไม่ถูกต้อง" }
  if (amount < 0) return { error: "จำนวนเงินต้องไม่ติดลบ" }

  try {
    await prisma.utility_bills.create({
      data: {
        utility_type_id: typeId,
        billing_year: year,
        billing_month: month,
        amount: amount,
        usage: 0, // Fallback since it's required in schema
        location: "", // Fallback
        reference_no: "", // Fallback
        
        cost_center: String(formData.get("cost_center") || "").trim() || null,
        document_date: parseDate(formData.get("document_date")),
        document_no: String(formData.get("document_no") || "").trim() || null,
        document_type: String(formData.get("document_type") || "").trim() || null,
        gl_code: String(formData.get("gl_code") || "").trim() || null,
        budget_code: String(formData.get("budget_code") || "").trim() || null,
        own_agency: String(formData.get("own_agency") || "").trim() || null,
        proxy_agency: String(formData.get("proxy_agency") || "").trim() || null,
        meter_no: String(formData.get("meter_no") || "").trim() || null,
        invoice_date: parseDate(formData.get("invoice_date")),
        receive_date: parseDate(formData.get("receive_date")),
        proxy_send_date: parseDate(formData.get("proxy_send_date")),
        payer_receive_date: parseDate(formData.get("payer_receive_date")),
        has_receipt: parseCheckbox(formData.get("has_receipt")),
        has_direct_pay: parseCheckbox(formData.get("has_direct_pay")),
        has_ktb: parseCheckbox(formData.get("has_ktb")),
        
        note: String(formData.get("note") || "").trim() || null,
        file_url: fileUrl,
        
        created_by: user.id,
        status: "PENDING",
        updated_at: new Date()
      }
    })
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
