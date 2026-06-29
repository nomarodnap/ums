import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { requireUser } from "@/lib/auth"
import { getAllUsers } from "@/lib/queries"
import { UsersTable } from "@/components/users/users-table"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { Users } from "lucide-react"

export const metadata = { title: "จัดการผู้ใช้งาน" }

export default async function UsersPage() {
  const me = await requireUser()
  if (me.role !== "ADMIN") redirect("/dashboard")

  const users = await getAllUsers()

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
      <AppHeader
        crumbs={[{ label: "ระบบรายงานค่าสาธารณูปโภค", href: "/dashboard" }, { label: "จัดการผู้ใช้งาน" }]}
        action={<CreateUserDialog />}
      />
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white dark:bg-card p-6 md:p-8 rounded-3xl border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="p-4 bg-primary/10 rounded-2xl ring-8 ring-primary/5">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                จัดการผู้ใช้งานระบบ
              </h1>
              <p className="text-muted-foreground text-base mt-2">
                กำหนดบทบาท สิทธิ์การเข้าถึง และข้อมูลพื้นฐานของผู้ใช้งานทั้งหมดในระบบ
              </p>
            </div>
          </div>
          
          <div className="relative z-10 bg-primary/5 px-5 py-3 rounded-2xl border border-primary/10 flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">บัญชีทั้งหมด</span>
            <span className="text-2xl font-bold text-primary">{users.length}</span>
            <span className="text-sm font-medium text-muted-foreground">รายการ</span>
          </div>
        </div>

        <UsersTable users={users} currentUserId={me.id} />
      </div>
    </div>
  )
}
