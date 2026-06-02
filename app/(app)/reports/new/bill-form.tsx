"use client"

import { useActionState, useState, useRef } from "react"
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
import { createBillAction, type BillFormState } from "../actions"
import { AlertCircle, Loader2, Save, UploadCloud } from "lucide-react"
import Link from "next/link"
import { DatePickerBE } from "@/components/ui/date-picker-be"

const initialState: BillFormState = {}

export function BillForm({ types }: { types: UtilityType[] }) {
  const [state, formAction, pending] = useActionState(createBillAction, initialState)

  const now = new Date()
  const currentYear = getFiscalYear(now)
  const currentMonth = now.getMonth() + 1
  const years = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2]

  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card className="shadow-sm border-muted-foreground/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6 md:p-8">
        <form action={formAction}>
          <div className="space-y-8">
            {/* 1. ข้อมูลเอกสารทั่วไป */}
            <FieldSet>
              <FieldLegend>ข้อมูลเอกสารทั่วไป</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="cost_center">ศูนย์ต้นทุน</FieldLabel>
                    <Input id="cost_center" name="cost_center" placeholder="เช่น 0700500043" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="document_date">วันที่เอกสาร</FieldLabel>
                    <DatePickerBE id="document_date" name="document_date" />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="document_no">เลขเอกสาร</FieldLabel>
                    <Input id="document_no" name="document_no" placeholder="เช่น 3100008383" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="document_type">ประเภทเอกสาร</FieldLabel>
                    <Select name="document_type">
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
                    <Select name="gl_code">
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
                    <Input id="budget_code" name="budget_code" placeholder="เช่น 07005302001002000000" />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="amount">จำนวนเงิน (บาท) *</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                      />
                      <InputGroupAddon align="inline-end">บาท</InputGroupAddon>
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="utility_type_id">ประเภทรายการในระบบ *</FieldLabel>
                    <Select name="utility_type_id" required>
                      <SelectTrigger id="utility_type_id">
                        <SelectValue placeholder="เลือกประเภทระบบ" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.name_th}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Input id="own_agency" name="own_agency" placeholder="เช่น ศปท.ชุมพร" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="proxy_agency">หน่วยงานที่ฝากเบิก</FieldLabel>
                    <Input id="proxy_agency" name="proxy_agency" placeholder="เช่น นปท.หลังสวน" />
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
                    <FieldLabel htmlFor="billing_year">ประจำปีงบประมาณ *</FieldLabel>
                    <Select name="billing_year" required defaultValue={String(currentYear)}>
                      <SelectTrigger id="billing_year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {toBuddhistYear(y)} ({y})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="billing_month">ประจำเดือน *</FieldLabel>
                    <Select name="billing_month" required defaultValue={String(currentMonth)}>
                      <SelectTrigger id="billing_month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {THAI_MONTHS.map((m, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="meter_no">เลขมิเตอร์/ผู้ใช้/เบอร์โทร</FieldLabel>
                    <Input id="meter_no" name="meter_no" placeholder="เช่น 0011020004274691" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="invoice_date">วันที่ใบแจ้งหนี้</FieldLabel>
                    <DatePickerBE id="invoice_date" name="invoice_date" />
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
                    <DatePickerBE id="receive_date" name="receive_date" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="proxy_send_date">หน่วยฝากเบิกส่ง</FieldLabel>
                    <DatePickerBE id="proxy_send_date" name="proxy_send_date" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="payer_receive_date">หน่วยเบิกจ่ายลงรับ</FieldLabel>
                    <DatePickerBE id="payer_receive_date" name="payer_receive_date" />
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>

            {/* 5. การแนบหลักฐานและเอกสาร */}
            <FieldSet>
              <FieldLegend>การแนบหลักฐานและเอกสาร</FieldLegend>
              <FieldGroup>
                <div className="flex flex-col sm:flex-row gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox name="has_receipt" value="true" />
                    <span className="text-sm font-medium">ใบเสร็จรับเงิน</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox name="has_direct_pay" value="true" />
                    <span className="text-sm font-medium">รายงานจ่ายตรง</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox name="has_ktb" value="true" />
                    <span className="text-sm font-medium">รายงาน KTB</span>
                  </label>
                </div>

                <Field>
                  <FieldLabel>อัปโหลดเอกสารประกอบ</FieldLabel>
                  <div 
                    className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="p-3 bg-background rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium mb-1 text-foreground">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่</p>
                    <p className="text-xs text-muted-foreground">รองรับไฟล์ PDF, JPG, PNG (ไม่เกิน 5MB)</p>
                    {fileName && (
                      <div className="mt-3 py-1 px-3 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {fileName}
                      </div>
                    )}
                    <input 
                      type="file" 
                      name="file" 
                      id="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="note">หมายเหตุ</FieldLabel>
                  <Textarea id="note" name="note" rows={2} placeholder="เช่น จ่ายเช็ค" />
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
              <Link href="/reports">ยกเลิก</Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" aria-hidden />
                  บันทึกรายการ
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
