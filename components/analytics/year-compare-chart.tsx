"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { THAI_MONTHS_SHORT, formatNumber, toBuddhistYear } from "@/lib/format"
import type { MonthlySeries } from "@/lib/queries"

function sumMonth(series: MonthlySeries): number {
  let s = 0
  for (const [k, v] of Object.entries(series)) {
    if (k !== "month" && typeof v === "number") s += v
  }
  return s
}

export function YearCompareChart({
  currentData,
  prevData,
  year,
  prevYear,
}: {
  currentData: MonthlySeries[]
  prevData: MonthlySeries[]
  year: number
  prevYear: number
}) {
  const data = currentData.map((d, i) => {
    return {
      month: THAI_MONTHS_SHORT[d.month - 1],
      current: sumMonth(d),
      previous: sumMonth(prevData[i] || { month: d.month }),
    }
  })


  const config: ChartConfig = {
    current: { label: `ปี ${toBuddhistYear(year)}`, color: "var(--chart-1)" },
    previous: { label: `ปี ${toBuddhistYear(prevYear)}`, color: "var(--chart-3)" },
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>เปรียบเทียบปีต่อปี</CardTitle>
        <CardDescription>
          ยอดรวมรายเดือน ปี {toBuddhistYear(year)} เทียบปี {toBuddhistYear(prevYear)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[320px] w-full">
          <BarChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${formatNumber((v as number) / 1000, 0)}k`}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatNumber(value as number, 0) + " บาท"}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="previous" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="current" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
