"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { User } from "@/lib/db"
import { roleLabel } from "@/lib/format"
import { useTransition } from "react"
import { toast } from "sonner"
import { toggleUserActiveAction, updateUserRoleAction } from "@/app/(app)/users/actions"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  STAFF: "secondary",
  USER: "outline",
}

export function UsersTable({ users, currentUserId }: { users: User[]; currentUserId: number }) {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-lg shadow-primary/5 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold h-14">ชื่อเต็มหน่วยงาน</TableHead>
              <TableHead className="font-semibold h-14">ชื่อย่อหน่วยงาน</TableHead>
              <TableHead className="font-semibold h-14">รหัสศูนย์ต้นทุน</TableHead>
              <TableHead className="font-semibold h-14 w-[180px]">บทบาท</TableHead>
              <TableHead className="font-semibold h-14 w-[140px]">สถานะ</TableHead>
              <TableHead className="font-semibold h-14 text-right">วันที่เพิ่ม</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} isMe={u.id === currentUserId} />
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  ไม่พบผู้ใช้งานในระบบ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function UserRow({ user, isMe }: { user: User; isMe: boolean }) {
  const [pending, start] = useTransition()

  function onRoleChange(v: string) {
    start(async () => {
      const res = await updateUserRoleAction(user.id, v)
      if (res.error) toast.error(res.error)
      else toast.success("อัปเดตบทบาทเรียบร้อย")
    })
  }

  function onToggleActive() {
    start(async () => {
      const res = await toggleUserActiveAction(user.id)
      if (res.error) toast.error(res.error)
      else toast.success(user.is_active ? "ระงับการใช้งานเรียบร้อย" : "เปิดใช้งานเรียบร้อย")
    })
  }

  return (
    <TableRow className="group hover:bg-muted/50 transition-colors">
      <TableCell>
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border-2 border-background shadow-sm ring-2 ring-primary/10 transition-all group-hover:scale-105">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-sm font-bold">
              {initials(user.full_name) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex flex-col">
            <p className="font-semibold text-sm flex items-center gap-2 text-foreground">
              {user.full_name}
              {isMe && <Badge variant="default" className="text-[10px] h-5 px-1.5 bg-primary/90 hover:bg-primary shadow-sm">บัญชีของคุณ</Badge>}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{user.department || "-"}</TableCell>
      <TableCell className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        <Badge variant="outline" className="font-mono bg-muted/50">{user.cost_center || "-"}</Badge>
      </TableCell>
      <TableCell>
        {isMe ? (
          <Badge variant={ROLE_VARIANT[user.role]} className="font-medium px-3 py-1 shadow-sm">
            {roleLabel(user.role)}
          </Badge>
        ) : (
          <Select value={user.role} onValueChange={onRoleChange} disabled={pending}>
            <SelectTrigger className="w-[140px] h-9 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN" className="font-medium text-primary">ผู้ดูแลระบบ</SelectItem>
              <SelectItem value="STAFF" className="font-medium">เจ้าหน้าที่</SelectItem>
              <SelectItem value="USER" className="font-medium text-muted-foreground">ผู้ใช้งาน</SelectItem>
            </SelectContent>
          </Select>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={user.is_active}
            onCheckedChange={onToggleActive}
            disabled={pending || isMe}
            aria-label="toggle active"
          />
          <span className="text-xs text-muted-foreground">
            {user.is_active ? "ใช้งานได้" : "ระงับ"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right text-xs text-muted-foreground">
        {new Date(user.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
      </TableCell>
    </TableRow>
  )
}
