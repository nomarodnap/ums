import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { requireUser } from "@/lib/auth"
import { getUtilityTypes } from "@/lib/queries"
import { BillForm } from "./bill-form"

export const metadata = { title: "บันทึกรายการใหม่ | รายงานค่าสาธารณูปโภค" }

export default async function NewBillPage() {
  const user = await requireUser()
  if (user.role === "USER") redirect("/reports")

  const types = await getUtilityTypes()

  return (
    <>
      <AppHeader
        crumbs={[
          { label: "ระบบรายงานค่าสาธารณูปโภค", href: "/dashboard" },
          { label: "รายงานค่าสาธารณูปโภค", href: "/reports" },
          { label: "บันทึกรายการใหม่" },
        ]}
      />
      <div className="flex flex-col gap-5 p-4 md:p-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">บันทึกรายการค่าสาธารณูปโภคใหม่</h1>
          <p className="text-sm text-muted-foreground mt-1">
            กรอกข้อมูลใบแจ้งหนี้ค่าสาธารณูปโภค ระบบจะบันทึกผู้ทำรายการและเวลาไว้โดยอัตโนมัติ
          </p>
        </div>

        <BillForm types={types} />
      </div>
    </>
  )
}
