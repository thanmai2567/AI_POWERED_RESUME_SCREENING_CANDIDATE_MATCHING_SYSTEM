"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Upload, FileText, Award, LogOut } from "lucide-react"
import { ResumeUploader } from "@/components/resume-uploader"
import { SkillsAnalysis } from "@/components/skills-analysis"
import { apiService } from "@/lib/api-service"

export default function StudentDashboard() {
  const router = useRouter()
  const [resumeData, setResumeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("userType")

    if (!token || userType !== "student") {
      router.push("/login")
      return
    }

    // Fetch resume data if exists
    async function fetchResumeData() {
      try {
        const data = await apiService.getUserResume()
        if (data) {
          setResumeData(data)
        }
      } catch (error) {
        console.error("Error fetching resume data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResumeData()
  }, [router])

  const handleResumeUploaded = (data: any) => {
    setResumeData(data)
    toast({
      title: "Resume uploaded successfully",
      description: "Your resume has been analyzed and stored",
    })
  }

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
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="upload">Resume Upload</TabsTrigger>
          <TabsTrigger value="analysis">Skills Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>Upload your resume to get AI-powered analysis and job matching</CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeUploader onResumeUploaded={handleResumeUploaded} />

              {resumeData && (
                <div className="mt-6 p-4 border rounded-lg bg-purple-50">
                  <h3 className="font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Current Resume Information
                  </h3>
                  <div className="mt-3 space-y-2">
                    <p>
                      <strong>Name:</strong> {resumeData.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {resumeData.email}
                    </p>
                    <p>
                      <strong>Suggested Role:</strong> {resumeData.suggestedRole}
                    </p>
                    <p>
                      <strong>College Code:</strong> {resumeData.collegeCode}
                    </p>
                    <p>
                      <strong>Uploaded:</strong> {new Date(resumeData.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Skills Analysis</CardTitle>
              <CardDescription>AI-powered analysis of your skills and career path suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              {resumeData ? (
                <SkillsAnalysis resumeData={resumeData} />
              ) : (
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No resume found</h3>
                  <p className="mt-1 text-sm text-gray-500">Upload your resume first to see skills analysis</p>
                  <div className="mt-6">
                    <Button 
                      onClick={() => {
                        const uploadTab = document.querySelector('[data-value="upload"]') as HTMLElement;
                        if (uploadTab) {
                          uploadTab.click();
                        }
                      }} 
                      variant="outline"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Resume
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
