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

    const parsedRows = []
    let rowIndex = 2

    // Parse and validate each row first
    for (const row of rows) {
      const costCenter = row[0] ? String(row[0]).trim() : null
      const docDateStr = row[1] ? String(row[1]).trim() : null
      const docNo = row[2] ? String(row[2]).trim() : null
      const docType = row[3] ? String(row[3]).trim() : null
      const glCode = row[4] ? String(row[4]).trim() : null
      const budgetCode = row[5] ? String(row[5]).trim() : null
      const originalAmountStr = row[6] ? String(row[6]).trim() : "0"

      const errors: Record<string, boolean> = {}

      if (!costCenter || !/^\d{10}$/.test(costCenter)) errors.costCenter = true
      if (!docDateStr || !/^\d{2}\.\d{2}\.\d{4}$/.test(docDateStr)) errors.docDateStr = true
      if (!docNo || !/^\d{10}$/.test(docNo)) errors.docNo = true
      if (!docType || !/^.{2}$/.test(docType)) errors.docType = true
      if (!glCode || !/^\d{10}$/.test(glCode)) errors.glCode = true
      if (!budgetCode || !/^\d{20}$/.test(budgetCode)) errors.budgetCode = true
      if (!/^-?\d{1,3}(,\d{3})*\.\d{2}$/.test(originalAmountStr)) errors.amount = true

      if (Object.keys(errors).length > 0) {
        return { error: `พบข้อมูลที่ไม่ถูกต้องในแถวที่ ${rowIndex} โปรดตรวจสอบรูปแบบข้อมูลและลองอีกครั้ง` }
      }

      const amountStr = originalAmountStr.replace(/,/g, '')
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
            billingYear = yyyy
            billingMonth = mm
          }
        }
      }

      parsedRows.push({
        costCenter,
        docDateStr,
        docNo,
        docType,
        glCode,
        budgetCode,
        finalAmount,
        documentDate,
        billingYear,
        billingMonth
      })

      rowIndex++
    }

    let successCount = 0
    const importedByCostCenter: Record<string, number> = {}

    // Process each valid row
    for (const row of parsedRows) {
      let createdById = session.id
      if (row.costCenter) {
        const userWithCostCenter = await prisma.users.findFirst({
          where: { cost_center: row.costCenter }
        })
        if (userWithCostCenter) {
          createdById = userWithCostCenter.id
        } else {
          const currentUser = await prisma.users.findUnique({ where: { id: session.id } })
          if (currentUser && !currentUser.cost_center) {
            await prisma.users.update({
              where: { id: session.id },
              data: { cost_center: row.costCenter }
            })
          }
        }
      }

      await prisma.utility_bills.create({
        data: {
          billing_year: row.billingYear,
          billing_month: row.billingMonth,
          amount: row.finalAmount,
          reference_no: row.docNo || "-",
          status: "PENDING",
          created_by: createdById,
          updated_at: new Date(),
          cost_center: row.costCenter,
          document_date: row.documentDate,
          document_no: row.docNo,
          document_type: row.docType,
          gl_code: row.glCode,
          budget_code: row.budgetCode,
        }
      })
      
      if (row.costCenter) {
        importedByCostCenter[row.costCenter] = (importedByCostCenter[row.costCenter] || 0) + 1
      }
      successCount++
    }

    // Create notifications for each cost center
    for (const [costCenter, count] of Object.entries(importedByCostCenter)) {
      const targetUsers = await prisma.users.findMany({
        where: {
          cost_center: costCenter,
          is_active: true
        },
        select: { id: true }
      })

      if (targetUsers.length > 0) {
        await prisma.notifications.createMany({
          data: targetUsers.map((u) => ({
            user_id: u.id,
            title: "แจ้งเตือนการนำเข้าข้อมูลระบบ",
            message: `ระบบได้ดำเนินการนำเข้าข้อมูลค่าสาธารณูปโภค จำนวน ${count} รายการ สำหรับรหัสศูนย์ต้นทุน ${costCenter} เป็นที่เรียบร้อยแล้ว`,
            type: "NEW_REPORT",
            created_at: new Date(),
          }))
        })
      }
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

    let hasErrors = false

    const parsedRows = rows.map((row, index) => {
      const costCenter = row[0] ? String(row[0]).trim() : null
      const docDateStr = row[1] ? String(row[1]).trim() : null
      const docNo = row[2] ? String(row[2]).trim() : null
      const docType = row[3] ? String(row[3]).trim() : null
      const glCode = row[4] ? String(row[4]).trim() : null
      const budgetCode = row[5] ? String(row[5]).trim() : null
      const originalAmountStr = row[6] ? String(row[6]).trim() : "0"
      
      const errors: Record<string, boolean> = {}

      if (!costCenter || !/^\d{10}$/.test(costCenter)) errors.costCenter = true
      if (!docDateStr || !/^\d{2}\.\d{2}\.\d{4}$/.test(docDateStr)) errors.docDateStr = true
      if (!docNo || !/^\d{10}$/.test(docNo)) errors.docNo = true
      if (!docType || !/^.{2}$/.test(docType)) errors.docType = true
      if (!glCode || !/^\d{10}$/.test(glCode)) errors.glCode = true
      if (!budgetCode || !/^\d{20}$/.test(budgetCode)) errors.budgetCode = true
      if (!/^-?\d{1,3}(,\d{3})*\.\d{2}$/.test(originalAmountStr)) errors.amount = true

      if (Object.keys(errors).length > 0) hasErrors = true

      const amountStr = originalAmountStr.replace(/,/g, '')
      const parsedAmount = parseFloat(amountStr)
      const finalAmount = isNaN(parsedAmount) ? 0 : parsedAmount

      return {
        id: index,
        rowNumber: index + 2, // Row 1 is header
        costCenter,
        docDateStr,
        docNo,
        docType,
        glCode,
        budgetCode,
        amount: finalAmount,
        originalAmountStr,
        errors
      }
    })

    return { success: true, data: parsedRows, hasErrors }
  } catch (err) {
    console.error("Preview error:", err)
    return { error: "เกิดข้อผิดพลาดในการอ่านไฟล์" }
  }
}
