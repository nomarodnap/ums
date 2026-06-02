"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Clock, FileQuestion, Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCurrency, monthName, FISCAL_MONTHS, getCalendarYearFromFiscal, toBuddhistYear } from "@/lib/format"
import type { MonthlyReportStatus } from "@/lib/queries"
import { approveBillAction, revertBillAction } from "@/app/(app)/status/actions"

interface StatusTableProps {
  data: MonthlyReportStatus[]
  year: number
}

export function StatusTable({ data, year }: StatusTableProps) {
  const [pending, startTransition] = useTransition()
  const [processingId, setProcessingId] = useState<number | null>(null)

  // Group by month
  const groupedByMonth = data.reduce((acc, item) => {
    if (!acc[item.billing_month]) {
      acc[item.billing_month] = []
    }
    acc[item.billing_month].push(item)
    return acc
  }, {} as Record<number, MonthlyReportStatus[]>)

  const handleApprove = (billId: number) => {
    setProcessingId(billId)
    startTransition(async () => {
      await approveBillAction(billId)
      setProcessingId(null)
    })
  }

  const handleRevert = (billId: number) => {
    setProcessingId(billId)
    startTransition(async () => {
      await revertBillAction(billId)
      setProcessingId(null)
    })
  }

  const getStatusBadge = (item: MonthlyReportStatus) => {
    if (!item.bill_id) {
      return (
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <FileQuestion className="h-3 w-3" />
          ยังไม่รายงาน
        </Badge>
      )
    }
    if (item.status === "APPROVED") {
      return (
        <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          ยืนยันแล้ว
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200">
        <Clock className="h-3 w-3" />
        รอตรวจสอบ
      </Badge>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {Object.entries(groupedByMonth)
          .sort(([a], [b]) => {
            const indexA = FISCAL_MONTHS.indexOf(Number(a))
            const indexB = FISCAL_MONTHS.indexOf(Number(b))
            return indexA - indexB
          })
          .map(([month, items]) => {
            const monthNum = Number(month)
            const submittedCount = items.filter((i) => i.bill_id).length
            const approvedCount = items.filter((i) => i.status === "APPROVED").length
            const totalCount = items.length

            return (
              <div key={month} className="rounded-lg border bg-card">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {monthName(monthNum)} {toBuddhistYear(getCalendarYearFromFiscal(year, monthNum))}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      รายงานแล้ว {submittedCount}/{totalCount} รายการ | 
                      ยืนยันแล้ว {approvedCount}/{submittedCount} รายการ
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round((approvedCount / totalCount) * 100)}% สำเร็จ
                    </Badge>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">ประเภทค่าใช้จ่าย</TableHead>
                      <TableHead>สถานะการรายงาน</TableHead>
                      <TableHead>สถานะการยืนยัน</TableHead>
                      <TableHead className="text-right">จำนวนเงิน</TableHead>
                      <TableHead>ผู้รายงาน</TableHead>
                      <TableHead>ผู้ยืนยัน</TableHead>
                      <TableHead className="w-[100px] text-center">การกระทำ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={`${item.billing_month}-${item.utility_type_id}-${item.bill_id || index}`}>
                        <TableCell className="font-medium">{item.utility_name_th}</TableCell>
                        <TableCell>
                          {item.bill_id ? (
                            <Badge className="bg-sky-600 hover:bg-sky-700">รายงานแล้ว</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              ยังไม่รายงาน
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(item)}</TableCell>
                        <TableCell className="text-right font-mono">
                          {item.amount ? formatCurrency(Number(item.amount)) : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.creator_name || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.approver_name || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.bill_id && item.status === "SUBMITTED" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(item.bill_id!)}
                                  disabled={pending && processingId === item.bill_id}
                                  className="h-8 px-3"
                                >
                                  {pending && processingId === item.bill_id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                  <span className="ml-1">ยืนยัน</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>ยืนยันรายงานนี้</TooltipContent>
                            </Tooltip>
                          )}
                          {item.bill_id && item.status === "APPROVED" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRevert(item.bill_id!)}
                                  disabled={pending && processingId === item.bill_id}
                                  className="h-8 px-3"
                                >
                                  {pending && processingId === item.bill_id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-4 w-4" />
                                  )}
                                  <span className="ml-1">ยกเลิก</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>ยกเลิกการยืนยัน</TooltipContent>
                            </Tooltip>
                          )}
                          {!item.bill_id && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          })}
      </div>
    </TooltipProvider>
  )
}
