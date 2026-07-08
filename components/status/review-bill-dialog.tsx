"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatTHB, toBuddhistYear, THAI_MONTHS } from "@/lib/format"
import { ReviewActions } from "./review-actions"
import { CheckCircle2, FileText, Calendar, File, Building2, Link as LinkIcon, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UtilityBill, UtilityType } from "@/lib/db"

export function ReviewBillDialog({ 
  children, 
  bill,
  types
}: { 
  children: React.ReactNode
  bill: UtilityBill
  types: UtilityType[]
}) {
  const [open, setOpen] = useState(false)
  
  // Reported data
  const monthName = bill.billing_month ? THAI_MONTHS[bill.billing_month - 1] : "-"
  const yearName = bill.billing_year ? toBuddhistYear(bill.billing_year) : "-"
  const invoiceMonthName = bill.invoice_month ? THAI_MONTHS[bill.invoice_month - 1] : "-"
  const invoiceYearName = bill.invoice_year ? toBuddhistYear(bill.invoice_year) : "-"
  const typeName = bill.gl_code ? types.find(t => t.code === bill.gl_code)?.name_th : "-"
  const amount = bill.amount ? parseFloat(bill.amount) : 0
  const costCenter = bill.cost_center || "-"
  const documentNo = bill.document_no || "-"
  const budgetCode = bill.budget_code || "-"
  const documentType = bill.document_type || "-"
  const glCode = bill.gl_code || "-"
  const meterNo = bill.meter_no || "-"
  const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-2xl border-none">
        <div className="p-6 pb-2 sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
              รายละเอียดรายการเบิกจ่าย
              {bill.status === "APPROVED" && (
                <span className="inline-flex items-center text-sm font-medium text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> อนุมัติแล้ว
                </span>
              )}
              {bill.status === "SUBMITTED" && (
                <span className="inline-flex items-center text-sm font-medium text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                  <FileText className="w-4 h-4 mr-1" /> รอตรวจสอบ
                </span>
              )}
              {bill.status === "RETURNED" && (
                <span className="inline-flex items-center text-sm font-medium text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <FileText className="w-4 h-4 mr-1" /> ส่งกลับแก้ไข
                </span>
              )}
              {bill.status === "REJECTED" && (
                <span className="inline-flex items-center text-sm font-medium text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
                  <FileText className="w-4 h-4 mr-1" /> ไม่อนุมัติ
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              ข้อมูลที่ผู้ใช้งานส่งเข้ามาเพื่อขออนุมัติเบิกจ่าย
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-4 sm:p-6 pt-4 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-start justify-end gap-4">
            <ReviewActions billId={bill.id} status={bill.status} onSuccess={() => setOpen(false)} />
          </div>

          {bill.status === "APPROVED" && (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-900">รายการนี้ได้รับการอนุมัติเรียบร้อยแล้ว</p>
                <p className="text-sm text-emerald-700 mt-1">
                  อนุมัติโดย: <span className="font-medium">{bill.approver_name || "แอดมิน"}</span> เมื่อวันที่ {bill.approved_at ? new Date(bill.approved_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                </p>
              </div>
            </div>
          )}

          {bill.status === "RETURNED" && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">รายการนี้ถูกส่งกลับเพื่อแก้ไข</p>
                <p className="text-sm text-amber-700 mt-1">
                  <strong>เหตุผล:</strong> {bill.reject_reason || "-"}
                </p>
              </div>
            </div>
          )}

          {bill.status === "REJECTED" && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <FileText className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-red-900">รายการนี้ไม่อนุมัติ</p>
                <p className="text-sm text-red-700 mt-1">
                  <strong>เหตุผล:</strong> {bill.reject_reason || "-"}
                </p>
              </div>
            </div>
          )}

          {/* 1. ข้อมูลเอกสารทั่วไป */}
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> ข้อมูลเอกสารทั่วไป
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y divide-border grid grid-cols-1 md:grid-cols-2">
                <div className="px-5 py-3 flex justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2">ศูนย์ต้นทุน</dt>
                  <dd className="text-sm font-medium text-right">{costCenter}</dd>
                </div>
                <div className="px-5 py-3 flex justify-between gap-4 hover:bg-muted/30 transition-colors md:border-l">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2">วันที่เอกสาร</dt>
                  <dd className="text-sm font-medium text-right">{formatDate(bill.document_date)}</dd>
                </div>
                <div className="px-5 py-3 flex justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2">เลขเอกสาร</dt>
                  <dd className="text-sm font-medium text-right">{documentNo}</dd>
                </div>
                <div className="px-5 py-3 flex justify-between gap-4 hover:bg-muted/30 transition-colors md:border-l">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2">ประเภทเอกสาร</dt>
                  <dd className="text-sm font-medium text-right">{documentType}</dd>
                </div>
                <div className="px-5 py-3 flex justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2">รหัสแยกประเภท</dt>
                  <dd className="text-sm font-medium text-right">{glCode} ({typeName})</dd>
                </div>
                <div className="px-5 py-3 flex justify-between gap-4 hover:bg-muted/30 transition-colors md:border-l">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2">รหัสงบประมาณ</dt>
                  <dd className="text-sm font-medium text-right">{budgetCode}</dd>
                </div>
                <div className="px-5 py-4 flex justify-between items-center bg-background/50 hover:bg-muted/30 transition-colors md:col-span-2">
                  <dt className="text-sm text-muted-foreground">จำนวนเงิน</dt>
                  <dd className="text-lg font-bold text-primary tabular-nums">{formatTHB(amount)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 2. หน่วยงานที่เบิกจ่าย */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" /> หน่วยงานที่เบิกจ่าย
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="divide-y divide-border">
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">หน่วยงานตนเอง</dt>
                    <dd className="text-sm font-medium col-span-2 text-right">{bill.own_agency || "-"}</dd>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">หน่วยงานฝากเบิก</dt>
                    <dd className="text-sm font-medium col-span-2 text-right">{bill.proxy_agency || "-"}</dd>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">ผู้ส่งข้อมูล</dt>
                    <dd className="text-sm font-medium col-span-2 text-right">{bill.creator_name || "-"}</dd>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">ส่งเมื่อ</dt>
                    <dd className="text-sm font-medium col-span-2 text-right">
                      {bill.created_at ? new Date(bill.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* 3. ข้อมูลใบแจ้งหนี้ */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" /> ข้อมูลใบแจ้งหนี้
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="divide-y divide-border">
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">ประจำเดือน/ปี (บันทึก)</dt>
                    <dd className="text-sm font-medium col-span-2 text-right text-primary">{monthName} {yearName}</dd>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">ประจำเดือน/ปี (ใบแจ้งหนี้)</dt>
                    <dd className="text-sm font-medium col-span-2 text-right">
                      {invoiceMonthName} {invoiceYearName}
                    </dd>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">เลขมิเตอร์/ผู้ใช้/เบอร์โทร</dt>
                    <dd className="text-sm font-medium col-span-2 text-right">{meterNo}</dd>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">วันที่ใบแจ้งหนี้</dt>
                    <dd className="text-sm font-medium col-span-2 text-right">{formatDate(bill.invoice_date)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* 4. วันที่ลงรับ */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" /> วันที่ลงรับ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="divide-y divide-border">
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">ลงรับใบแจ้งหนี้</dt>
                    <dd className="text-sm font-medium col-span-2 text-right">{formatDate(bill.receive_date)}</dd>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">หน่วยฝากเบิกส่ง</dt>
                    <dd className="text-sm font-medium col-span-2 text-right">{formatDate(bill.proxy_send_date)}</dd>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-muted/30 transition-colors">
                    <dt className="text-sm text-muted-foreground">หน่วยเบิกจ่ายลงรับ</dt>
                    <dd className="text-sm font-medium col-span-2 text-right">{formatDate(bill.payer_receive_date)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* 5. เอกสารแนบ */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" /> เอกสารแนบ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-3">
                <FileAttachment label="ใบเสร็จรับเงิน" url={bill.receipt_file_url} />
                <FileAttachment label="รายงานจ่ายตรง" url={bill.direct_pay_file_url} />
                <FileAttachment label="รายงาน KTB" url={bill.ktb_file_url} />
                
                {!bill.receipt_file_url && !bill.direct_pay_file_url && !bill.ktb_file_url && (
                  <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg border border-dashed">
                    ไม่มีไฟล์เอกสารแนบ
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 6. หมายเหตุ */}
          {bill.note && (
            <Card className="shadow-sm bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">หมายเหตุเพิ่มเติม</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{bill.note}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FileAttachment({ label, url }: { label: string, url?: string | null }) {
  if (!url) return null;
  
  const fileName = url.split('/').pop() || 'เอกสารแนบ'
  
  return (
    <div className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0">
          <File className="w-4 h-4" />
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm font-medium truncate" title={fileName}>{fileName}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" asChild className="shrink-0 h-8 w-8 text-muted-foreground hover:text-primary">
        <a href={url} target="_blank" rel="noopener noreferrer" title="ดาวน์โหลด">
          <Download className="w-4 h-4" />
        </a>
      </Button>
    </div>
  )
}
