"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Upload, Loader2 } from "lucide-react"
import { apiService } from "@/lib/api-service"

interface ResumeUploaderProps {
  onResumeUploaded: (data: any) => void
}

export function ResumeUploader({ onResumeUploaded }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Check if file is PDF
      if (selectedFile.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF file",
        })
        return
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
        })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a PDF file to upload",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("resume", file)
      
      const data = await apiService.uploadResume(formData)
      onResumeUploaded(data)
      setFile(null)

      toast({
        title: "Upload successful",
        description: "Your resume has been processed successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Something went wrong while uploading your resume",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="resume">Resume (PDF)</Label>
        <Input id="resume" type="file" accept=".pdf" onChange={handleFileChange} disabled={uploading} />
      </div>

      {file && (
        <p className="text-sm text-gray-500">
          Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </p>
      )}

      <Button onClick={handleUpload} disabled={!file || uploading} className="bg-purple-600 hover:bg-purple-700">
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </>
        )}
      </Button>
    </div>
  )
}
