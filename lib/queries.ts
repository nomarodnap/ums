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

export async function getAgencyUsers() {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      short_name: true,
      department: true
    },
    orderBy: { short_name: 'asc' }
  })
  return users
}

export async function getAvailableYears(): Promise<number[]> {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT DISTINCT 
      CASE WHEN EXTRACT(MONTH FROM document_date) >= 10 THEN EXTRACT(YEAR FROM document_date) + 1 
           ELSE EXTRACT(YEAR FROM document_date) END::int as y
    FROM utility_bills
    WHERE document_date IS NOT NULL
    ORDER BY y DESC
  `
  return rows.map(r => r.y).filter(Boolean)
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
  const targetDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const targetFiscalYear = getFiscalYear(targetDate)
  const targetMonth = targetDate.getMonth() + 1
  
  const maxRows = await prisma.$queryRaw<any[]>`
    SELECT 
      CASE WHEN EXTRACT(MONTH FROM document_date) >= 10 THEN EXTRACT(YEAR FROM document_date) + 1 
           ELSE EXTRACT(YEAR FROM document_date) END::int as y
    FROM utility_bills 
    WHERE document_date IS NOT NULL 
    ORDER BY document_date DESC 
    LIMIT 1
  `
  
  const dataYear = (maxRows[0]?.y as number) || targetFiscalYear
  const dataMonth = dataYear === targetFiscalYear ? targetMonth : 9  // 9 is September, end of fiscal year

  let prevMonth = dataMonth - 1
  let prevMonthYear = dataYear
  
  if (dataMonth === 10) {
    prevMonth = 9
    prevMonthYear = dataYear - 1
  } else if (dataMonth === 1) {
    prevMonth = 12
  }

  const currentMonthStart = new Date(dataYear - (dataMonth >= 10 ? 1 : 0), dataMonth - 1, 1)
  const currentMonthEnd = new Date(dataYear - (dataMonth >= 10 ? 1 : 0), dataMonth, 0)
  
  const prevMonthStart = new Date(prevMonthYear - (prevMonth >= 10 ? 1 : 0), prevMonth - 1, 1)
  const prevMonthEnd = new Date(prevMonthYear - (prevMonth >= 10 ? 1 : 0), prevMonth, 0)

  const currentYearStart = new Date(dataYear - 1, 9, 1)
  const currentYearEnd = new Date(dataYear, 9, 0)

  const lastYearStart = new Date(dataYear - 2, 9, 1)
  const lastYearEnd = new Date(dataYear - 1, 9, 0)

  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      COALESCE(SUM(CASE WHEN document_date >= ${currentMonthStart} AND document_date <= ${currentMonthEnd} THEN amount END), 0)::float AS current_month_total,
      COALESCE(SUM(CASE WHEN document_date >= ${prevMonthStart} AND document_date <= ${prevMonthEnd} THEN amount END), 0)::float AS previous_month_total,
      COALESCE(SUM(CASE WHEN document_date >= ${currentYearStart} AND document_date <= ${currentYearEnd} THEN amount END), 0)::float AS year_total,
      COALESCE(SUM(CASE WHEN document_date >= ${lastYearStart} AND document_date <= ${lastYearEnd} THEN amount END), 0)::float AS last_year_total,
      COUNT(*)::int AS bill_count
    FROM utility_bills
    WHERE document_date IS NOT NULL
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
  const startDate = new Date(year - 1, 9, 1)
  const endDate = new Date(year, 9, 0)

  const rows = await prisma.$queryRaw<any[]>`
    SELECT 
      EXTRACT(MONTH FROM b.document_date)::int as cal_month,
      b.gl_code as code,
      SUM(b.amount)::float as total
    FROM utility_bills b
    WHERE b.document_date >= ${startDate} AND b.document_date <= ${endDate} AND b.gl_code IS NOT NULL
    GROUP BY EXTRACT(MONTH FROM b.document_date), b.gl_code
  `
  // Use fiscal months order: Oct, Nov, Dec, Jan, ..., Sep
  const fiscalMonths = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const series: MonthlySeries[] = fiscalMonths.map(m => ({ month: m }))
  
  for (const row of rows) {
    const idx = series.findIndex(s => s.month === row.cal_month)
    if (idx !== -1 && row.code) {
      series[idx][row.code] = row.total || 0
    }
  }
  return series
}

export interface TypeBreakdown {
  code: string
  name_th: string
  total: number
}

export async function getTypeBreakdown(year: number): Promise<TypeBreakdown[]> {
  const startDate = new Date(year - 1, 9, 1)
  const endDate = new Date(year, 9, 0)

  const rows = await prisma.$queryRaw<any[]>`
    SELECT 
      t.code,
      t.name_th,
      SUM(b.amount)::float as total
    FROM utility_bills b
    JOIN utility_types t ON b.gl_code = t.code
    WHERE b.document_date >= ${startDate} AND b.document_date <= ${endDate} AND b.gl_code IS NOT NULL
    GROUP BY t.code, t.name_th
    ORDER BY total DESC
  `
  return rows.map(r => ({
    code: r.code,
    name_th: r.name_th,
    total: r.total || 0
  }))
}

export async function getLatestReportMonth(): Promise<{ year: number; month: number } | null> {
  const maxRow = await prisma.$queryRaw<any[]>`
    SELECT billing_year, billing_month 
    FROM utility_bills 
    WHERE billing_year IS NOT NULL AND billing_month IS NOT NULL
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
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1)
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0)

  const months: { year: number; month: number }[] = []
  let calYear = startDate.getFullYear()
  let calMonth = startDate.getMonth() + 1
  for (let i = 0; i < 12; i++) {
    const fiscalYear = calMonth >= 10 ? calYear + 1 : calYear
    months.push({ year: fiscalYear, month: calMonth })
    calMonth++
    if (calMonth > 12) {
      calMonth = 1
      calYear++
    }
  }

  const rows = await prisma.$queryRaw<any[]>`
    SELECT 
      EXTRACT(YEAR FROM b.document_date)::int as cal_year,
      EXTRACT(MONTH FROM b.document_date)::int as cal_month,
      b.gl_code as code,
      SUM(b.amount)::float as total
    FROM utility_bills b
    WHERE b.gl_code IS NOT NULL
      AND b.document_date >= ${startDate}
      AND b.document_date <= ${endDate}
    GROUP BY EXTRACT(YEAR FROM b.document_date), EXTRACT(MONTH FROM b.document_date), b.gl_code
  `

  const series: MonthlyRollingSeries[] = months.map(m => ({
    month: m.month,
    year: m.year,
  }))

  for (const row of rows) {
    const rowFiscalYear = row.cal_month >= 10 ? row.cal_year + 1 : row.cal_year
    const idx = series.findIndex(s => s.year === rowFiscalYear && s.month === row.cal_month)
    if (idx !== -1 && row.code) {
      series[idx][row.code] = row.total || 0
    }
  }

  return series
}

export async function getRolling12MonthsBreakdown(): Promise<TypeBreakdown[]> {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1)
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0)

  const rows = await prisma.$queryRaw<any[]>`
    SELECT 
      t.code,
      t.name_th,
      SUM(b.amount)::float as total
    FROM utility_bills b
    JOIN utility_types t ON b.gl_code = t.code
    WHERE b.document_date >= ${startDate} AND b.document_date <= ${endDate} AND b.gl_code IS NOT NULL
    GROUP BY t.code, t.name_th
    ORDER BY total DESC
  `

  return rows.map(r => ({
    code: r.code,
    name_th: r.name_th,
    total: r.total || 0
  }))
}

function mapBill(b: any): UtilityBill {
  return {
    id: b.id,
    billing_year: b.billing_year,
    billing_month: b.billing_month,
    amount: b.amount.toString(),
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
    invoice_year: b.invoice_year,
    invoice_month: b.invoice_month,
    receive_date: b.receive_date?.toISOString() || null,
    proxy_send_date: b.proxy_send_date?.toISOString() || null,
    payer_receive_date: b.payer_receive_date?.toISOString() || null,
    has_receipt: b.has_receipt,
    has_direct_pay: b.has_direct_pay,
    has_ktb: b.has_ktb,
    file_url: b.file_url,
    receipt_file_url: b.receipt_file_url,
    direct_pay_file_url: b.direct_pay_file_url,
    ktb_file_url: b.ktb_file_url,
    reject_reason: b.reject_reason,
    creator_name: b.creator?.short_name,
    approver_name: b.approver?.short_name,
  }
}

export async function getRecentBills(limit = 5): Promise<UtilityBill[]> {
  const bills = await prisma.utility_bills.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
    include: {
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
  costCenter?: string | null
  status?: string | null
}

export async function getBills(filters: BillsFilters = {}): Promise<{ bills: UtilityBill[]; total: number }> {
  const { year, month, typeCode, search, limit = 50, offset = 0, costCenter, status } = filters

  const where: Prisma.utility_billsWhereInput = {}
  const andConditions: Prisma.utility_billsWhereInput[] = []

  if (typeof costCenter === 'string') {
    andConditions.push({ cost_center: costCenter })
  }
  
  if (status) {
    andConditions.push({ status })
  }

  if (year) {
    andConditions.push({ billing_year: year })
  }

  if (month) {
    andConditions.push({ billing_month: month })
  }
  
  if (typeCode) {
    andConditions.push({ gl_code: typeCode })
  }
  
  if (search) {
    andConditions.push({
      OR: [
        { reference_no: { contains: search, mode: 'insensitive' } },
        { note: { contains: search, mode: 'insensitive' } },
        { own_agency: { contains: search, mode: 'insensitive' } },
        { proxy_agency: { contains: search, mode: 'insensitive' } },
        { cost_center: { contains: search, mode: 'insensitive' } },
      ]
    })
  }
  
  if (andConditions.length > 0) {
    where.AND = andConditions
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
      creator: true
    }
  })
  if (!bill) return null
  return mapBill(bill)
}


export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.users.findMany({
    orderBy: [
      { role: 'asc' },
      { short_name: 'asc' }
    ]
  })
  return users.map(u => ({
    id: u.id,
    email: u.email,
    short_name: u.short_name,
    department: u.department,
    cost_center: u.cost_center,
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
  const types = await prisma.utility_types.findMany({
    orderBy: { id: 'asc' }
  })
  
  const bills = await prisma.utility_bills.findMany({
    where: { billing_year: year },
    include: {
      creator: true,
      approver: true
    }
  })

  const statuses: MonthlyReportStatus[] = []
  
  for (const month of FISCAL_MONTHS) {
    for (const type of types) {
      const bill = bills.find(b => b.billing_month === month && b.gl_code === type.code)
      
      statuses.push({
        billing_year: year,
        billing_month: month,
        utility_type_id: type.id,
        utility_code: type.code,
        utility_name_th: type.name_th,
        bill_id: bill ? bill.id : null,
        status: bill ? (bill.status as BillStatus) : null,
        amount: bill ? bill.amount.toString() : null,
        created_by: bill ? bill.created_by : null,
        creator_name: bill?.creator?.short_name || null,
        approved_by: bill ? bill.approved_by : null,
        approver_name: bill?.approver?.short_name || null,
        approved_at: bill?.approved_at?.toISOString() || null,
        created_at: bill?.created_at?.toISOString() || null
      })
    }
  }

  return statuses
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
