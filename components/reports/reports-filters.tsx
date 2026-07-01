"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { THAI_MONTHS, toBuddhistYear } from "@/lib/format"
import type { UtilityType } from "@/lib/db"
import { Search, X } from "lucide-react"

export function ReportsFilters({
  years,
  types,
}: {
  years: number[]
  types: UtilityType[]
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, start] = useTransition()

  function updateParam(key: string, value: string) {
    const sp = new URLSearchParams(params.toString())
    // For status, we explicitly want to keep 'all' in the URL so the page knows the user selected it
    if (!value || (value === "all" && key !== "status")) sp.delete(key)
    else sp.set(key, value)
    sp.delete("page")
    start(() => router.push(`/reports?${sp.toString()}`))
  }

  function reset() {
    start(() => router.push("/reports"))
  }

  const currentYear = params.get("year") || "all"
  const currentMonth = params.get("month") || "all"
  const currentType = params.get("type") || "all"
  const currentSearch = params.get("search") || ""
  const currentStatus = params.get("status") || "all"
  const hasFilter = Array.from(params.keys()).length > 0

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border border-border bg-card shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        <div className="space-y-1.5">
          <Label className="text-xs">สถานะรายการ</Label>
          <Select value={currentStatus} onValueChange={(v) => updateParam("status", v)} disabled={pending}>
            <SelectTrigger><SelectValue placeholder="เลือกสถานะ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="PENDING">รอดำเนินการ</SelectItem>
              <SelectItem value="SUBMITTED">รอตรวจสอบ</SelectItem>
              <SelectItem value="APPROVED">อนุมัติแล้ว</SelectItem>
              <SelectItem value="RETURNED">ส่งกลับแก้ไข</SelectItem>
              <SelectItem value="REJECTED">ไม่อนุมัติ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">ปี</Label>
          <Select value={currentYear} onValueChange={(v) => updateParam("year", v)} disabled={pending}>
            <SelectTrigger><SelectValue placeholder="ทั้งหมด" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกปี</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>ปี {toBuddhistYear(y)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">เดือน</Label>
          <Select value={currentMonth} onValueChange={(v) => updateParam("month", v)} disabled={pending}>
            <SelectTrigger><SelectValue placeholder="ทั้งหมด" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกเดือน</SelectItem>
              {THAI_MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">ประเภทสาธารณูปโภค</Label>
          <Select value={currentType} onValueChange={(v) => updateParam("type", v)} disabled={pending}>
            <SelectTrigger><SelectValue placeholder="ทั้งหมด" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกประเภท</SelectItem>
              {types.map((t) => (
                <SelectItem key={t.code} value={t.code}>{t.name_th}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">ค้นหา</Label>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              updateParam("search", String(fd.get("search") || ""))
            }}
          >
            <InputGroup>
              <InputGroupAddon><Search className="w-4 h-4" aria-hidden /></InputGroupAddon>
              <InputGroupInput name="search" defaultValue={currentSearch} placeholder="เลขที่อ้างอิง / สถานที่" />
            </InputGroup>
          </form>
        </div>
      </div>

      {hasFilter && (
        <div>
          <Button variant="ghost" size="sm" onClick={reset} disabled={pending}>
            <X className="w-3.5 h-3.5 mr-1" aria-hidden />
            ล้างตัวกรอง
          </Button>
        </div>
      )}
    </div>
  )
}
