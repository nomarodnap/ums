"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { resetPassword, type ResetPasswordFormState } from "./actions"
import Link from "next/link"

const initialState: ResetPasswordFormState = {}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initialState)

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">เปลี่ยนรหัสผ่านสำเร็จ</h2>
          <p className="text-muted-foreground">
            รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว<br />
            คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
          </p>
        </div>
        <Button asChild className="mt-4">
          <Link href="/login">ไปที่หน้าเข้าสู่ระบบ</Link>
        </Button>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="token" value={token} />
      
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">ตั้งรหัสผ่านใหม่</FieldLabel>
          <Input id="password" name="password" type="password" required minLength={6} placeholder="อย่างน้อย 6 ตัวอักษร" />
        </Field>
      </FieldGroup>

      {state.error && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
            กำลังบันทึก...
          </>
        ) : (
          "บันทึกรหัสผ่านใหม่"
        )}
      </Button>
    </form>
  )
}
