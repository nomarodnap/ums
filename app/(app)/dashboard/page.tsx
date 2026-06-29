import { AppHeader } from "@/components/app-header"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart"
import { TypeBreakdownChart } from "@/components/dashboard/type-breakdown-chart"
import { RecentBills } from "@/components/dashboard/recent-bills"
import {
  getDashboardSummary,
  getRolling12MonthsByType,
  getRolling12MonthsBreakdown,
  getRecentBills,
  getUtilityTypes,
} from "@/lib/queries"
import { requireUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata = { title: "หน้าหลัก | ระบบรายงานค่าสาธารณูปโภค" }

export default async function DashboardPage() {
  const user = await requireUser()
  const summary = await getDashboardSummary()
  const [types, monthly, breakdown, recent] = await Promise.all([
    getUtilityTypes(),
    getRolling12MonthsByType(),
    getRolling12MonthsBreakdown(),
    getRecentBills(5),
  ])

  const canCreate = user.role === "ADMIN" || user.role === "STAFF"

  return (
    <>
      <AppHeader
        crumbs={[{ label: "ระบบรายงานค่าสาธารณูปโภค", href: "/dashboard" }, { label: "หน้าหลัก" }]}
      />
      <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">สวัสดี, {user.full_name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            ภาพรวมค่าสาธารณูปโภคของกรมประมง ข้อมูลวิเคราะห์ 12 เดือนย้อนหลัง
          </p>
        </div>

        <KpiCards summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MonthlyTrendChart data={monthly} types={types} />
          </div>
          <div>
            <TypeBreakdownChart data={breakdown} />
          </div>
        </div>

        <div className="mt-2">
          <RecentBills bills={recent} />
        </div>
      </div>
    </>
  )
}
