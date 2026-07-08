"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getNotificationsAction, markAsReadAction } from "@/app/(app)/notifications/actions"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"

type Notification = {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  bill_id: number | null
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationsAction(20)
      setNotifications(res.data as Notification[])
      setUnreadCount(res.unreadCount)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Optional: Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id?: number) => {
    await markAsReadAction(id)
    fetchNotifications()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">การแจ้งเตือน</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto px-2 py-1 text-xs text-muted-foreground"
              onClick={() => handleMarkAsRead()}
            >
              อ่านทั้งหมด
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((noti) => (
                <div 
                  key={noti.id} 
                  className={`flex items-start gap-3 p-4 border-b last:border-b-0 transition-colors hover:bg-muted/50 ${!noti.is_read ? 'bg-primary/5' : ''}`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${noti.type === 'NEW_REPORT' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                    {noti.type === 'NEW_REPORT' ? <Info className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm ${!noti.is_read ? 'font-medium' : ''}`}>
                      {noti.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {noti.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-1">
                      {formatDistanceToNow(new Date(noti.created_at), { addSuffix: true, locale: th })}
                    </p>
                  </div>
                  {!noti.is_read && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 shrink-0" 
                      onClick={() => handleMarkAsRead(noti.id)}
                      title="ทำเครื่องหมายว่าอ่านแล้ว"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">ไม่มีการแจ้งเตือนใหม่</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
