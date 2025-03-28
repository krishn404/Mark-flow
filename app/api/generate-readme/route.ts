import { type NextRequest, NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import { analyzeRepository } from "@/lib/repo-analyzer"
import { generateReadmeWithGemini } from "@/lib/gemini-client"

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, apiKey } = await request.json()

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable." },
        { status: 500 }
      )
    }

    // Initialize Octokit with API key if provided
    const octokit = apiKey ? new Octokit({ auth: apiKey }) : new Octokit()

    // Parse GitHub URL to extract owner and repo
    const urlPattern = /github\.com\/([^/]+)\/([^/]+)/
    const match = repoUrl.match(urlPattern)

    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 })
    }

    const [, owner, repo] = match

    try {
      // Analyze the repository in depth
      const repoData = await analyzeRepository(octokit, owner, repo)

      // Generate README using Gemini AI
      const readme = await generateReadmeWithGemini(repoData)

      return NextResponse.json({ readme })
    } catch (error: any) {
      // Handle GitHub API errors specifically
      if (error.status === 404) {
        return NextResponse.json(
          { error: "Repository not found. Check the URL or provide an API key for private repositories." },
          { status: 404 },
        )
      } else if (error.status === 403 && error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please provide a GitHub API key." },
          { status: 403 },
        )
      } else if (error.status === 401) {
        return NextResponse.json({ error: "Invalid GitHub API key or insufficient permissions." }, { status: 401 })
      }

      throw error // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Error generating README:", error)
    
    // Ensure we always return a proper JSON response
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate README. Please try again later." 
    }, { 
      status: 500 
    })
  }
}

