import Image from "next/image"
import { ForgotPasswordForm } from "./forgot-password-form"

export const metadata = {
  title: "ลืมรหัสผ่าน | ระบบรายงานค่าสาธารณูปโภค กรมประมง",
}

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 sm:p-12 bg-muted/30">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-xl shadow-sm border">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 shrink-0 relative">
            <Image src="/logo.png" alt="กรมประมง" fill className="object-contain" priority sizes="64px" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">ลืมรหัสผ่าน</h1>
            <p className="text-sm text-muted-foreground mt-1">
              กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
            </p>
          </div>
        </div>

        <ForgotPasswordForm />
      </div>
    </main>
  )
}
