"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { BillForm } from "./bill-form"
import type { UtilityBill } from "@/lib/db"
import type { UserRole } from "@/lib/db"

export function BillFormDialog({ 
  children, 
  initialData, 
  userFullName, 
  userRole, 
  agencyUsers 
}: { 
  children: React.ReactNode
  initialData?: Partial<UtilityBill>
  userFullName?: string
  userRole?: UserRole
  agencyUsers?: { id: number, short_name: string, department: string }[]
}) {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-[1200px] max-h-[90vh] overflow-y-auto p-0 sm:rounded-2xl border-none">
        <div className="p-6 pb-2 sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              {initialData ? "รายละเอียดรายงานค่าสาธารณูปโภค" : "บันทึกรายการค่าสาธารณูปโภคใหม่"}
            </DialogTitle>
            <DialogDescription>
              {initialData 
                ? "ตรวจสอบหรือแก้ไขข้อมูลใบแจ้งหนี้ค่าสาธารณูปโภค" 
                : "กรอกข้อมูลใบแจ้งหนี้ค่าสาธารณูปโภค ระบบจะบันทึกผู้ทำรายการไว้โดยอัตโนมัติ"}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-4 sm:p-6 pt-2">
          <BillForm 
            initialData={initialData} 
            userFullName={userFullName} 
            userRole={userRole} 
            agencyUsers={agencyUsers} 
            onSuccess={() => setOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
