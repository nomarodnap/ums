"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { formatTHB } from "@/lib/format"
import type { UtilityBill, UtilityType } from "@/lib/db"
import type { UserRole } from "@/lib/db"
import { Inbox, Send, FileEdit, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"

export function BillsTable({ bills, role, types }: { bills: UtilityBill[]; role: UserRole; types: UtilityType[] }) {
  const canDelete = role === "ADMIN" || role === "STAFF"

  if (bills.length === 0) {
    return (
      <Empty className="py-16 rounded-lg border border-border bg-card">
        <EmptyHeader>
          <Inbox className="w-8 h-8 text-muted-foreground" aria-hidden />
          <EmptyTitle>ไม่พบรายการ</EmptyTitle>
          <EmptyDescription>ลองปรับเปลี่ยนตัวกรอง หรือเพิ่มรายการใหม่</EmptyDescription>
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
              {canDelete && <TableHead className="w-[120px] text-center">จัดการ</TableHead>}
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
                {canDelete && (
                  <TableCell className="text-center">
                    {b.status === "APPROVED" ? (
                      <Button variant="outline" size="sm" className="text-emerald-600 dark:text-emerald-500" asChild>
                        <Link href={`/reports/new?id=${b.id}`}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          อนุมัติแล้ว
                        </Link>
                      </Button>
                    ) : b.status === "REJECTED" ? (
                        <Button variant="outline" size="sm" className="text-red-600 dark:text-red-500" asChild>
                          <Link href={`/reports/new?id=${b.id}`}>
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            ไม่อนุมัติ
                          </Link>
                        </Button>
                      ) : b.status === "RETURNED" ? (
                        <Button variant="outline" size="sm" className="text-amber-600 dark:text-amber-500" asChild>
                          <Link href={`/reports/new?id=${b.id}`}>
                            <FileEdit className="w-3.5 h-3.5 mr-1.5" />
                            แก้ไขข้อมูล
                          </Link>
                        </Button>
                      ) : b.status === "SUBMITTED" ? (
                        <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-500" asChild>
                          <Link href={`/reports/new?id=${b.id}`}>
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            รอตรวจสอบ
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/reports/new?id=${b.id}`}>
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            ส่งข้อมูล
                          </Link>
                        </Button>
                      )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
