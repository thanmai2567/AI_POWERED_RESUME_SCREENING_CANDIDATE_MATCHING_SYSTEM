"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Download, Search, User, Mail, Briefcase, Calendar } from "lucide-react"
import { apiService } from "@/lib/api-service"

interface ResumeListProps {
  collegeCode: string
}

export function ResumeList({ collegeCode }: ResumeListProps) {
  const [resumes, setResumes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResumes() {
      try {
        const data = await apiService.getResumesByCollegeCode(collegeCode)
        setResumes(data)
      } catch (error) {
        console.error("Error fetching resumes:", error)
        toast({
          variant: "destructive",
          title: "Failed to fetch resumes",
          description: "Could not retrieve resume data",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchResumes()
  }, [collegeCode])

  const handleDownload = async (resumeId: string) => {
    if (downloading === resumeId) return // Prevent multiple downloads
    
    setDownloading(resumeId)
    try {
      const blob = await apiService.downloadResume(resumeId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume-${resumeId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Download successful",
        description: "Resume has been downloaded",
      })
    } catch (error) {
      console.error("Error downloading resume:", error)
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Could not download the resume",
      })
    } finally {
      setDownloading(null)
    }
  }

  const filteredResumes = resumes.filter(
    (resume) =>
      resume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.suggestedRole.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <p>Loading resumes...</p>
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search by name, email, or role..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredResumes.length === 0 ? (
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No resumes found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Try a different search term" : "No resumes have been uploaded yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResumes.map((resume) => (
            <Card key={resume._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-purple-50 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg flex items-center">
                        <User className="h-4 w-4 mr-1 text-purple-600" />
                        {resume.name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Mail className="h-4 w-4 mr-1" />
                        {resume.email}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(resume._id)} 
                      className="h-8"
                      disabled={downloading === resume._id}
                    >
                      <Download className={`h-4 w-4 mr-1 ${downloading === resume._id ? 'animate-spin' : ''}`} />
                      {downloading === resume._id ? 'Downloading...' : 'PDF'}
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Briefcase className="h-4 w-4 mr-1 text-purple-600" />
                    <span className="font-medium">Suggested Role:</span>
                    <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-200">
                      {resume.suggestedRole}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Uploaded: {new Date(resume.uploadDate).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
