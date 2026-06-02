"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { monthName, FISCAL_MONTHS } from "@/lib/format"

interface MonthFilterProps {
  selectedMonth: number
}

export function MonthFilter({ selectedMonth }: MonthFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("month", value)
    router.push(`/status?${params.toString()}`)
  }

  return (
    <Select value={String(selectedMonth)} onValueChange={handleMonthChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="เลือกเดือน" />
      </SelectTrigger>
      <SelectContent>
        {FISCAL_MONTHS.map((month) => (
          <SelectItem key={month} value={String(month)}>
            {monthName(month)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
