"use client"

import { useActionState, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { updateBillStatusAction } from "@/app/(app)/reports/actions"
import { CheckCircle2, Loader2, ArrowLeft, XCircle, RotateCcw } from "lucide-react"
import Link from "next/link"
import type { BillFormState } from "@/app/(app)/reports/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

const initialState: BillFormState = {}

export function ReviewActions({ billId, status, onSuccess }: { billId: number, status: string, onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(updateBillStatusAction, initialState)
  
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  
  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess()
    }
  }, [state.success, onSuccess])
  
  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full md:w-auto mt-2 md:mt-0">

        
        {status === "SUBMITTED" && (
          <form action={formAction} className="flex items-center gap-2 w-full sm:w-auto">
            <input type="hidden" name="id" value={billId} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" type="button" disabled={pending} className="shadow-sm w-10 shrink-0" aria-label="จัดการเพิ่มเติม">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-amber-600 focus:text-amber-700 cursor-pointer" onClick={() => setReturnDialogOpen(true)}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  ส่งกลับแก้ไข...
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-700 cursor-pointer" onClick={() => setRejectDialogOpen(true)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  ไม่อนุมัติ...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              type="submit" 
              name="status" 
              value="APPROVED" 
              disabled={pending} 
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
                  ดำเนินการ...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden />
                  อนุมัติรายงาน
                </>
              )}
            </Button>
          </form>
        )}

        {state.error && (
          <span className="text-sm text-destructive font-medium w-full text-center sm:text-left">{state.error}</span>
        )}
      </div>

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <form action={formAction}>
            <input type="hidden" name="id" value={billId} />
            <input type="hidden" name="status" value="RETURNED" />
            
            <DialogHeader>
              <DialogTitle>ส่งกลับแก้ไข</DialogTitle>
              <DialogDescription>
                กรุณาระบุเหตุผลที่ต้องการส่งรายงานนี้กลับไปให้ผู้ใช้งานแก้ไข
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                name="reject_reason"
                placeholder="ระบุเหตุผล (เช่น แนบไฟล์ผิด, ยอดเงินไม่ตรง...)"
                required
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReturnDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={pending} className="bg-amber-600 hover:bg-amber-700 text-white">
                {pending ? "กำลังดำเนินการ..." : "ยืนยันส่งกลับ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <form action={formAction}>
            <input type="hidden" name="id" value={billId} />
            <input type="hidden" name="status" value="REJECTED" />
            
            <DialogHeader>
              <DialogTitle className="text-red-600">ไม่อนุมัติรายงาน</DialogTitle>
              <DialogDescription>
                กรุณาระบุเหตุผลที่ไม่อนุมัติรายงานนี้ การไม่อนุมัติจะทำให้รายงานนี้ถูกปิดและไม่สามารถแก้ไขได้อีก
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                name="reject_reason"
                placeholder="ระบุเหตุผล (เช่น ข้อมูลซ้ำซ้อน, ไม่ตรงตามเงื่อนไข...)"
                required
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRejectDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={pending} variant="destructive">
                {pending ? "กำลังดำเนินการ..." : "ยืนยันไม่อนุมัติ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
