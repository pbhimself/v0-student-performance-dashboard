"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, GraduationCap, Users } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [teacherForm, setTeacherForm] = useState({ username: "", password: "" })
  const [parentForm, setParentForm] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (teacherForm.username && teacherForm.password) {
      localStorage.setItem("userType", "teacher")
      localStorage.setItem("username", teacherForm.username)
      router.push("/")
    }

    setIsLoading(false)
  }

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (parentForm.username && parentForm.password) {
      localStorage.setItem("userType", "parent")
      localStorage.setItem("username", parentForm.username)
      router.push("/")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="content-panel w-full max-w-md">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Image src="/images/logo.jpg" alt="MarketsheetHub Logo" width={40} height={40} />
              <h1 className="text-2xl font-bold text-primary">MarketsheetHub</h1>
            </div>
            <CardDescription className="text-base">Welcome back! Please sign in to your account.</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="teacher" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Teacher
                </TabsTrigger>
                <TabsTrigger value="parent" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Parent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="teacher">
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-username">Teacher Name</Label>
                    <Input
                      id="teacher-username"
                      type="text"
                      placeholder="Enter your teacher name"
                      value={teacherForm.username}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacher-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="teacher-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={teacherForm.password}
                        onChange={(e) => setTeacherForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in as Teacher"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="parent">
                <form onSubmit={handleParentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent-username">Parent Name</Label>
                    <Input
                      id="parent-username"
                      type="text"
                      placeholder="Enter your parent name"
                      value={parentForm.username}
                      onChange={(e) => setParentForm((prev) => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="parent-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={parentForm.password}
                        onChange={(e) => setParentForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in as Parent"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button variant="link" className="text-sm text-muted-foreground">
                Forgot your password?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
