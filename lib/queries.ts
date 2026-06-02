import "server-only"
import { prisma } from "./db"
import type { UtilityBill, UtilityType, User, BillStatus, UserRole } from "./db"
import { Prisma } from "./generated/prisma"
import { getFiscalYear, FISCAL_MONTHS } from "./format"

export async function getUtilityTypes(): Promise<UtilityType[]> {
  const types = await prisma.utility_types.findMany({
    orderBy: { id: 'asc' }
  })
  return types.map(t => ({
    id: t.id,
    code: t.code,
    name_th: t.name_th,
    name_en: t.name_en,
    unit: t.unit,
    icon: t.icon,
    color: t.color
  }))
}

export interface DashboardSummary {
  currentMonthTotal: number
  previousMonthTotal: number
  yearTotal: number
  lastYearTotal: number
  billCount: number
  currentYear: number
  currentMonth: number
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date()
  const currentYear = getFiscalYear(now)
  const currentMonth = now.getMonth() + 1

  const maxRows = await prisma.$queryRaw<any[]>`SELECT MAX(billing_year) AS y FROM utility_bills`
  const dataYear = (maxRows[0]?.y as number) || currentYear
  const dataMonth = dataYear === currentYear ? currentMonth : 9 // 9 is September, end of fiscal year

  let prevMonth = dataMonth - 1
  let prevMonthYear = dataYear
  
  if (dataMonth === 10) {
    prevMonth = 9
    prevMonthYear = dataYear - 1
  } else if (dataMonth === 1) {
    prevMonth = 12
  }

  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      COALESCE(SUM(CASE WHEN billing_year = ${dataYear} AND billing_month = ${dataMonth} THEN amount END), 0)::float AS current_month_total,
      COALESCE(SUM(CASE WHEN billing_year = ${prevMonthYear} AND billing_month = ${prevMonth} THEN amount END), 0)::float AS previous_month_total,
      COALESCE(SUM(CASE WHEN billing_year = ${dataYear} THEN amount END), 0)::float AS year_total,
      COALESCE(SUM(CASE WHEN billing_year = ${dataYear - 1} THEN amount END), 0)::float AS last_year_total,
      COUNT(*)::int AS bill_count
    FROM utility_bills
  `

  const r = rows[0]
  return {
    currentMonthTotal: r.current_month_total,
    previousMonthTotal: r.previous_month_total,
    yearTotal: r.year_total,
    lastYearTotal: r.last_year_total,
    billCount: r.bill_count,
    currentYear: dataYear,
    currentMonth: dataMonth,
  }
}

export interface MonthlySeries {
  month: number
  [utilityCode: string]: number
}

export async function getMonthlyByType(year: number): Promise<MonthlySeries[]> {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT b.billing_month AS month, t.code, SUM(b.amount)::float AS total
    FROM utility_bills b
    JOIN utility_types t ON t.id = b.utility_type_id
    WHERE b.billing_year = ${year}
    GROUP BY b.billing_month, t.code
    ORDER BY b.billing_month ASC
  `

  const map = new Map<number, MonthlySeries>()
  for (const m of FISCAL_MONTHS) {
    map.set(m, { month: m })
  }
  for (const row of rows) {
    const entry = map.get(row.month)!
    entry[row.code] = row.total
  }
  return Array.from(map.values())
}

export interface TypeBreakdown {
  code: string
  name_th: string
  total: number
}

export async function getTypeBreakdown(year: number): Promise<TypeBreakdown[]> {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT t.code, t.name_th, SUM(b.amount)::float AS total
    FROM utility_bills b
    JOIN utility_types t ON t.id = b.utility_type_id
    WHERE b.billing_year = ${year}
    GROUP BY t.id, t.code, t.name_th
    ORDER BY total DESC
  `
  return rows as TypeBreakdown[]
}

export async function getLatestReportMonth(): Promise<{ year: number; month: number } | null> {
  const maxRow = await prisma.$queryRaw<any[]>`
    SELECT billing_year, billing_month 
    FROM utility_bills 
    ORDER BY 
      CASE WHEN billing_month >= 10 THEN billing_year - 1 ELSE billing_year END DESC, 
      billing_month DESC 
    LIMIT 1
  `
  if (!maxRow.length) return null
  return { year: maxRow[0].billing_year, month: maxRow[0].billing_month }
}

export interface MonthlyRollingSeries {
  month: number
  year: number
  [utilityCode: string]: number
}

export async function getRolling12MonthsByType(): Promise<MonthlyRollingSeries[]> {
  const latest = await getLatestReportMonth()
  if (!latest) return []

  const slots: { year: number, month: number }[] = []
  let cy = latest.year
  let cm = latest.month
  for (let i = 0; i < 12; i++) {
    slots.unshift({ year: cy, month: cm })
    if (cm === 10) {
      cy = cy - 1
      cm = 9
    } else if (cm === 1) {
      cm = 12
    } else {
      cm = cm - 1
    }
  }

  const types = await prisma.utility_types.findMany()

  const grouped = await prisma.utility_bills.groupBy({
    by: ['billing_year', 'billing_month', 'utility_type_id'],
    _sum: { amount: true },
    where: {
      OR: slots.map(s => ({ billing_year: s.year, billing_month: s.month }))
    }
  })

  const map = new Map<string, MonthlyRollingSeries>()
  for (const s of slots) {
    const key = `${s.year}-${s.month}`
    map.set(key, { month: s.month, year: s.year })
  }
  
  for (const row of grouped) {
    const key = `${row.billing_year}-${row.billing_month}`
    const entry = map.get(key)
    if (entry && row._sum.amount !== null) {
      const type = types.find(t => t.id === row.utility_type_id)
      if (type) {
        entry[type.code] = row._sum.amount
      }
    }
  }
  
  return Array.from(map.values())
}

export async function getRolling12MonthsBreakdown(): Promise<TypeBreakdown[]> {
  const latest = await getLatestReportMonth()
  if (!latest) return []

  const slots: { year: number, month: number }[] = []
  let cy = latest.year
  let cm = latest.month
  for (let i = 0; i < 12; i++) {
    slots.unshift({ year: cy, month: cm })
    if (cm === 10) {
      cy = cy - 1
      cm = 9
    } else if (cm === 1) {
      cm = 12
    } else {
      cm = cm - 1
    }
  }

  const types = await prisma.utility_types.findMany()

  const grouped = await prisma.utility_bills.groupBy({
    by: ['utility_type_id'],
    _sum: { amount: true },
    where: {
      OR: slots.map(s => ({ billing_year: s.year, billing_month: s.month }))
    }
  })

  const results: TypeBreakdown[] = []
  for (const row of grouped) {
    const type = types.find(t => t.id === row.utility_type_id)
    if (type && row._sum.amount !== null) {
      results.push({
        code: type.code,
        name_th: type.name_th,
        total: row._sum.amount
      })
    }
  }
  
  results.sort((a, b) => b.total - a.total)
  return results
}

function mapBill(b: any): UtilityBill {
  return {
    id: b.id,
    utility_type_id: b.utility_type_id,
    billing_year: b.billing_year,
    billing_month: b.billing_month,
    amount: b.amount.toString(),
    usage: b.usage?.toString() || null,
    location: b.location,
    reference_no: b.reference_no,
    note: b.note,
    created_by: b.created_by,
    created_at: b.created_at.toISOString(),
    updated_at: b.updated_at.toISOString(),
    status: b.status as BillStatus,
    approved_by: b.approved_by,
    approved_at: b.approved_at?.toISOString() || null,
    cost_center: b.cost_center,
    document_date: b.document_date?.toISOString() || null,
    document_no: b.document_no,
    document_type: b.document_type,
    gl_code: b.gl_code,
    budget_code: b.budget_code,
    own_agency: b.own_agency,
    proxy_agency: b.proxy_agency,
    meter_no: b.meter_no,
    invoice_date: b.invoice_date?.toISOString() || null,
    receive_date: b.receive_date?.toISOString() || null,
    proxy_send_date: b.proxy_send_date?.toISOString() || null,
    payer_receive_date: b.payer_receive_date?.toISOString() || null,
    has_receipt: b.has_receipt,
    has_direct_pay: b.has_direct_pay,
    has_ktb: b.has_ktb,
    file_url: b.file_url,
    utility_code: b.utility_type?.code,
    utility_name_th: b.utility_type?.name_th,
    utility_unit: b.utility_type?.unit,
    creator_name: b.creator?.full_name,
    approver_name: b.approver?.full_name,
  }
}

export async function getRecentBills(limit = 5): Promise<UtilityBill[]> {
  const bills = await prisma.utility_bills.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
    include: {
      utility_type: true,
      creator: true
    }
  })
  return bills.map(mapBill)
}

export interface BillsFilters {
  year?: number
  month?: number
  typeCode?: string
  search?: string
  limit?: number
  offset?: number
}

export async function getBills(filters: BillsFilters = {}): Promise<{ bills: UtilityBill[]; total: number }> {
  const { year, month, typeCode, search, limit = 50, offset = 0 } = filters

  const where: Prisma.utility_billsWhereInput = {}
  if (year) where.billing_year = year
  if (month) where.billing_month = month
  if (typeCode) where.utility_type = { code: typeCode }
  
  if (search) {
    where.OR = [
      { reference_no: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
      { note: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, bills] = await prisma.$transaction([
    prisma.utility_bills.count({ where }),
    prisma.utility_bills.findMany({
      where,
      orderBy: [
        { billing_year: 'desc' },
        { billing_month: 'desc' },
        { created_at: 'desc' }
      ],
      take: limit,
      skip: offset,
      include: {
        utility_type: true,
        creator: true
      }
    })
  ])

  return {
    bills: bills.map(mapBill),
    total
  }
}

export async function getBillById(id: number): Promise<UtilityBill | null> {
  const bill = await prisma.utility_bills.findUnique({
    where: { id },
    include: {
      utility_type: true,
      creator: true
    }
  })
  if (!bill) return null
  return mapBill(bill)
}

export async function getAvailableYears(): Promise<number[]> {
  const grouped = await prisma.utility_bills.groupBy({
    by: ['billing_year'],
    orderBy: { billing_year: 'desc' }
  })
  return grouped.map(g => g.billing_year)
}

export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.users.findMany({
    orderBy: [
      { role: 'asc' },
      { full_name: 'asc' }
    ]
  })
  return users.map(u => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    department: u.department,
    role: u.role as UserRole,
    is_active: u.is_active,
    created_at: u.created_at.toISOString(),
    updated_at: u.updated_at.toISOString(),
  }))
}

// ==================== Monthly Status Queries ====================

export interface MonthlyReportStatus {
  billing_year: number
  billing_month: number
  utility_type_id: number
  utility_code: string
  utility_name_th: string
  bill_id: number | null
  status: BillStatus | null
  amount: string | null
  created_by: number | null
  creator_name: string | null
  approved_by: number | null
  approver_name: string | null
  approved_at: string | null
  created_at: string | null
}

export async function getMonthlyReportStatuses(year: number): Promise<MonthlyReportStatus[]> {
  const rows = await prisma.$queryRaw<any[]>`
    WITH months AS (
      SELECT unnest(ARRAY[10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]) AS month
    ),
    report_slots AS (
      SELECT m.month AS billing_month, ${year}::int AS billing_year, t.id AS utility_type_id, t.code AS utility_code, t.name_th AS utility_name_th
      FROM months m
      CROSS JOIN utility_types t
    )
    SELECT 
      rs.billing_year,
      rs.billing_month,
      rs.utility_type_id,
      rs.utility_code,
      rs.utility_name_th,
      b.id AS bill_id,
      b.status,
      b.amount::text,
      b.created_by,
      u_creator.full_name AS creator_name,
      b.approved_by,
      u_approver.full_name AS approver_name,
      b.approved_at,
      b.created_at
    FROM report_slots rs
    LEFT JOIN utility_bills b ON b.billing_year = rs.billing_year 
      AND b.billing_month = rs.billing_month 
      AND b.utility_type_id = rs.utility_type_id
    LEFT JOIN users u_creator ON u_creator.id = b.created_by
    LEFT JOIN users u_approver ON u_approver.id = b.approved_by
    ORDER BY CASE WHEN rs.billing_month >= 10 THEN 0 ELSE 1 END, rs.billing_month ASC, rs.utility_code ASC
  `
  return rows.map(row => ({
    billing_year: row.billing_year,
    billing_month: row.billing_month,
    utility_type_id: row.utility_type_id,
    utility_code: row.utility_code,
    utility_name_th: row.utility_name_th,
    bill_id: row.bill_id || null,
    status: (row.status as BillStatus) || null,
    amount: row.amount || null,
    created_by: row.created_by || null,
    creator_name: row.creator_name || null,
    approved_by: row.approved_by || null,
    approver_name: row.approver_name || null,
    approved_at: row.approved_at ? new Date(row.approved_at).toISOString() : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
  }))
}

export async function approveBill(billId: number, approvedBy: number): Promise<void> {
  await prisma.utility_bills.updateMany({
    where: { id: billId, status: 'SUBMITTED' },
    data: {
      status: 'APPROVED',
      approved_by: approvedBy,
      approved_at: new Date(),
      updated_at: new Date()
    }
  })
}

export async function revertBillToSubmitted(billId: number): Promise<void> {
  await prisma.utility_bills.updateMany({
    where: { id: billId, status: 'APPROVED' },
    data: {
      status: 'SUBMITTED',
      approved_by: null,
      approved_at: null,
      updated_at: new Date()
    }
  })
}
