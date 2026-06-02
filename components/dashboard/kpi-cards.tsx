import { Card, CardContent } from "@/components/ui/card"
import { formatTHB } from "@/lib/format"
import { ArrowDownRight, ArrowUpRight, Calendar, FileText, TrendingUp, Wallet } from "lucide-react"
import type { DashboardSummary } from "@/lib/queries"
import { toBuddhistYear, THAI_MONTHS } from "@/lib/format"

function changePercent(current: number, prev: number) {
  if (!prev) return null
  return ((current - prev) / prev) * 100
}

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) return null
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-1.5 py-0.5 ${
        up ? "bg-destructive/10 text-destructive" : "bg-chart-2/20 text-chart-2"
      }`}
    >
      <Icon className="w-3 h-3" aria-hidden />
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

export function KpiCards({ summary }: { summary: DashboardSummary }) {
  const monthChange = changePercent(summary.currentMonthTotal, summary.previousMonthTotal)
  const yearChange = changePercent(summary.yearTotal, summary.lastYearTotal)

  const items = [
    {
      label: "ค่าใช้จ่ายเดือนล่าสุด",
      sub: `${THAI_MONTHS[summary.currentMonth - 1]} ${toBuddhistYear(summary.currentYear)}`,
      value: formatTHB(summary.currentMonthTotal),
      change: monthChange,
      icon: Wallet,
    },
    {
      label: `ยอดรวมปี ${toBuddhistYear(summary.currentYear)}`,
      sub: `เทียบกับปี ${toBuddhistYear(summary.currentYear - 1)}`,
      value: formatTHB(summary.yearTotal),
      change: yearChange,
      icon: TrendingUp,
    },
    {
      label: "ยอดปีก่อนหน้า",
      sub: `ปี ${toBuddhistYear(summary.currentYear - 1)}`,
      value: formatTHB(summary.lastYearTotal),
      change: null,
      icon: Calendar,
    },
    {
      label: "จำนวนรายการบันทึก",
      sub: "รายการทั้งหมดในระบบ",
      value: summary.billCount.toLocaleString("th-TH"),
      change: null,
      icon: FileText,
    },
  ] as const

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-muted-foreground/10 group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{item.sub}</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-110 group-hover:bg-primary/15 transition-transform duration-300">
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight text-foreground/90">{item.value}</p>
                <ChangeBadge value={item.change} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
