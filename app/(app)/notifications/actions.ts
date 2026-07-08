"use server"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function getNotificationsAction(limit = 20) {
  const user = await getCurrentUser()
  if (!user) return { data: [], unreadCount: 0 }

  const notifications = await prisma.notifications.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: "desc" },
    take: limit,
  })

  const unreadCount = await prisma.notifications.count({
    where: { user_id: user.id, is_read: false },
  })

  return {
    data: notifications.map((n) => ({
      ...n,
      created_at: n.created_at.toISOString(),
    })),
    unreadCount,
  }
}

export async function markAsReadAction(id?: number) {
  const user = await getCurrentUser()
  if (!user) return { success: false }

  try {
    if (id) {
      await prisma.notifications.updateMany({
        where: { id, user_id: user.id },
        data: { is_read: true },
      })
    } else {
      await prisma.notifications.updateMany({
        where: { user_id: user.id, is_read: false },
        data: { is_read: true },
      })
    }
    return { success: true }
  } catch (error) {
    console.error("Mark as read error:", error)
    return { success: false }
  }
}
