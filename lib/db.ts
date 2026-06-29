export { prisma } from "./prisma"

export type UserRole = "ADMIN" | "STAFF" | "USER"

export interface User {
  id: number
  email: string
  full_name: string
  department: string | null
  cost_center: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UtilityType {
  id: number
  code: string
  name_th: string
  name_en: string
  unit: string
  icon: string | null
  color: string | null
}

export type BillStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "RETURNED" | "REJECTED"

export interface UtilityBill {
  id: number
  billing_year: number
  billing_month: number
  amount: string
  reference_no: string | null
  note: string | null
  created_by: number | null
  created_at: string
  updated_at: string
  status: BillStatus
  approved_by: number | null
  approved_at: string | null
  cost_center?: string | null
  document_date?: string | null
  document_no?: string | null
  document_type?: string | null
  gl_code?: string | null
  budget_code?: string | null
  own_agency?: string | null
  proxy_agency?: string | null
  meter_no?: string | null
  invoice_date?: string | null
  invoice_year?: number | null
  invoice_month?: number | null
  receive_date?: string | null
  proxy_send_date?: string | null
  payer_receive_date?: string | null
  has_receipt?: boolean
  has_direct_pay?: boolean
  has_ktb?: boolean
  file_url?: string | null
  receipt_file_url?: string | null
  direct_pay_file_url?: string | null
  ktb_file_url?: string | null
  reject_reason?: string | null
  // joined fields
  creator_name?: string
  approver_name?: string
}
