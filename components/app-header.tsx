import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { NotificationBell } from "@/components/notification-bell"

export function AppHeader({
  crumbs,
  action,
}: {
  crumbs: { label: string; href?: string }[]
  action?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1
            return (
              <div key={i} className="contents">
                <BreadcrumbItem className={i === 0 ? "hidden md:block" : ""}>
                  {last || !c.href ? (
                    <BreadcrumbPage className="font-medium">{c.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!last && <BreadcrumbSeparator className={i === 0 ? "hidden md:block" : ""} />}
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        {action}
        <NotificationBell />
      </div>
    </header>
  )
}
