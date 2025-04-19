"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { LogOut } from "lucide-react"
import { ResumeList } from "@/components/resume-list"
import { JobMatchingForm } from "@/components/job-matching-form"
import { MatchHistory } from "@/components/match-history"

export default function CompanyDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [collegeCode, setCollegeCode] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("userType")
    const code = localStorage.getItem("collegeCode")

    if (!token || userType !== "company") {
      router.push("/login")
      return
    }

    if (code) {
      setCollegeCode(code)
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    localStorage.removeItem("collegeCode")
    localStorage.removeItem("userId")
    
    // Show logout success message
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    })
    
    // Redirect to home page
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Company Dashboard</h1>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="resumes">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="resumes">Browse Resumes</TabsTrigger>
          <TabsTrigger value="matching">Job Matching</TabsTrigger>
          <TabsTrigger value="history">Match History</TabsTrigger>
        </TabsList>

        <TabsContent value="resumes">
          <Card>
            <CardHeader>
              <CardTitle>Browse Resumes</CardTitle>
              <CardDescription>View all resumes from students with your college code</CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeList collegeCode={collegeCode} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching">
          <Card>
            <CardHeader>
              <CardTitle>Job Matching</CardTitle>
              <CardDescription>Find the best candidates for your job openings</CardDescription>
            </CardHeader>
            <CardContent>
              <JobMatchingForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Match History</CardTitle>
              <CardDescription>View your previous job matching searches</CardDescription>
            </CardHeader>
            <CardContent>
              <MatchHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
