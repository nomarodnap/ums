"use client"

import { useActionState, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUserAction, type UserFormState } from "@/app/(app)/users/actions"
import { AlertCircle, Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"

const initialState: UserFormState = {}

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createUserAction, initialState)

  useEffect(() => {
    if (state.success) {
      toast.success("สร้างผู้ใช้งานเรียบร้อย")
      setOpen(false)
    }
  }, [state.success])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="w-4 h-4 mr-1.5" aria-hidden />
          เพิ่มผู้ใช้งาน
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มผู้ใช้งานใหม่</DialogTitle>
          <DialogDescription>สร้างบัญชีใหม่ ระบบจะส่งอีเมลเพื่อให้ผู้ใช้ยืนยันตัวตนและตั้งรหัสผ่านด้วยตนเอง</DialogDescription>
        </DialogHeader>
        <form action={action}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="full_name">หน่วยงานเต็ม</FieldLabel>
              <Input id="full_name" name="full_name" required placeholder="เช่น กลุ่มพัฒนาระบบบริหาร" />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">อีเมล</FieldLabel>
              <Input id="email" name="email" type="email" required placeholder="xxx@fisheries.go.th" />
            </Field>
            <Field>
              <FieldLabel htmlFor="department">อักษรย่อหน่วยงาน</FieldLabel>
              <Input id="department" name="department" placeholder="เช่น กพร." />
            </Field>
            <Field>
              <FieldLabel htmlFor="cost_center">รหัสศูนย์ต้นทุน</FieldLabel>
              <Input id="cost_center" name="cost_center" placeholder="เช่น 0700500001" />
            </Field>
            <Field>
              <FieldLabel htmlFor="role">บทบาท</FieldLabel>
              <Select name="role" defaultValue="USER">
                <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ผู้ดูแลระบบ</SelectItem>
                  <SelectItem value="STAFF">เจ้าหน้าที่ (บันทึก/แก้ไขข้อมูล)</SelectItem>
                  <SelectItem value="USER">ผู้ใช้งาน (ดูเท่านั้น)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          {state.error && (
            <div role="alert" className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>{state.error}</span>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
                  กำลังสร้าง...
                </>
              ) : (
                "สร้างบัญชี"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
