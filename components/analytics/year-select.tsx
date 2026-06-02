"use client"

import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toBuddhistYear } from "@/lib/format"

export function YearSelect({ years, current }: { years: number[]; current: number }) {
  const router = useRouter()
  return (
    <Select value={String(current)} onValueChange={(v) => router.push(`/analytics?year=${v}`)}>
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {years.map((y) => (
          <SelectItem key={y} value={String(y)}>
            ปี {toBuddhistYear(y)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
