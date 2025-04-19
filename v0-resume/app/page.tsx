import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-purple-50 to-purple-100">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-purple-900 sm:text-[5rem]">
          Resume<span className="text-purple-600">Match</span>
        </h1>
        <p className="text-xl text-center text-gray-600 max-w-2xl">
          AI-powered resume matching system that connects students with the right opportunities
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-100">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
