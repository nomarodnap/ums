import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { requireUser } from "@/lib/auth"
import { getBillById, getAgencyUsers } from "@/lib/queries"
import { BillForm } from "./bill-form"

// metadata can't be dynamic based on searchParams in the simple way here if we don't export generateMetadata, so we'll just use a generic title or generateMetadata
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sp = await searchParams
  return {
    title: sp.id ? "แก้ไขรายการ | รายงานค่าสาธารณูปโภค" : "บันทึกรายการใหม่ | รายงานค่าสาธารณูปโภค"
  }
}

export default async function NewBillPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const sp = await searchParams
  const user = await requireUser()
  if (user.role === "USER") redirect("/reports")

  let initialData = undefined
  if (sp.id) {
    const billId = parseInt(sp.id)
    if (!isNaN(billId)) {
      const bill = await getBillById(billId)
      if (bill) initialData = bill
    }
  }

  const users = await getAgencyUsers()

  return (
    <>
      <AppHeader
        crumbs={[
          { label: "ระบบรายงานค่าสาธารณูปโภค", href: "/dashboard" },
          { label: "รายงานค่าสาธารณูปโภค", href: "/reports" },
          { label: initialData ? "ส่งรายงาน" : "บันทึกรายการใหม่" },
        ]}
      />
      <div className="flex flex-col gap-5 p-4 md:p-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {initialData ? "ส่งรายงานค่าสาธารณูปโภค" : "บันทึกรายการค่าสาธารณูปโภคใหม่"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {initialData 
              ? "ส่งข้อมูลรายงานใบแจ้งหนี้ค่าสาธารณูปโภค ระบบจะอัปเดตสถานะและผู้ทำรายการโดยอัตโนมัติ"
              : "กรอกข้อมูลใบแจ้งหนี้ค่าสาธารณูปโภค ระบบจะบันทึกผู้ทำรายการและเวลาไว้โดยอัตโนมัติ"}
          </p>
        </div>

        <BillForm initialData={initialData} userFullName={user.full_name} userRole={user.role} agencyUsers={users} />
      </div>
    </>
  )
}
