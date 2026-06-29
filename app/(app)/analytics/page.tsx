import { AppHeader } from "@/components/app-header"
import { requireUser } from "@/lib/auth"
import { getAvailableYears, getMonthlyByType, getTypeBreakdown, getUtilityTypes, getRolling12MonthsByType } from "@/lib/queries"
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart"
import { TypeBreakdownChart } from "@/components/dashboard/type-breakdown-chart"
import { YearCompareChart } from "@/components/analytics/year-compare-chart"
import { YearSelect } from "@/components/analytics/year-select"
import { toBuddhistYear, formatTHB } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = { title: "วิเคราะห์ข้อมูล | ระบบรายงานค่าสาธารณูปโภค" }

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  await requireUser()
  const sp = await searchParams
  const years = await getAvailableYears()
  const defaultYear = years[0] || new Date().getFullYear()
  const year = sp.year ? Number.parseInt(sp.year) : defaultYear
  const prevYear = year - 1

  const [types, currentMonthly, prevMonthly, breakdown, rolling12Months] = await Promise.all([
    getUtilityTypes(),
    getMonthlyByType(year),
    getMonthlyByType(prevYear),
    getTypeBreakdown(year),
    getRolling12MonthsByType(),
  ])

  const total = breakdown.reduce((a, b) => a + b.total, 0)
  const avgMonthly = total / 12

  return (
    <>
      <AppHeader
        crumbs={[{ label: "ระบบรายงานค่าสาธารณูปโภค", href: "/dashboard" }, { label: "วิเคราะห์ข้อมูล" }]}
        action={<YearSelect years={years} current={year} />}
      />
      <div className="flex flex-col gap-5 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">วิเคราะห์ข้อมูล</h1>
          <p className="text-sm text-muted-foreground mt-1">
            เปรียบเทียบและวิเคราะห์ค่าใช้จ่ายเชิงลึก ประจำปีงบประมาณ {toBuddhistYear(year)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">ยอดรวมทั้งปี {toBuddhistYear(year)}</p>
              <p className="text-xl font-semibold mt-1 tabular-nums">{formatTHB(total)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">เฉลี่ยต่อเดือน</p>
              <p className="text-xl font-semibold mt-1 tabular-nums">{formatTHB(avgMonthly)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">ประเภทสูงสุด</p>
              <p className="text-xl font-semibold mt-1">{breakdown[0]?.name_th || "-"}</p>
              <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                {breakdown[0] ? formatTHB(breakdown[0].total) : "-"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MonthlyTrendChart data={rolling12Months} types={types} />
          </div>
          <div>
            <TypeBreakdownChart data={breakdown} year={year} />
          </div>
        </div>

        <YearCompareChart currentData={currentMonthly} prevData={prevMonthly} year={year} prevYear={prevYear} />
      </div>
    </>
  )
}
