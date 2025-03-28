import { NextResponse, type NextRequest } from "next/server"
import { Octokit } from "@octokit/rest"
import { analyzeRepository } from "@/lib/repo-analyzer"
import { generateReadmeWithGemini } from "@/lib/gemini-client"

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid request body" 
      }, { status: 400 })
    }

    const { repoUrl, apiKey } = body

    if (!repoUrl) {
      return NextResponse.json({ 
        success: false,
        error: "Repository URL is required" 
      }, { status: 400 })
    }

    // Initialize Octokit with API key if provided
    const octokit = apiKey ? new Octokit({ auth: apiKey }) : new Octokit()

    // Parse GitHub URL to extract owner and repo
    const urlPattern = /github\.com\/([^/]+)\/([^/]+)/
    const match = repoUrl.match(urlPattern)

    if (!match) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid GitHub repository URL" 
      }, { status: 400 })
    }

    const [, owner, repo] = match

    try {
      // Analyze the repository in depth
      const repoData = await analyzeRepository(octokit, owner, repo)

      // Generate README using Gemini AI
      const readme = await generateReadmeWithGemini(repoData)

      return NextResponse.json({ 
        success: true,
        readme 
      })
    } catch (error: any) {
      console.error("Repository analysis error:", error)
      
      if (error.status === 404) {
        return NextResponse.json({ 
          success: false,
          error: "Repository not found. Please check the URL." 
        }, { status: 404 })
      }
      
      if (error.status === 403) {
        return NextResponse.json({ 
          success: false,
          error: "GitHub API access error. Try adding your GitHub token for better access."
        }, { status: 403 })
      }

      return NextResponse.json({ 
        success: false,
        error: "Failed to analyze repository. Please try again." 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ 
      success: false,
      error: "An unexpected error occurred. Please try again." 
    }, { status: 500 })
  }
}

