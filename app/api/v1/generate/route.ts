import { type NextRequest, NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import { verifyApiKey } from "@/lib/api-auth"

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
    const isValidApiKey = await verifyApiKey(apiKey)

    if (!isValidApiKey) {
      return NextResponse.json({ error: "Invalid API key. Please provide a valid API key." }, { status: 401 })
    }

    // Parse request body
    const { repoUrl, githubToken } = await request.json()

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
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
      // Fetch repository information
      const repoInfo = await octokit.repos.get({
        owner,
        repo,
      })

      // Fetch repository contents (root directory)
      const contents = await octokit.repos.getContent({
        owner,
        repo,
        path: "",
      })

      // Fetch languages used in the repository
      const languages = await octokit.repos.listLanguages({
        owner,
        repo,
      })

      // Fetch contributors
      const contributors = await octokit.repos.listContributors({
        owner,
        repo,
        per_page: 10,
      })

      // Try to fetch README if it exists
      let existingReadme = null
      try {
        const readmeResponse = await octokit.repos.getReadme({
          owner,
          repo,
        })

        const readmeContent = Buffer.from(readmeResponse.data.content, "base64").toString()
        existingReadme = readmeContent
      } catch (error) {
        // README doesn't exist or couldn't be fetched, that's okay
      }

      // Try to fetch package.json if it exists (for Node.js projects)
      let packageJson = null
      try {
        const packageJsonResponse = await octokit.repos.getContent({
          owner,
          repo,
          path: "package.json",
        })

        if ("content" in packageJsonResponse.data) {
          const packageJsonContent = Buffer.from(packageJsonResponse.data.content, "base64").toString()
          packageJson = JSON.parse(packageJsonContent)
        }
      } catch (error) {
        // package.json doesn't exist or couldn't be fetched, that's okay
      }

      // Generate README content
      const readme = generateReadme({
        repoInfo: repoInfo.data,
        contents: Array.isArray(contents.data) ? contents.data : [contents.data],
        languages: languages.data,
        contributors: contributors.data,
        existingReadme,
        packageJson,
        owner,
        repo,
      })

      return NextResponse.json({
        success: true,
        readme,
        metadata: {
          repository: {
            name: repoInfo.data.name,
            owner: owner,
            stars: repoInfo.data.stargazers_count,
            language: Object.keys(languages.data)[0] || "Unknown",
            created_at: repoInfo.data.created_at,
            updated_at: repoInfo.data.updated_at,
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

// Import the generateReadme function and its helper functions from a shared module
import { generateReadme } from "@/lib/readme-generator"

