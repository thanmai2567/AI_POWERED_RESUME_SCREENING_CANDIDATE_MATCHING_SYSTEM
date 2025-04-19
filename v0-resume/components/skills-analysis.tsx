"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, TrendingUp } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { useState, useEffect } from "react"

interface SkillsAnalysisProps {
  resumeData: any
}

interface SkillsAnalysis {
  skills: {
    strong: string[];
    improve: string[];
  };
  careerPath: string[];
  suggestions: string[];
}

export function SkillsAnalysis({ resumeData }: SkillsAnalysisProps) {
  const [analysis, setAnalysis] = useState<SkillsAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const data = await apiService.getSkillsAnalysis()
        setAnalysis(data)
      } catch (error) {
        console.error("Error fetching skills analysis:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [resumeData])

  if (loading) {
    return <div>Loading skills analysis...</div>
  }

  if (!analysis) {
    return <div>No skills analysis available</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Skills Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="font-medium">Strong Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.strong.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-3">
                <XCircle className="h-5 w-5 text-amber-500 mr-2" />
                <h4 className="font-medium">Areas to Improve</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.improve.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Career Path Suggestions</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-3">
              <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
              <h4 className="font-medium">Potential Career Paths</h4>
            </div>
            <div className="space-y-2">
              {analysis.careerPath.map((path: string, index: number) => (
                <div key={path} className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm mr-2">
                    {index + 1}
                  </span>
                  <span>{path}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Improvement Suggestions</h3>
        <ul className="space-y-2 list-disc pl-5">
          {analysis.suggestions.map((suggestion: string) => (
            <li key={suggestion} className="text-gray-700">
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
