"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface StatusPieChartProps {
  pending: number
  submitted: number
  approved: number
  returned: number
  rejected: number
}

export function StatusPieChart({ pending, submitted, approved, returned, rejected }: StatusPieChartProps) {
  const data = [
    { name: "รอดำเนินการ", value: pending, color: "#94a3b8" },
    { name: "รอตรวจสอบ", value: submitted, color: "#3b82f6" },
    { name: "อนุมัติแล้ว", value: approved, color: "#10b981" },
    { name: "ส่งกลับแก้ไข", value: returned, color: "#f59e0b" },
    { name: "ไม่อนุมัติ", value: rejected, color: "#ef4444" },
  ].filter(d => d.value > 0)

  const total = pending + submitted + approved + returned + rejected

  return (
    <Card className="shadow-sm w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">
          สัดส่วนสถานะ
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
        {total === 0 ? (
          <div className="text-muted-foreground text-sm flex items-center justify-center h-full">ไม่มีข้อมูล</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    const percent = ((data.value / total) * 100).toFixed(1)
                    return (
                      <div className="bg-white border border-border p-2 shadow-sm rounded-md text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                          <span className="font-medium text-slate-700">{data.name}</span>
                        </div>
                        <p className="text-slate-600 pl-5">
                          {data.value.toLocaleString("th-TH")} รายการ <span className="text-muted-foreground">({percent}%)</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
