import { AdminStatusFilters } from "@/components/status/admin-status-filters"
import { AdminStatusTable } from "@/components/status/admin-status-table"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { getAvailableYears, getBills, getUtilityTypes } from "@/lib/queries"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatTHB } from "@/lib/format"
import { FileText, CheckCircle2, TrendingUp } from "lucide-react"

export const metadata = { title: "ตรวจสอบสถานะรายงาน" }

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; type?: string; search?: string; page?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/dashboard")

  const sp = await searchParams
  const year = sp.year ? (sp.year === "all" ? undefined : Number.parseInt(sp.year)) : undefined
  const month = sp.month ? (sp.month === "all" ? undefined : Number.parseInt(sp.month)) : undefined
  const typeCode = sp.type === "all" ? undefined : sp.type
  const search = sp.search
  const status = sp.status === "all" ? undefined : sp.status
  const page = sp.page ? Math.max(1, Number.parseInt(sp.page)) : 1
  const limit = 50
  const offset = (page - 1) * limit

  const [types, years, { bills, total }, { total: totalSubmitted }, { total: totalApproved }] = await Promise.all([
    getUtilityTypes(),
    getAvailableYears(),
    getBills({ year, month, typeCode, search, limit, offset, status }),
    getBills({ year, month, typeCode, search, status: "SUBMITTED" }),
    getBills({ year, month, typeCode, search, status: "APPROVED" }),
  ])

  // Ensure current and previous years are available
  const currentYear = new Date().getFullYear()
  const defaultYears = [currentYear, currentYear - 1, 2025]
  defaultYears.forEach(y => {
    if (!years.includes(y)) years.push(y)
  })
  const sortedYears = Array.from(new Set(years)).sort((a, b) => b - a)

  const totalAmount = bills.reduce((acc, b) => acc + (b.amount ? Number.parseFloat(b.amount) : 0), 0)

  return (
    <>
      <AppHeader
        crumbs={[
          { label: "ระบบรายงานค่าสาธารณูปโภค", href: "/dashboard" },
          { label: "ตรวจสอบรายงาน" },
        ]}
      />
      <div className="flex flex-col gap-5 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ตรวจสอบรายงานที่ส่งเข้ามา</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ระบบตรวจสอบและอนุมัติรายงานค่าสาธารณูปโภคที่หน่วยงานส่งเข้ามา
          </p>
        </div>

      <AdminStatusFilters years={sortedYears} types={types} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-full">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">รอตรวจสอบ</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">{totalSubmitted.toLocaleString("th-TH")}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">อนุมัติแล้ว</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600">{totalApproved.toLocaleString("th-TH")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ยอดรวมหน้านี้</p>
              <p className="text-xl font-bold mt-1 text-blue-600 tabular-nums">{formatTHB(totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">รายการเอกสาร ({total.toLocaleString("th-TH")})</h2>
        {total > limit && (
          <p className="text-sm text-muted-foreground">
            หน้า {page} / {Math.max(1, Math.ceil(total / limit))}
          </p>
        )}
      </div>

      <AdminStatusTable bills={bills} types={types} />

      {total > limit && <Pagination page={page} total={total} limit={limit} sp={sp} />}
    </div>
    </>
  )
}

function Pagination({
  page,
  total,
  limit,
  sp,
}: {
  page: number
  total: number
  limit: number
  sp: Record<string, string | undefined>
}) {
  const maxPage = Math.ceil(total / limit)
  const makeHref = (p: number) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") params.set(k, v)
    params.set("page", String(p))
    return `/status?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        แสดง {(page - 1) * limit + 1}–{Math.min(page * limit, total)} จาก {total.toLocaleString("th-TH")} รายการ
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild disabled={page <= 1}>
          <Link href={makeHref(Math.max(1, page - 1))} aria-disabled={page <= 1}>
            ก่อนหน้า
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild disabled={page >= maxPage}>
          <Link href={makeHref(Math.min(maxPage, page + 1))} aria-disabled={page >= maxPage}>
            ถัดไป
          </Link>
        </Button>
      </div>
    </div>
  )
}
