import { type NextRequest, NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import { analyzeRepository } from "@/lib/repo-analyzer"
import { generateReadmeWithGemini } from "@/lib/gemini-client"
import { verifyApiKey } from "@/lib/api-auth"

// Simple in-memory rate limiting as fallback
const inMemoryRateLimits = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 10

function checkInMemoryRateLimit(ip: string): boolean {
  const now = Date.now()
  const rateLimit = inMemoryRateLimits.get(ip)

  if (!rateLimit || rateLimit.resetTime < now) {
    // First request or window expired, create new rate limit
    inMemoryRateLimits.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    })
    return false // Not rate limited
  }

  if (rateLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return true // Rate limited
  }

  // Increment count
  rateLimit.count++
  return false // Not rate limited
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key in the Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid API key. Please provide a valid API key in the Authorization header." },
        { status: 401 },
      )
    }

    const apiKey = authHeader.substring(7) // Remove "Bearer " prefix

    // Use verifyApiKey function to validate the API key
    const isValidApiKey = await verifyApiKey(apiKey)

    if (!isValidApiKey) {
      return NextResponse.json({ error: "Invalid API key. Please provide a valid API key." }, { status: 401 })
    }

    // Apply simple in-memory rate limiting as fallback
    const ip = request.ip || "unknown"
    if (checkInMemoryRateLimit(ip)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          limit: MAX_REQUESTS_PER_WINDOW,
          remaining: 0,
          reset: Math.ceil((inMemoryRateLimits.get(ip)?.resetTime || 0) - Date.now()) / 1000,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil((inMemoryRateLimits.get(ip)?.resetTime || 0) - Date.now()) / 1000 + "",
          },
        },
      )
    }

    // Parse request body
    const { repoUrl, githubToken } = await request.json()

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable." },
        { status: 500 },
      )
    }

    // Initialize Octokit with GitHub token if provided
    const octokit = githubToken ? new Octokit({ auth: githubToken }) : new Octokit()

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

      return NextResponse.json({
        success: true,
        readme,
        metadata: {
          repository: {
            name: repoData.repoInfo.name,
            owner: owner,
            stars: repoData.repoInfo.stargazers_count,
            language: Object.keys(repoData.languages)[0] || "Unknown",
            created_at: repoData.repoInfo.created_at,
            updated_at: repoData.repoInfo.updated_at,
          },
        },
      })
    } catch (error: any) {
      // Handle GitHub API errors specifically
      if (error.status === 404) {
        return NextResponse.json(
          { error: "Repository not found. Check the URL or provide a GitHub token for private repositories." },
          { status: 404 },
        )
      } else if (error.status === 403 && error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please provide a GitHub token." },
          { status: 403 },
        )
      } else if (error.status === 401) {
        return NextResponse.json({ error: "Invalid GitHub token or insufficient permissions." }, { status: 401 })
      }

      throw error // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Error generating README:", error)

    return NextResponse.json({ error: "Failed to generate README. Please try again later." }, { status: 500 })
  }
}

