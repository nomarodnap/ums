import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="bg-muted/30">{children}</SidebarInset>
    </SidebarProvider>
  )
}
