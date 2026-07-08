"use client"

import { useActionState, useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Checkbox } from "@/components/ui/checkbox"
import { THAI_MONTHS, toBuddhistYear, getFiscalYear } from "@/lib/format"
import type { UtilityType } from "@/lib/db"
import { createBillAction, type BillFormState } from "@/app/(app)/reports/actions"
import type { UtilityBill } from "@/lib/db"
import { AlertCircle, Loader2, Save, UploadCloud, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { DatePickerBE } from "@/components/ui/date-picker-be"
import { AgencyCombobox } from "./agency-combobox"

import type { UserRole } from "@/lib/db"

const initialState: BillFormState = {}

export function BillForm({ initialData, userFullName, userRole, agencyUsers, onSuccess }: { initialData?: Partial<UtilityBill>, userFullName?: string, userRole?: UserRole, agencyUsers?: { id: number, short_name: string, department: string }[], onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(createBillAction, initialState)

  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess()
    }
  }, [state.success, onSuccess])

  
  const isReadOnly = !!initialData && initialData.status !== "RETURNED" && initialData.status !== "PENDING"

  const now = new Date()
  const currentYear = getFiscalYear(now)
  const currentMonth = now.getMonth() + 1
  const years = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2]

  const [fileNames, setFileNames] = useState<{ receipt: string | null, directPay: string | null, ktb: string | null }>({
    receipt: null,
    directPay: null,
    ktb: null
  })

  const receiptInputRef = useRef<HTMLInputElement>(null)
  const directPayInputRef = useRef<HTMLInputElement>(null)
  const ktbInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card className="shadow-sm border-muted-foreground/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6 md:p-8">
        {(initialData?.status === "SUBMITTED" || initialData?.status === "APPROVED") && (
          <div className="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800">
            <Save className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-900">สถานะ: ส่งข้อมูลเรียบร้อยแล้ว</p>
              <p className="text-sm mt-1">รายการนี้ถูกส่งเข้าสู่ระบบแล้ว คุณสามารถตรวจสอบข้อมูลที่ส่งไปได้ด้านล่างนี้</p>
            </div>
          </div>
        )}
        
        {initialData?.status === "RETURNED" && (
          <div className="mb-6 p-4 rounded-md bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">รายการนี้ถูกส่งกลับเพื่อแก้ไข</p>
              <p className="text-sm mt-1 mb-2">กรุณาแก้ไขข้อมูลตามเหตุผลด้านล่างแล้วกดส่งข้อมูลอีกครั้ง</p>
              <div className="bg-amber-100/50 p-3 rounded text-sm text-amber-900 border border-amber-200/50">
                <strong>เหตุผล:</strong> {initialData.reject_reason || "-"}
              </div>
            </div>
          </div>
        )}
        <form action={formAction}>
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
          <div className="space-y-8">
            {/* 1. ข้อมูลเอกสารทั่วไป */}
            <FieldSet>
              <FieldLegend>ข้อมูลเอกสารทั่วไป</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="cost_center">ศูนย์ต้นทุน</FieldLabel>
                    <Input id="cost_center" name="cost_center" placeholder="เช่น 0700500043" defaultValue={initialData?.cost_center || ""} readOnly={!!initialData} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="document_date">วันที่เอกสาร</FieldLabel>
                    <DatePickerBE id="document_date" name="document_date" defaultValue={initialData?.document_date ? new Date(initialData.document_date) : null} disabled={!!initialData} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="document_no">เลขเอกสาร</FieldLabel>
                    <Input id="document_no" name="document_no" placeholder="เช่น 3100008383" defaultValue={initialData?.document_no || ""} readOnly={!!initialData} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="document_type">ประเภทเอกสาร</FieldLabel>
                    {initialData?.document_type && <input type="hidden" name="document_type" value={initialData.document_type} />}
                    <Select name={initialData?.document_type ? undefined : "document_type"} defaultValue={initialData?.document_type || undefined} disabled={!!initialData}>
                      <SelectTrigger id="document_type">
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KC">KC</SelectItem>
                        <SelectItem value="KL">KL</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="gl_code">รหัสแยกประเภท</FieldLabel>
                    {initialData?.gl_code && <input type="hidden" name="gl_code" value={initialData.gl_code} />}
                    <Select name={initialData?.gl_code ? undefined : "gl_code"} defaultValue={initialData?.gl_code || undefined} disabled={!!initialData}>
                      <SelectTrigger id="gl_code">
                        <SelectValue placeholder="เลือกรหัสแยกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5104020101">5104020101 - ค่าไฟฟ้า</SelectItem>
                        <SelectItem value="5104020103">5104020103 - ค่าประปา&น้ำบาดาล</SelectItem>
                        <SelectItem value="5104020105">5104020105 - ค่าโทรศัพท์</SelectItem>
                        <SelectItem value="5104020106">5104020106 - ค่าสื่อสาร&โทรคมนาคม</SelectItem>
                        <SelectItem value="5104020107">5104020107 - ค่าบริการไปรษณีย์</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="budget_code">รหัสงบประมาณ</FieldLabel>
                    <Input id="budget_code" name="budget_code" placeholder="เช่น 07005302001002000000" defaultValue={initialData?.budget_code || ""} readOnly={!!initialData} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="amount">จำนวนเงิน</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        defaultValue={initialData?.amount || ""}
                        readOnly={!!initialData}
                      />
                      <InputGroupAddon align="inline-end">บาท</InputGroupAddon>
                    </InputGroup>
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>

            {/* 2. หน่วยงานที่เบิกจ่าย */}
            <FieldSet>
              <FieldLegend>หน่วยงานที่เบิกจ่าย</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="own_agency">หน่วยงานตนเอง</FieldLabel>
                    <Input id="own_agency" name="own_agency" placeholder="เช่น ศปท.ชุมพร" defaultValue={userFullName || initialData?.own_agency || ""} readOnly />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="proxy_agency">หน่วยงานที่ฝากเบิก</FieldLabel>
                    {agencyUsers ? (
                      <AgencyCombobox name="proxy_agency" defaultValue={initialData?.proxy_agency || ""} users={agencyUsers} />
                    ) : (
                      <Input id="proxy_agency" name="proxy_agency" placeholder="เช่น นปท.หลังสวน" defaultValue={initialData?.proxy_agency || ""} />
                    )}
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>

            {/* 3. ใบแจ้งหนี้ */}
            <FieldSet>
              <FieldLegend>ข้อมูลใบแจ้งหนี้</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="invoice_month">ประจำเดือน</FieldLabel>
                    <Select name="invoice_month" defaultValue={initialData?.invoice_month ? String(initialData.invoice_month) : (initialData?.billing_month ? String(initialData.billing_month) : "none")} disabled={isReadOnly}>
                      <SelectTrigger id="invoice_month">
                        <SelectValue placeholder="ไม่ระบุ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">ไม่ระบุ</SelectItem>
                        {THAI_MONTHS.map((m, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="invoice_year">ประจำปี</FieldLabel>
                    <Select name="invoice_year" defaultValue={initialData?.invoice_year ? String(initialData.invoice_year) : (initialData?.billing_year ? String(initialData.billing_year) : "none")} disabled={isReadOnly}>
                      <SelectTrigger id="invoice_year">
                        <SelectValue placeholder="ไม่ระบุ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">ไม่ระบุ</SelectItem>
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {toBuddhistYear(y)} ({y})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="meter_no">เลขมิเตอร์/ผู้ใช้/เบอร์โทร</FieldLabel>
                    <Input id="meter_no" name="meter_no" placeholder="กรอกเลข/รหัส" defaultValue={initialData?.meter_no || ""} readOnly={isReadOnly} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="invoice_date">วันที่ใบแจ้งหนี้</FieldLabel>
                    <DatePickerBE id="invoice_date" name="invoice_date" defaultValue={initialData?.invoice_date ? new Date(initialData.invoice_date) : null} disabled={isReadOnly} />
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>

            {/* 4. วันที่ลงรับ */}
            <FieldSet>
              <FieldLegend>วันที่ลงรับ</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="receive_date">ลงรับใบแจ้งหนี้</FieldLabel>
                    <DatePickerBE id="receive_date" name="receive_date" defaultValue={initialData?.receive_date ? new Date(initialData.receive_date) : null} disabled={isReadOnly} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="proxy_send_date">หน่วยฝากเบิกส่ง</FieldLabel>
                    <DatePickerBE id="proxy_send_date" name="proxy_send_date" defaultValue={initialData?.proxy_send_date ? new Date(initialData.proxy_send_date) : null} disabled={isReadOnly} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="payer_receive_date">หน่วยเบิกจ่ายลงรับ</FieldLabel>
                    <DatePickerBE id="payer_receive_date" name="payer_receive_date" defaultValue={initialData?.payer_receive_date ? new Date(initialData.payer_receive_date) : null} disabled={isReadOnly} />
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>

            {/* 5. การแนบหลักฐานและเอกสาร */}
            <FieldSet>
              <FieldLegend>แนบหลักฐานและเอกสารที่มี</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Receipt Upload */}
                  <Field>
                    <FieldLabel>ใบเสร็จรับเงิน</FieldLabel>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center group h-40 ${isReadOnly ? 'border-border bg-muted/50 cursor-not-allowed opacity-70' : 'border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-all duration-300'}`}
                      onClick={() => !isReadOnly && receiptInputRef.current?.click()}
                    >
                      <div className={`p-2 bg-background rounded-full shadow-sm mb-2 ${!isReadOnly && 'group-hover:scale-110 transition-transform duration-300'}`}>
                        <UploadCloud className={`w-5 h-5 ${isReadOnly ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      <p className="text-xs font-medium mb-1 text-foreground">แนบใบเสร็จรับเงิน</p>
                      <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG (&lt;5MB)</p>
                      {fileNames.receipt && (
                        <div className={`mt-2 py-1 px-2 rounded-full text-[10px] font-medium truncate max-w-full ${isReadOnly ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                          {fileNames.receipt}
                        </div>
                      )}
                      <input
                        type="file"
                        name="receipt_file"
                        id="receipt_file"
                        className="hidden"
                        ref={receiptInputRef}
                        disabled={isReadOnly}
                        onChange={(e) => setFileNames(prev => ({ ...prev, receipt: e.target.files?.[0]?.name || null }))}
                      />
                    </div>
                  </Field>

                  {/* Direct Pay Upload */}
                  <Field>
                    <FieldLabel>รายงานจ่ายตรง</FieldLabel>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center group h-40 ${isReadOnly ? 'border-border bg-muted/50 cursor-not-allowed opacity-70' : 'border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-all duration-300'}`}
                      onClick={() => !isReadOnly && directPayInputRef.current?.click()}
                    >
                      <div className={`p-2 bg-background rounded-full shadow-sm mb-2 ${!isReadOnly && 'group-hover:scale-110 transition-transform duration-300'}`}>
                        <UploadCloud className={`w-5 h-5 ${isReadOnly ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      <p className="text-xs font-medium mb-1 text-foreground">แนบรายงานจ่ายตรง</p>
                      <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG (&lt;5MB)</p>
                      {fileNames.directPay && (
                        <div className={`mt-2 py-1 px-2 rounded-full text-[10px] font-medium truncate max-w-full ${isReadOnly ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                          {fileNames.directPay}
                        </div>
                      )}
                      <input
                        type="file"
                        name="direct_pay_file"
                        id="direct_pay_file"
                        className="hidden"
                        ref={directPayInputRef}
                        disabled={isReadOnly}
                        onChange={(e) => setFileNames(prev => ({ ...prev, directPay: e.target.files?.[0]?.name || null }))}
                      />
                    </div>
                  </Field>

                  {/* KTB Upload */}
                  <Field>
                    <FieldLabel>รายงาน KTB</FieldLabel>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center group h-40 ${isReadOnly ? 'border-border bg-muted/50 cursor-not-allowed opacity-70' : 'border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-all duration-300'}`}
                      onClick={() => !isReadOnly && ktbInputRef.current?.click()}
                    >
                      <div className={`p-2 bg-background rounded-full shadow-sm mb-2 ${!isReadOnly && 'group-hover:scale-110 transition-transform duration-300'}`}>
                        <UploadCloud className={`w-5 h-5 ${isReadOnly ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      <p className="text-xs font-medium mb-1 text-foreground">แนบรายงาน KTB</p>
                      <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG (&lt;5MB)</p>
                      {fileNames.ktb && (
                        <div className={`mt-2 py-1 px-2 rounded-full text-[10px] font-medium truncate max-w-full ${isReadOnly ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                          {fileNames.ktb}
                        </div>
                      )}
                      <input
                        type="file"
                        name="ktb_file"
                        id="ktb_file"
                        className="hidden"
                        ref={ktbInputRef}
                        disabled={isReadOnly}
                        onChange={(e) => setFileNames(prev => ({ ...prev, ktb: e.target.files?.[0]?.name || null }))}
                      />
                    </div>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="note">หมายเหตุ</FieldLabel>
                  <Textarea id="note" name="note" rows={2} placeholder="เช่น จ่ายเช็ค" defaultValue={initialData?.note || ""} disabled={isReadOnly} />
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>

          {state.error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>{state.error}</span>
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" type="button" asChild>
              <Link href="/reports">ย้อนกลับ</Link>
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" aria-hidden />
                    ส่งข้อมูล
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
