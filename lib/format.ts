export const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
]

export const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

export function formatTHB(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : (value ?? 0)
  if (Number.isNaN(n)) return "0.00"
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatNumber(value: number | string | null | undefined, digits = 2): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : (value ?? 0)
  if (Number.isNaN(n)) return "0"
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: digits,
  }).format(n)
}

export function toBuddhistYear(christianYear: number): number {
  return christianYear + 543
}

export function roleLabel(role: string): string {
  switch (role) {
    case "ADMIN":
      return "ผู้ดูแลระบบ"
    case "STAFF":
      return "เจ้าหน้าที่"
    case "USER":
      return "ผู้ใช้งาน"
    default:
      return role
  }
}

export function monthName(month: number): string {
  return THAI_MONTHS[month - 1] || `เดือน ${month}`
}

export function formatCurrency(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : (value ?? 0)
  if (Number.isNaN(n)) return "฿0.00"
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(n)
}

export const FISCAL_MONTHS = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]

export function getFiscalYear(date: Date = new Date()): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return month >= 10 ? year + 1 : year
}

export function getCalendarYearFromFiscal(fiscalYear: number, month: number): number {
  return month >= 10 ? fiscalYear - 1 : fiscalYear
}
