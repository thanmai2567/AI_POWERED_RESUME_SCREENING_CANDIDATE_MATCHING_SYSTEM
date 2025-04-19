"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Clock, ChevronDown, ChevronUp, Users, Download } from "lucide-react"
import { apiService } from "@/lib/api-service"

export function MatchHistory() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const userId = localStorage.getItem("userId")
        if (userId) {
          const data = await apiService.getMatchHistory(userId)
          setHistory(data)
        }
      } catch (error) {
        console.error("Error fetching history:", error)
        toast({
          variant: "destructive",
          title: "Failed to fetch history",
          description: "Could not retrieve match history",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleDownload = async (resumeId: string) => {
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
    }
  }

  if (loading) {
    return <p>Loading history...</p>
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No match history</h3>
        <p className="mt-1 text-sm text-gray-500">Your previous job matching searches will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Card key={item._id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(item._id)}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</span>
                  </div>
                  <h3 className="font-medium mt-1">
                    {item.jobDescription.substring(0, 100)}
                    {item.jobDescription.length > 100 ? "..." : ""}
                  </h3>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <Users className="h-4 w-4 mr-1 text-purple-600" />
                    <span>{item.matches.length} matches</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {expandedId === item._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {expandedId === item._id && (
              <div className="p-4 border-t">
                <h4 className="font-medium mb-2">Job Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{item.jobDescription}</p>

                <h4 className="font-medium mb-2">Top Matches</h4>
                <div className="space-y-2">
                  {item.matches.map((match: any, index: number) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                      <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-bold mr-2">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{match.name}</div>
                        <div className="text-sm text-gray-500">{match.email}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">Match Score</div>
                          <div className="font-bold text-purple-700">{match.score}%</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(match.id)
                          }}
                          className="h-8"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
