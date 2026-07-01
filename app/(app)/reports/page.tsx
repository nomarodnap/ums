import { AppHeader } from "@/components/app-header"
import { ReportsFilters } from "@/components/reports/reports-filters"
import { BillsTable } from "@/components/reports/bills-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getAvailableYears, getBills, getUtilityTypes } from "@/lib/queries"
import { requireUser } from "@/lib/auth"
import Link from "next/link"
import { Plus } from "lucide-react"
import { formatTHB } from "@/lib/format"

export const metadata = { title: "รายงานค่าสาธารณูปโภค" }

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; type?: string; search?: string; page?: string }>
}) {
  const sp = await searchParams
  const user = await requireUser()
  const year = sp.year ? Number.parseInt(sp.year) : undefined
  const month = sp.month ? Number.parseInt(sp.month) : undefined
  const typeCode = sp.type === "all" ? undefined : sp.type
  const search = sp.search
  const status = sp.status === "all" ? undefined : sp.status
  const page = sp.page ? Math.max(1, Number.parseInt(sp.page)) : 1
  const limit = 50
  const offset = (page - 1) * limit

  const [types, years, { bills, total }] = await Promise.all([
    getUtilityTypes(),
    getAvailableYears(),
    getBills({ year, month, typeCode, search, limit, offset, status, costCenter: user.cost_center }),
  ])

  const totalAmount = bills.reduce((acc, b) => acc + Number.parseFloat(b.amount), 0)
  const canCreate = user.role === "ADMIN" || user.role === "STAFF"

  return (
    <>
      <AppHeader
        crumbs={[{ label: "ระบบรายงานค่าสาธารณูปโภค", href: "/dashboard" }, { label: "รายงานค่าสาธารณูปโภค" }]}
      />
      <div className="flex flex-col gap-5 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">รายงานค่าสาธารณูปโภค</h1>
          <p className="text-sm text-muted-foreground mt-1">
            รายการบันทึกค่าใช้จ่ายด้านสาธารณูปโภคทั้งหมดของหน่วยงาน
          </p>
        </div>

        <ReportsFilters years={years} types={types} />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">รายการที่ค้นพบ</p>
              <p className="text-xl font-semibold mt-1">{total.toLocaleString("th-TH")} รายการ</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">ยอดรวมในหน้านี้</p>
              <p className="text-xl font-semibold mt-1 tabular-nums">{formatTHB(totalAmount)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">หน้าที่แสดง</p>
              <p className="text-xl font-semibold mt-1">
                {page} / {Math.max(1, Math.ceil(total / limit))}
              </p>
            </CardContent>
          </Card>
        </div>

        <BillsTable bills={bills} role={user.role} types={types} />

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
    return `/reports?${params.toString()}`
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
