import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { LoginForm } from "./login-form"
import { Shield, Waves } from "lucide-react"
import Image from "next/image"

export const metadata = {
  title: "เข้าสู่ระบบ | ระบบรายงานค่าสาธารณูปโภค กรมประมง",
}

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect("/dashboard")

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left: branding panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sidebar-primary blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-chart-2 blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 shrink-0">
            <Image src="/logo.png" alt="กรมประมง" width={56} height={56} className="object-contain" priority />
          </div>
          <div className="leading-tight">
            <p className="text-sm opacity-80">กระทรวงเกษตรและสหกรณ์</p>
            <p className="font-semibold">กรมประมง</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-4xl font-semibold leading-tight text-balance">
            ระบบรายงาน
            <br />
            ค่าสาธารณูปโภค
          </h1>
          <p className="text-sidebar-foreground/80 text-pretty leading-relaxed max-w-md">
            เครื่องมือสำหรับบันทึก ติดตาม และวิเคราะห์ค่าใช้จ่ายด้านสาธารณูปโภคของหน่วยงาน
            พร้อมรายงานเชิงลึกและการแสดงผลข้อมูลในรูปแบบกราฟที่เข้าใจง่าย
          </p>
          <div className="grid grid-cols-1 gap-3 pt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
              <Shield className="w-5 h-5 text-sidebar-primary mt-0.5 shrink-0" aria-hidden />
              <div>
                <p className="font-medium text-sm">ความปลอดภัยระดับองค์กร</p>
                <p className="text-xs text-sidebar-foreground/70">การยืนยันตัวตนและจัดการสิทธิ์แบบหลายระดับ</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
              <Waves className="w-5 h-5 text-sidebar-primary mt-0.5 shrink-0" aria-hidden />
              <div>
                <p className="font-medium text-sm">รองรับการขยายระบบ</p>
                <p className="text-xs text-sidebar-foreground/70">ออกแบบเพื่อรองรับฟีเจอร์เพิ่มเติมในอนาคต</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-sidebar-foreground/60">
          © 2568 กรมประมง กระทรวงเกษตรและสหกรณ์ สงวนลิขสิทธิ์
        </p>
      </aside>

      {/* Right: form */}
      <section className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 shrink-0">
              <Image src="/logo.png" alt="กรมประมง" width={48} height={48} className="object-contain" priority />
            </div>
            <div className="leading-tight">
              <p className="text-xs text-muted-foreground">กรมประมง</p>
              <p className="font-semibold">ระบบรายงานค่าสาธารณูปโภค</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">เข้าสู่ระบบ</h2>
            <p className="text-sm text-muted-foreground text-pretty">
              กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่เพื่อเข้าใช้งานระบบรายงานค่าสาธารณูปโภค
            </p>
          </div>

          <LoginForm />

          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <p className="font-medium mb-2 text-foreground">บัญชีทดสอบ</p>
            <ul className="space-y-1 text-muted-foreground text-xs font-mono">
              <li>admin@fisheries.go.th / admin123</li>
              <li>staff@fisheries.go.th / staff123</li>
              <li>user@fisheries.go.th / user123</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
