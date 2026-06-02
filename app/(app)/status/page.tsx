import { redirect } from "next/navigation"
import { ClipboardCheck } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getMonthlyReportStatuses, getAvailableYears } from "@/lib/queries"
import { StatusTable } from "@/components/status/status-table"
import { YearFilter } from "@/components/status/year-filter"
import { MonthFilter } from "@/components/status/month-filter"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StatusPageProps {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function StatusPage({ searchParams }: StatusPageProps) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/dashboard")

  const params = await searchParams
  const years = await getAvailableYears()
  const selectedYear = params.year ? Number(params.year) : years[0] || new Date().getFullYear()
  const selectedMonth = params.month ? Number(params.month) : (new Date().getMonth() + 1)
  
  const allStatuses = await getMonthlyReportStatuses(selectedYear)
  const statuses = allStatuses.filter(s => s.billing_month === selectedMonth)

  // Calculate summary stats
  const totalSlots = statuses.length
  const submittedCount = statuses.filter((s) => s.bill_id).length
  const approvedCount = statuses.filter((s) => s.status === "APPROVED").length
  const pendingCount = submittedCount - approvedCount

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ตรวจสอบสถานะรายงานประจำเดือน</h1>
          <p className="text-muted-foreground">
            ดูความคืบหน้าและยืนยันรายงานค่าสาธารณูปโภคของแต่ละเดือน
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <MonthFilter selectedMonth={selectedMonth} />
          <YearFilter years={years} selectedYear={selectedYear} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>รายการทั้งหมด</CardDescription>
            <CardTitle className="text-3xl font-bold">{totalSlots}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalSlots} ประเภทค่าใช้จ่าย
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>รายงานแล้ว</CardDescription>
            <CardTitle className="text-3xl font-bold text-sky-600">{submittedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {Math.round((submittedCount / totalSlots) * 100)}% ของทั้งหมด
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>รอตรวจสอบ</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-600">{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              รอ Admin ยืนยัน
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ยืนยันแล้ว</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">{approvedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {submittedCount > 0 ? Math.round((approvedCount / submittedCount) * 100) : 0}% ของที่รายงาน
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Table */}
      {statuses.length > 0 ? (
        <StatusTable data={statuses} year={selectedYear} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">ไม่พบข้อมูลรายงานในปีที่เลือก</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
