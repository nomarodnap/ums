"use client"

import { useActionState } from "react"
import { loginAction, resendVerificationAction, type LoginState } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Lock, Mail, Send } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"

const initialState: LoginState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)
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

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm">
          อีเมลผู้ใช้งาน
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@fisheries.go.th"
            autoComplete="email"
            required
            className="pl-9 h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm">
            รหัสผ่าน
          </Label>
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            minLength={6}
            className="pl-9 h-11"
          />
        </div>
      </div>

      {state.error && (
        <div className="space-y-3">
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
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

      <Button type="submit" className="w-full h-11 font-medium" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
            กำลังเข้าสู่ระบบ...
          </>
        ) : (
          "เข้าสู่ระบบ"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        การเข้าใช้ระบบถือเป็นการยอมรับนโยบายความปลอดภัยของหน่วยงาน
      </p>
    </form>
  )
}
