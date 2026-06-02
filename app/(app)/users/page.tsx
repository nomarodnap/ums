import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { requireUser } from "@/lib/auth"
import { getAllUsers } from "@/lib/queries"
import { UsersTable } from "@/components/users/users-table"
import { CreateUserDialog } from "@/components/users/create-user-dialog"

export const metadata = { title: "จัดการผู้ใช้งาน" }

export default async function UsersPage() {
  const me = await requireUser()
  if (me.role !== "ADMIN") redirect("/dashboard")

  const users = await getAllUsers()

  return (
    <>
      <AppHeader
        crumbs={[{ label: "ระบบรายงานค่าสาธารณูปโภค", href: "/dashboard" }, { label: "จัดการผู้ใช้งาน" }]}
        action={<CreateUserDialog />}
      />
      <div className="flex flex-col gap-5 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">จัดการผู้ใช้งาน</h1>
          <p className="text-sm text-muted-foreground mt-1">
            กำหนดบทบาทและสิทธิ์การเข้าถึงของผู้ใช้งานในระบบ รวม {users.length} รายการ
          </p>
        </div>

        <UsersTable users={users} currentUserId={me.id} />
      </div>
    </>
  )
}
