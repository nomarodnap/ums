"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { formatTHB, toBuddhistYear, THAI_MONTHS } from "@/lib/format"
import type { UtilityBill, UtilityType } from "@/lib/db"
import { Inbox, CheckCircle2, FileText } from "lucide-react"
import Link from "next/link"

export function AdminStatusTable({ bills, types }: { bills: UtilityBill[]; types: UtilityType[] }) {
  if (bills.length === 0) {
    return (
      <Empty className="py-16 rounded-lg border border-border bg-card">
        <EmptyHeader>
          <Inbox className="w-8 h-8 text-muted-foreground" aria-hidden />
          <EmptyTitle>ไม่พบข้อมูลรายการที่ถูกส่งมา</EmptyTitle>
          <EmptyDescription>รายการที่ผู้ใช้ส่งหรือรอการอนุมัติจะแสดงในส่วนนี้</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ศูนย์ต้นทุน</TableHead>
              <TableHead>วันที่เอกสาร</TableHead>
              <TableHead>เลขที่เอกสาร</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>รหัสแยกประเภท</TableHead>
              <TableHead>รหัสงบประมาณ</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead className="text-center">สถานะ</TableHead>
              <TableHead className="w-[120px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="text-sm">{b.cost_center || "-"}</TableCell>
                <TableCell className="text-sm">
                  {b.document_date ? new Date(b.document_date).toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" }) : "-"}
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{b.document_no || b.reference_no || "-"}</TableCell>
                <TableCell className="text-sm">{b.document_type || "-"}</TableCell>
                <TableCell className="text-sm">
                  {b.gl_code ? `${b.gl_code} - ${types.find(t => t.code === b.gl_code)?.name_th || "ไม่ระบุ"}` : "-"}
                </TableCell>
                <TableCell className="text-sm">{b.budget_code || "-"}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatTHB(b.amount)}</TableCell>
                <TableCell className="text-center">
                  {b.status === "APPROVED" ? (
                    <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> อนุมัติแล้ว
                    </span>
                  ) : b.status === "REJECTED" ? (
                    <span className="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                      <FileText className="w-3 h-3 mr-1" /> ไม่อนุมัติ
                    </span>
                  ) : b.status === "RETURNED" ? (
                    <span className="inline-flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                      <FileText className="w-3 h-3 mr-1" /> ส่งกลับแก้ไข
                    </span>
                  ) : b.status === "SUBMITTED" ? (
                    <span className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                      <FileText className="w-3 h-3 mr-1" /> รอตรวจสอบ
                    </span>
                  ) : b.status === "PENDING" ? (
                    <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                      <FileText className="w-3 h-3 mr-1" /> รอดำเนินการ
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border">
                      {b.status}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50" asChild>
                    <Link href={`/status/${b.id}`} target="_blank" rel="noopener noreferrer">
                      ตรวจข้อมูล
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
