"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { BarChart3, ClipboardCheck, FileText, LayoutDashboard, Users, FileUp } from "lucide-react"
import type { User, UserRole } from "@/lib/db"
import { roleLabel } from "@/lib/format"
import { UserMenu } from "./user-menu"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  roles: UserRole[]
}

const nav: NavItem[] = [
  { href: "/dashboard", label: "หน้าหลัก", icon: LayoutDashboard, roles: ["ADMIN", "STAFF", "USER"] },
  { href: "/reports", label: "รายงานค่าสาธารณูปโภค", icon: FileText, roles: ["ADMIN", "STAFF", "USER"] },
  { href: "/analytics", label: "วิเคราะห์ข้อมูล", icon: BarChart3, roles: ["ADMIN", "STAFF", "USER"] },
  { href: "/status", label: "ตรวจสอบสถานะรายงาน", icon: ClipboardCheck, roles: ["ADMIN"] },
  { href: "/import", label: "นำเข้าข้อมูล Excel", icon: FileUp, roles: ["ADMIN", "STAFF"] },
  { href: "/users", label: "จัดการผู้ใช้งาน", icon: Users, roles: ["ADMIN"] },
]

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex items-center justify-center w-10 h-10 shrink-0">
            <Image src="/logo.png" alt="กรมประมง" width={40} height={40} className="object-contain" priority />
          </div>
          <div className="leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-sidebar-foreground/70 truncate">กระทรวงเกษตรและสหกรณ์</p>
            <p className="font-semibold text-sm truncate">กรมประมง</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav
                .filter((item) => item.roles.includes(user.role))
                .map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href}>
                          <Icon aria-hidden />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="rounded-md bg-sidebar-accent/60 border border-sidebar-border p-3">
            <p className="text-xs text-sidebar-foreground/70">เข้าสู่ระบบในนาม</p>
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.full_name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{roleLabel(user.role)}</p>
          </div>
        </div>
        <UserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
