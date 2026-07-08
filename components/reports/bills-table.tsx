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
import { BillFormDialog } from "./bill-form-dialog"

export function BillsTable({ bills, role, types, agencyUsers, userFullName }: { bills: UtilityBill[]; role: UserRole; types: UtilityType[]; agencyUsers: any[]; userFullName: string }) {
  const canDelete = role === "ADMIN" || role === "STAFF"

  if (bills.length === 0) {
    return (
      <Empty className="py-16 rounded-lg border border-border bg-card">
        <EmptyHeader>
          <Inbox className="w-8 h-8 text-muted-foreground" aria-hidden />
          <EmptyTitle>ไม่พบรายการ</EmptyTitle>
          <EmptyDescription>ลองปรับเปลี่ยนตัวกรองเพื่อค้นหา</EmptyDescription>
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
                    <BillFormDialog 
                      initialData={b} 
                      userFullName={userFullName} 
                      userRole={role} 
                      agencyUsers={agencyUsers}
                    >
                      {b.status === "APPROVED" ? (
                        <Button variant="outline" size="sm" className="text-emerald-600 dark:text-emerald-500">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          อนุมัติแล้ว
                        </Button>
                      ) : b.status === "REJECTED" ? (
                        <Button variant="outline" size="sm" className="text-red-600 dark:text-red-500">
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          ไม่อนุมัติ
                        </Button>
                      ) : b.status === "RETURNED" ? (
                        <Button variant="outline" size="sm" className="text-amber-600 dark:text-amber-500">
                          <FileEdit className="w-3.5 h-3.5 mr-1.5" />
                          แก้ไขข้อมูล
                        </Button>
                      ) : b.status === "SUBMITTED" ? (
                        <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-500">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          รอตรวจสอบ
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          ส่งข้อมูล
                        </Button>
                      )}
                    </BillFormDialog>
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
