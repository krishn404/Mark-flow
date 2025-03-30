import { type NextRequest, NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import { analyzeRepository } from "@/lib/repo-analyzer"
import { generateReadmeWithGemini } from "@/lib/gemini-client"

export const maxDuration = 60 // Set maximum duration to 60 seconds (maximum allowed for hobby plan)
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, apiKey, customRequirements } = await request.json()

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
    }

    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 })
    }

    const [, owner, repo] = match

    // Initialize Octokit with API key if provided
    const octokit = new Octokit({
      auth: apiKey || process.env.GITHUB_ACCESS_TOKEN, // Fallback to environment variable
    })

    try {
      // Set a timeout for the entire operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), 55000) // 55 second timeout
      })

      // Race between the actual operation and the timeout
      const repoData = await Promise.race([
        analyzeRepository(octokit, owner, repo),
        timeoutPromise
      ])

      const readme = await generateReadmeWithGemini(repoData, customRequirements)

      return NextResponse.json({ readme })
    } catch (error: any) {
      if (error.message === 'Operation timed out') {
        return NextResponse.json(
          { error: "Request timed out. The repository might be too large or complex." },
          { status: 504 }
        )
      }

      if (error.status === 403) {
        return NextResponse.json(
          {
            error: "GitHub API rate limit exceeded. Please provide a GitHub API token in the settings.",
          },
          { status: 403 }
        )
      }

      // Handle other specific errors...
      if (error.status === 404) {
        return NextResponse.json(
          { error: "Repository not found. Check the URL or provide an API key for private repositories." },
          { status: 404 }
        )
      } else if (error.status === 401) {
        return NextResponse.json({ error: "Invalid GitHub API key or insufficient permissions." }, { status: 401 })
      }

      throw error
    }
  } catch (error) {
    console.error("Error generating README:", error)
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate README. Please try again later." 
    }, { 
      status: 500 
    })
  }
}

