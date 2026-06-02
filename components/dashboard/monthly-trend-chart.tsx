"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { THAI_MONTHS_SHORT, formatNumber, toBuddhistYear, getCalendarYearFromFiscal } from "@/lib/format"
import type { MonthlyRollingSeries, MonthlySeries } from "@/lib/queries"
import type { UtilityType } from "@/lib/db"

export function MonthlyTrendChart({
  data,
  types,
  year,
}: {
  data: (MonthlyRollingSeries | MonthlySeries)[]
  types: UtilityType[]
  year?: number
}) {
  const chartData = data.map((d) => {
    let monthLabel = THAI_MONTHS_SHORT[d.month - 1]
    
    const y = 'year' in d ? (d as MonthlyRollingSeries).year : year
    if (y) {
      const calYear = getCalendarYearFromFiscal(y, d.month)
      const shortYear = toBuddhistYear(calYear).toString().slice(-2)
      monthLabel = `${monthLabel} ${shortYear}`
    }

    return {
      ...d,
      monthLabel,
    }
  })

  const config: ChartConfig = {}
  types.forEach((t, i) => {
    config[t.code] = {
      label: t.name_th,
      color: `var(--chart-${(i % 5) + 1})`,
    }
  })

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>แนวโน้มค่าใช้จ่ายรายเดือน</CardTitle>
            <CardDescription>
              {year ? `ปีงบประมาณ ${toBuddhistYear(year)} แยกตามประเภทสาธารณูปโภค` : 'ข้อมูลวิเคราะห์ 12 เดือนย้อนหลัง แยกตามประเภทสาธารณูปโภค'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[320px] w-full">
          <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
            <defs>
              {types.map((t, i) => (
                <linearGradient key={t.code} id={`grad-${t.code}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--chart-${(i % 5) + 1})`} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={`var(--chart-${(i % 5) + 1})`} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => `${formatNumber((v as number) / 1000, 0)}k`}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatNumber(value as number, 0) + " บาท"}
                  labelFormatter={(label) => `เดือน${label}`}
                />
              }
            />
            {types.map((t, i) => (
              <Area
                key={t.code}
                type="monotone"
                dataKey={t.code}
                stackId="1"
                stroke={`var(--chart-${(i % 5) + 1})`}
                fill={`url(#grad-${t.code})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
