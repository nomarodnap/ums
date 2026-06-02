import { redirect } from "next/navigation"
import Image from "next/image"
import { ResetPasswordForm } from "./reset-password-form"

export const metadata = {
  title: "ตั้งรหัสผ่านใหม่ | ระบบรายงานค่าสาธารณูปโภค กรมประมง",
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 sm:p-12 bg-muted/30">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-xl shadow-sm border">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 shrink-0 relative">
            <Image src="/logo.png" alt="กรมประมง" fill className="object-contain" priority sizes="64px" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">ตั้งรหัสผ่านใหม่</h1>
            <p className="text-sm text-muted-foreground mt-1">
              กรุณาตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ
            </p>
          </div>
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </main>
  )
}
