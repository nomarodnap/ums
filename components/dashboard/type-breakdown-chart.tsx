"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { formatNumber, toBuddhistYear } from "@/lib/format"
import type { TypeBreakdown } from "@/lib/queries"

export function TypeBreakdownChart({ data, year }: { data: TypeBreakdown[]; year?: number }) {
  const config: ChartConfig = {
    total: { label: "ยอดรวม", color: "var(--chart-1)" },
  }
  data.forEach((d, i) => {
    config[d.code] = { label: d.name_th, color: `var(--chart-${(i % 5) + 1})` }
  })

  const chartData = data.map((d, i) => ({
    name: d.name_th,
    total: d.total,
    fill: `var(--chart-${(i % 5) + 1})`,
  }))

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>สัดส่วนค่าใช้จ่ายตามประเภท</CardTitle>
        <CardDescription>
          {year ? `ยอดรวมปีงบประมาณ ${toBuddhistYear(year)}` : 'ข้อมูลวิเคราะห์ 12 เดือนย้อนหลัง'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[320px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${formatNumber((v as number) / 1000, 0)}k`}
              className="text-xs"
            />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120} className="text-xs" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatNumber(value as number, 0) + " บาท"}
                  hideLabel
                />
              }
            />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
