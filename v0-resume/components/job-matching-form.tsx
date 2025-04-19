"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Loader2, User, Mail, Briefcase, Download, BarChart } from "lucide-react"
import { apiService } from "@/lib/api-service"

export function JobMatchingForm() {
  const [jobDescription, setJobDescription] = useState("")
  const [topN, setTopN] = useState("5")
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a job description",
      })
      return
    }

    setLoading(true)
    try {
      const collegeCode = localStorage.getItem("collegeCode")
      if (!collegeCode) {
        throw new Error("College code not found")
      }
      const data = await apiService.matchResumes(jobDescription, collegeCode, parseInt(topN))
      setMatches(data)
      toast({
        title: "Matches found",
        description: `Found ${data.length} matching resumes`,
      })
    } catch (error) {
      console.error("Error matching job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to find matching resumes",
      })
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            placeholder="Enter the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="topN">Number of Top Matches</Label>
          <Input
            id="topN"
            type="number"
            min="1"
            max="20"
            value={topN}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              if (value >= 1 && value <= 20) {
                setTopN(e.target.value)
              }
            }}
            className="w-24"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !jobDescription.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Matching...
            </>
          ) : (
            "Find Matching Resumes"
          )}
        </Button>
      </form>

      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Matching Results</h3>

          <div className="grid grid-cols-1 gap-4">
            {matches.map((match, index) => (
              <Card key={match.resume._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-purple-50 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg flex items-center">
                            <User className="h-4 w-4 mr-1 text-purple-600" />
                            {match.resume.name}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="h-4 w-4 mr-1" />
                            {match.resume.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-3 text-right">
                          <div className="text-sm font-medium">Match Score</div>
                          <div className="text-lg font-bold text-purple-700">{match.score}%</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(match.resume._id)}
                          className="h-8"
                          disabled={downloading === match.resume._id}
                        >
                          <Download className={`h-4 w-4 mr-1 ${downloading === match.resume._id ? 'animate-spin' : ''}`} />
                          {downloading === match.resume._id ? 'Downloading...' : 'PDF'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <Briefcase className="h-4 w-4 mr-1 text-purple-600" />
                      <span className="font-medium">Suggested Role:</span>
                      <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-200">
                        {match.resume.suggestedRole}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <BarChart className="h-4 w-4 mr-1 text-purple-600" />
                        Match Highlights
                      </h4>
                      <ul className="text-sm space-y-1 list-disc pl-5">
                        {match.highlights.map((highlight: string, i: number) => (
                          <li key={i}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
