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
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>อักษรย่อหน่วยงาน</TableHead>
              <TableHead>หน่วยงานเต็ม</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">วันที่เพิ่ม</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} isMe={u.id === currentUserId} />
            ))}
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
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {initials(user.full_name) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm flex items-center gap-2">
              {user.full_name}
              {isMe && <Badge variant="outline" className="text-[10px] h-4 px-1">คุณ</Badge>}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{user.department || "-"}</TableCell>
      <TableCell>
        {isMe ? (
          <Badge variant={ROLE_VARIANT[user.role]} className="font-normal">
            {roleLabel(user.role)}
          </Badge>
        ) : (
          <Select value={user.role} onValueChange={onRoleChange} disabled={pending}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">ผู้ดูแลระบบ</SelectItem>
              <SelectItem value="STAFF">เจ้าหน้าที่</SelectItem>
              <SelectItem value="USER">ผู้ใช้งาน</SelectItem>
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
