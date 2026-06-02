import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatTHB, THAI_MONTHS_SHORT, toBuddhistYear, getCalendarYearFromFiscal } from "@/lib/format"
import type { UtilityBill } from "@/lib/db"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Inbox } from "lucide-react"

export function RecentBills({ bills }: { bills: UtilityBill[] }) {
  return (
    <Card className="shadow-sm border-muted-foreground/10 overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-muted-foreground/5 pb-4">
        <CardTitle className="text-lg">รายการบันทึกล่าสุด</CardTitle>
        <CardDescription>5 รายการล่าสุดที่ถูกบันทึกเข้าสู่ระบบ</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {bills.length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <Inbox className="w-10 h-10 text-muted-foreground/50 mb-2" aria-hidden />
              <EmptyTitle>ยังไม่มีข้อมูล</EmptyTitle>
              <EmptyDescription>เริ่มต้นโดยการเพิ่มรายการค่าสาธารณูปโภครายการแรก</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px] font-medium text-foreground/70">งวด</TableHead>
                  <TableHead className="font-medium text-foreground/70">ประเภท</TableHead>
                  <TableHead className="font-medium text-foreground/70">เลขที่อ้างอิง</TableHead>
                  <TableHead className="font-medium text-foreground/70">ผู้บันทึก</TableHead>
                  <TableHead className="text-right font-medium text-foreground/70">จำนวนเงิน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((b) => (
                  <TableRow key={b.id} className="group hover:bg-muted/30 transition-colors duration-200">
                    <TableCell className="whitespace-nowrap font-medium text-sm">
                      {THAI_MONTHS_SHORT[b.billing_month - 1]} {toBuddhistYear(getCalendarYearFromFiscal(b.billing_year, b.billing_month))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                        {b.utility_name_th}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground/80">
                      {b.reference_no || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.creator_name || "-"}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-foreground/90">
                      {formatTHB(b.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
