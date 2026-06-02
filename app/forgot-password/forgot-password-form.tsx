"use client"

import { useActionState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Send } from "lucide-react"
import { requestPasswordReset, type ForgotPasswordFormState } from "./actions"
import { resendVerificationAction } from "@/app/login/actions"
import Link from "next/link"
import { toast } from "sonner"

const initialState: ForgotPasswordFormState = {}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState)
  const [isResending, startResend] = useTransition()

  const handleResend = () => {
    if (!state.email) return
    startResend(async () => {
      const result = await resendVerificationAction(state.email!)
      if (result.success) {
        toast.success("ส่งอีเมลยืนยันตัวตนใหม่เรียบร้อยแล้ว กรุณาตรวจสอบกล่องข้อความของคุณ")
      } else {
        toast.error(result.error || "ไม่สามารถส่งอีเมลได้")
      }
    })
  }

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">ส่งอีเมลสำเร็จ</h2>
          <p className="text-muted-foreground">
            เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณแล้ว<br />
            กรุณาตรวจสอบกล่องข้อความของคุณ
          </p>
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>
        </Button>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">อีเมล</FieldLabel>
          <Input id="email" name="email" type="email" required placeholder="name@fisheries.go.th" />
        </Field>
      </FieldGroup>

      {state.error && (
        <div className="space-y-3">
          <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
            <span>{state.error}</span>
          </div>
          {state.isPendingVerification && (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังส่ง...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> ส่งอีเมลยืนยันตัวตนอีกครั้ง
                </>
              )}
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3">
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
              กำลังส่งอีเมล...
            </>
          ) : (
            "ส่งลิงก์รีเซ็ตรหัสผ่าน"
          )}
        </Button>
        <Button asChild variant="ghost" className="w-full text-muted-foreground">
          <Link href="/login">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </Button>
      </div>
    </form>
  )
}
