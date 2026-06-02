import type { Metadata } from "next"
import { Sarabun } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ระบบรายงานค่าสาธารณูปโภค | กรมประมง",
  description: "ระบบบันทึกและรายงานค่าสาธารณูปโภคกรมประมง กระทรวงเกษตรและสหกรณ์",
  generator: "v0.app",
}

export const viewport = {
  themeColor: "#1D5480",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
