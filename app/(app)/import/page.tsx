"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUp, Loader2, AlertCircle, CheckCircle2, Download } from "lucide-react"
import { importExcelAction, previewExcelAction } from "./actions"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatTHB } from "@/lib/format"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AppHeader } from "@/components/app-header"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any[] | null>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    setFileError(null)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile)
        setResult(null)
        setFileError(null)
      } else {
        setFile(null)
        setFileError("กรุณาอัปโหลดเฉพาะไฟล์ .xlsx เท่านั้น")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile)
        setResult(null)
        setFileError(null)
      } else {
        setFile(null)
        setFileError("กรุณาอัปโหลดเฉพาะไฟล์ .xlsx เท่านั้น")
      }
    }
  }

  const handlePreview = async () => {
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await previewExcelAction(formData)

      if (res.error) {
        setResult({ success: false, message: res.error })
        toast.error(res.error)
      } else if (res.success && res.data) {
        setPreviewData(res.data)
      }
    } catch (err) {
      console.error(err)
      setResult({ success: false, message: "เกิดข้อผิดพลาดในการอ่านไฟล์" })
      toast.error("เกิดข้อผิดพลาดในการอ่านไฟล์")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelPreview = () => {
    setPreviewData(null)
    setFile(null)
    const fileInput = document.getElementById('excel-file') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleConfirmImport = async () => {
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await importExcelAction(formData)

      if (res.error) {
        setResult({ success: false, message: res.error })
        toast.error(res.error)
      } else {
        setResult({ success: true, message: "นำเข้าข้อมูลสำเร็จ", count: res.count })
        toast.success(`นำเข้าข้อมูลสำเร็จจำนวน ${res.count} รายการ`)
        setPreviewData(null)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('excel-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      }
    } catch (err) {
      console.error(err)
      setResult({ success: false, message: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์" })
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AppHeader
        crumbs={[
          { label: "ระบบรายงานค่าสาธารณูปโภค", href: "/dashboard" },
          { label: "นำเข้าข้อมูล" },
        ]}
      />
      <div className="flex flex-col gap-8 max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-3 bg-primary/10 rounded-full mb-2 ring-8 ring-primary/5">
          <FileUp className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          นำเข้าข้อมูลจาก Excel
        </h1>
        <p className="text-muted-foreground text-lg max-w-[500px]">
          อัปโหลดไฟล์ .xlsx เพื่อนำเข้าข้อมูลเข้าสู่ระบบอย่างรวดเร็ว
        </p>
      </div>

      <Card className="border-0 shadow-xl shadow-primary/5 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
        <CardHeader className="bg-muted/30 pb-8">
          <CardTitle className="text-xl flex items-center gap-2">
            อัปโหลดไฟล์
          </CardTitle>
          <CardDescription className="text-base">
            กรุณาเตรียมข้อมูลให้ตรงตามโครงสร้างตัวอย่างด้านล่าง
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 -mt-4 relative z-10 bg-card rounded-t-3xl pt-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-5 rounded-2xl border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md hover:border-blue-500/30">
            <div className="text-sm flex-1">
              <p className="font-bold text-blue-900 dark:text-blue-400 text-base">ดาวน์โหลดไฟล์ตัวอย่าง</p>
              <p className="text-blue-700/80 dark:text-blue-300/80 mt-1">ไฟล์ตัวอย่างประกอบไปด้วยโครงสร้างคอลัมน์ที่ระบบรองรับ</p>
            </div>
            <Button variant="secondary" className="w-full sm:w-auto bg-white/80 hover:bg-white text-blue-700 shadow-sm transition-all" asChild>
              <a href="/sheet/เบิกจ่ายค่าสาธาฯ.xlsx" download>
                <Download className="w-4 h-4 mr-2" />
                ดาวน์โหลด
              </a>
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">อัปโหลดไฟล์ข้อมูล</Label>
            <div
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden group
                ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('excel-file')?.click()}
            >
              {isDragging && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-2xl pointer-events-none"></div>
              )}

              <div className={`p-4 rounded-full shadow-sm mb-4 transition-all duration-500 ${isDragging ? 'bg-primary text-primary-foreground scale-110' : 'bg-background text-primary group-hover:scale-110'}`}>
                <FileUp className="w-8 h-8" />
              </div>

              <p className="text-lg font-bold mb-1 text-foreground">
                {isDragging ? 'วางไฟล์ที่นี่เลย!' : 'คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่'}
              </p>
              <p className="text-sm text-muted-foreground">รองรับเฉพาะไฟล์ .xlsx</p>

              {fileError && (
                <div className="mt-4 py-2 px-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium flex items-center gap-2 animate-in zoom-in-95 duration-300">
                  <AlertCircle className="w-4 h-4" />
                  {fileError}
                </div>
              )}

              {file && (
                <div className="mt-6 py-3 px-5 bg-background border border-primary/20 rounded-xl flex items-center gap-3 max-w-full shadow-sm animate-in zoom-in duration-300">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileUp className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium truncate flex-1 text-left">{file.name}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              )}

              <Input
                id="excel-file"
                type="file"
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={handlePreview}
                disabled={!file || loading}
                className="w-full sm:w-auto h-12 px-8 rounded-xl text-base font-medium shadow-lg hover:shadow-primary/25 transition-all"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <FileUp className="w-5 h-5 mr-2" />
                )}
                ดูตัวอย่างข้อมูล
              </Button>
            </div>
          </div>

          <Dialog open={!!previewData} onOpenChange={(open) => !open && handleCancelPreview()}>
            <DialogContent className="max-w-[95vw] w-full lg:max-w-7xl">
              <DialogHeader>
                <DialogTitle>ตัวอย่างข้อมูลที่จะนำเข้า ({previewData?.length} รายการ)</DialogTitle>
                <DialogDescription>กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนกดยืนยันการนำเข้า</DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto max-h-[50vh] border rounded-md">
                <Table>
                  <TableHeader className="bg-muted sticky top-0 z-10 shadow-sm">
                    <TableRow>
                      <TableHead>ศูนย์ต้นทุน</TableHead>
                      <TableHead>วันที่เอกสาร</TableHead>
                      <TableHead>เลขที่เอกสาร</TableHead>
                      <TableHead>ประเภทเอกสาร</TableHead>
                      <TableHead>รหัสแยกประเภท</TableHead>
                      <TableHead>รหัสงบประมาณ</TableHead>
                      <TableHead className="text-right">จำนวนเงิน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData?.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{row.costCenter || "-"}</TableCell>
                        <TableCell className="text-sm">{row.docDateStr || "-"}</TableCell>
                        <TableCell className="text-sm">{row.docNo || "-"}</TableCell>
                        <TableCell className="text-sm">{row.docType || "-"}</TableCell>
                        <TableCell className="text-sm">{row.glCode || "-"}</TableCell>
                        <TableCell className="text-sm">{row.budgetCode || "-"}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatTHB(row.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                <Button
                  onClick={handleCancelPreview}
                  variant="outline"
                  disabled={loading}
                  className="h-10 px-6 rounded-xl"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={loading}
                  className="h-10 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  ยืนยันการนำเข้า
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {result && (
            <div className={`p-5 rounded-2xl border flex items-start gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300 shadow-sm
              ${result.success ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30 text-green-800 dark:text-green-300' : 'bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-500/30 text-red-800 dark:text-red-300'}`}
            >
              <div className={`p-2 rounded-full ${result.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {result.success ? (
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 shrink-0" />
                )}
              </div>
              <div className="flex-1 mt-0.5">
                <p className="font-bold text-base">{result.message}</p>
                {result.success && result.count !== undefined && (
                  <p className="text-sm opacity-90 mt-1">อัปเดตข้อมูลสำเร็จจำนวน {result.count} รายการในฐานข้อมูล</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  )
}
