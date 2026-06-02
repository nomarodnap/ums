"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface YearFilterProps {
  years: number[]
  selectedYear: number
}

export function YearFilter({ years, selectedYear }: YearFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleYearChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("year", value)
    router.push(`/status?${params.toString()}`)
  }

  return (
    <Select value={String(selectedYear)} onValueChange={handleYearChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="เลือกปี" />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={String(year)}>
            ปี พ.ศ. {year + 543}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
