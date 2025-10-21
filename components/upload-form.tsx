"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Upload, CheckCircle2, CalendarIcon, BookOpen, Target, Trophy, FileSpreadsheet } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { parseExcelFile } from "@/lib/parse-excel"
import { saveUpload } from "@/lib/storage"

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Marathi",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Physical Education",
  "Art",
  "Music",
]

export default function UploadForm() {
  const [examName, setExamName] = useState("")
  const [subject, setSubject] = useState("")
  const [totalMarks, setTotalMarks] = useState("0")
  const [passingMarks, setPassingMarks] = useState("0")
  const [examDate, setExamDate] = useState<Date>()
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [parsing, setParsing] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const isFormValid = examName.trim() !== "" && subject !== "" && examDate !== undefined && file !== null

  const canSubmit = isFormValid && !parsing && !done

  console.log("[v0] Form validation state:", {
    examName: examName.trim() !== "",
    subject: subject !== "",
    totalMarks: totalMarks !== "",
    passingMarks: passingMarks !== "",
    examDate: examDate !== undefined,
    file: file !== null,
    isFormValid,
    canSubmit,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors([])

    const total = Number.parseInt(totalMarks) || 0
    const passing = Number.parseInt(passingMarks) || 0

    if (total > 0 && passing > 0 && passing > total) {
      setErrors(["Passing marks cannot be greater than total marks"])
      return
    }

    if (!file || !examDate) return

    try {
      setParsing(true)
      const payload = await parseExcelFile(file, {
        examName,
        subject,
        totalMarks: total,
        passingMarks: passing,
        examDate: examDate.toISOString(),
        fileName: file.name,
      })
      saveUpload(payload)
      setDone(true)
      router.push(`/dashboard?uploadId=${payload.meta.id}`)
    } catch (err: any) {
      setErrors([err?.message || "Failed to parse file"])
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Upload Class Performance</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Transform your exam data into actionable insights with our advanced analytics platform
        </p>
      </div>

      <Card className="content-panel border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl text-pretty flex items-center justify-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            Exam Details & Data Upload
          </CardTitle>
          <CardDescription className="text-base">
            Enter your exam information and upload the Excel file containing student performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Exam Name */}
              <div className="space-y-3">
                <Label htmlFor="examName" className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Exam Name
                </Label>
                <Input
                  id="examName"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g., Mid-Term Examination 2024"
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* Subject and Marks Row */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <Label htmlFor="subject" className="text-base font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-secondary" />
                    Subject
                  </Label>
                  <Select value={subject} onValueChange={setSubject} required>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((subj) => (
                        <SelectItem key={subj} value={subj} className="text-base">
                          {subj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="totalMarks" className="text-base font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Total Marks <span className="text-xs text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="passingMarks" className="text-base font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-secondary" />
                    Passing Marks <span className="text-xs text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
                    placeholder="0"
                    min="0"
                    max={totalMarks || undefined}
                    className="h-12 text-base"
                  />
                </div>
              </div>

              {/* Exam Date */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Exam Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal text-base",
                        !examDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      {examDate ? format(examDate, "PPP") : <span>Select exam date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      onSelect={setExamDate}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator className="my-8" />

            {/* File Upload Section */}
            <div className="space-y-4">
              <Label htmlFor="file" className="text-base font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                Excel File Upload
              </Label>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <Input
                      id="file"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                      required
                    />
                    <Label
                      htmlFor="file"
                      className="cursor-pointer text-primary hover:text-primary/80 font-semibold text-base"
                    >
                      {file ? file.name : "Click to select Excel file"}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">Supports .xlsx and .xls formats</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>File Format Tips:</strong> Include a "Name" column for student names, and columns for
                  individual subjects or marks. Optionally add a "Previous" sheet to enable progress comparisons.
                </p>
              </div>
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Upload Error</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Display */}
            {done && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Upload Successful!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your exam data has been processed. Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full h-14 text-lg font-semibold gap-3 transition-all duration-200",
                  canSubmit
                    ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                <Upload className="h-5 w-5" />
                {parsing ? "Processing Data..." : "Upload & Analyze Performance"}
              </Button>

              {!isFormValid && (
                <p className="text-sm text-muted-foreground text-center">
                  Please fill exam name, subject, select exam date, and upload an Excel file to continue
                </p>
              )}

              <p className="text-xs text-muted-foreground text-center max-w-md">
                Your data is processed securely and never leaves your browser unless you explicitly use AI summary
                features.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
