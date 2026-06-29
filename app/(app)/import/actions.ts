"use server"

import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import * as xlsx from "xlsx"

export async function importExcelAction(formData: FormData) {
  try {
    const session = await requireRole(["ADMIN", "STAFF"])
    
    const file = formData.get("file") as File
    if (!file) {
      return { error: "ไม่พบไฟล์" }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const workbook = xlsx.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Parse to JSON array of arrays, skipping header
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    // Remove the first row (header)
    if (data.length > 0) {
      data.shift()
    }

    // Filter out empty rows
    const rows = data.filter(row => row.length > 0 && row.some(cell => cell !== undefined && cell !== null && cell !== ''))

    if (rows.length === 0) {
      return { error: "ไม่มีข้อมูลในไฟล์" }
    }

    let successCount = 0

    // Process each row
    for (const row of rows) {
      const costCenter = row[0] ? String(row[0]).trim() : null
      const docDateStr = row[1] ? String(row[1]).trim() : null
      const docNo = row[2] ? String(row[2]).trim() : null
      const docType = row[3] ? String(row[3]).trim() : null
      const glCode = row[4] ? String(row[4]).trim() : null
      const budgetCode = row[5] ? String(row[5]).trim() : null
      const amountStr = row[6] ? String(row[6]).trim().replace(/,/g, '') : "0"
      const parsedAmount = parseFloat(amountStr)
      const finalAmount = isNaN(parsedAmount) ? 0 : parsedAmount

      // Parse date 'dd.mm.yyyy' or 'dd/mm/yyyy' (พ.ศ.)
      let documentDate: Date | null = null
      let billingYear: number | null = null
      let billingMonth: number | null = null

      if (docDateStr) {
        const parts = docDateStr.split(/[./-]/)
        if (parts.length === 3) {
          const dd = parseInt(parts[0], 10)
          const mm = parseInt(parts[1], 10)
          let yyyy = parseInt(parts[2], 10)
          
          // Convert พ.ศ. to ค.ศ. if year > 2500
          if (yyyy > 2500) {
            yyyy -= 543
          }
          
          if (!isNaN(dd) && !isNaN(mm) && !isNaN(yyyy)) {
            documentDate = new Date(yyyy, mm - 1, dd)
          }
        }
      }

      // We determine who should be the creator. Try to find user by cost_center.
      let createdById = session.id
      if (costCenter) {
        const userWithCostCenter = await prisma.users.findFirst({
          where: { cost_center: costCenter }
        })
        if (userWithCostCenter) {
          createdById = userWithCostCenter.id
        } else {
          // As per requirement "บันทึกลงใน cost_center ใน users"
          // If we couldn't find a user, maybe update current user if they don't have one?
          // Or just leave it. We will save it in the bill itself.
          
          // Let's actually check if current user has cost center. If not, set it.
          const currentUser = await prisma.users.findUnique({ where: { id: session.id }})
          if (currentUser && !currentUser.cost_center) {
            await prisma.users.update({
              where: { id: session.id },
              data: { cost_center: costCenter }
            })
          }
        }
      }

      await prisma.utility_bills.create({
        data: {
          billing_year: billingYear,
          billing_month: billingMonth,
          amount: finalAmount,
          reference_no: docNo || "-",
          status: "PENDING",
          created_by: createdById,
          updated_at: new Date(),
          cost_center: costCenter,
          document_date: documentDate,
          document_no: docNo,
          document_type: docType,
          gl_code: glCode,
          budget_code: budgetCode,
        }
      })
      successCount++
    }

    return { success: true, count: successCount }
  } catch (err) {
    console.error("Import error:", err)
    return { error: "เกิดข้อผิดพลาดในการประมวลผลข้อมูล" }
  }
}

export async function previewExcelAction(formData: FormData) {
  try {
    const session = await requireRole(["ADMIN", "STAFF"])
    const file = formData.get("file") as File
    if (!file) return { error: "ไม่พบไฟล์" }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const workbook = xlsx.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (data.length > 0) data.shift()

    const rows = data.filter(row => row.length > 0 && row.some(cell => cell !== undefined && cell !== null && cell !== ''))
    if (rows.length === 0) return { error: "ไม่มีข้อมูลในไฟล์" }

    const parsedRows = rows.map((row, index) => {
      const costCenter = row[0] ? String(row[0]).trim() : null
      const docDateStr = row[1] ? String(row[1]).trim() : null
      const docNo = row[2] ? String(row[2]).trim() : null
      const docType = row[3] ? String(row[3]).trim() : null
      const glCode = row[4] ? String(row[4]).trim() : null
      const budgetCode = row[5] ? String(row[5]).trim() : null
      const amountStr = row[6] ? String(row[6]).trim().replace(/,/g, '') : "0"
      const parsedAmount = parseFloat(amountStr)
      const finalAmount = isNaN(parsedAmount) ? 0 : parsedAmount

      return {
        id: index,
        costCenter,
        docDateStr,
        docNo,
        docType,
        glCode,
        budgetCode,
        amount: finalAmount
      }
    })

    return { success: true, data: parsedRows }
  } catch (err) {
    console.error("Preview error:", err)
    return { error: "เกิดข้อผิดพลาดในการอ่านไฟล์" }
  }
}
