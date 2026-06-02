import { redirect } from "next/navigation"
import Image from "next/image"
import { VerifyEmailForm } from "./verify-email-form"

export const metadata = {
  title: "ยืนยันอีเมล | ระบบรายงานค่าสาธารณูปโภค กรมประมง",
}

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">ยืนยันตัวตน</h1>
            <p className="text-sm text-muted-foreground mt-1">
              กรุณาตั้งรหัสผ่านสำหรับบัญชีของคุณ
            </p>
          </div>
        </div>

        <VerifyEmailForm token={token} />
      </div>
    </main>
  )
}
