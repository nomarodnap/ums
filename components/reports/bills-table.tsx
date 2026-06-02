"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { formatNumber, formatTHB, THAI_MONTHS, toBuddhistYear, getCalendarYearFromFiscal } from "@/lib/format"
import type { UtilityBill } from "@/lib/db"
import type { UserRole } from "@/lib/db"
import { Inbox, Loader2, Trash2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"
import { deleteBillAction } from "@/app/(app)/reports/actions"

export function BillsTable({ bills, role }: { bills: UtilityBill[]; role: UserRole }) {
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
              <TableHead>งวด</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>เลขที่อ้างอิง</TableHead>
              <TableHead>สถานที่</TableHead>
              <TableHead className="text-right">การใช้งาน</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead>ผู้บันทึก</TableHead>
              {canDelete && <TableHead className="w-[60px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {THAI_MONTHS[b.billing_month - 1]} {toBuddhistYear(getCalendarYearFromFiscal(b.billing_year, b.billing_month))}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {b.utility_name_th}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{b.reference_no || "-"}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {b.location || "-"}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {b.usage ? `${formatNumber(b.usage, 2)} ${b.utility_unit}` : "-"}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatTHB(b.amount)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{b.creator_name || "-"}</TableCell>
                {canDelete && (
                  <TableCell>
                    <DeleteBillButton id={b.id} />
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

function DeleteBillButton({ id }: { id: number }) {
  const [pending, start] = useTransition()

  function handleDelete() {
    start(async () => {
      const res = await deleteBillAction(id)
      if (res.error) toast.error(res.error)
      else toast.success("ลบรายการเรียบร้อย")
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
          {pending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Trash2 className="w-4 h-4" aria-hidden />}
          <span className="sr-only">ลบ</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบรายการ</AlertDialogTitle>
          <AlertDialogDescription>
            รายการที่ถูกลบจะไม่สามารถกู้คืนได้ ต้องการดำเนินการต่อหรือไม่?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            ลบรายการ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
