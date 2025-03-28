import { type NextRequest, NextResponse } from "next/server"
import { generateApiKey, listApiKeys, revokeApiKey } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  try {
    // Verify admin secret key
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid admin secret key. Please provide a valid admin secret key in the Authorization header.",
        },
        { status: 401 },
      )
    }

    const adminSecretKey = authHeader.substring(7) // Remove "Bearer " prefix

    // Verify against the environment variable
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Invalid admin secret key." }, { status: 401 })
    }

    try {
      // Generate a new API key
      // For simplicity, we'll use a fixed user ID in this example
      const userId = "api-user"
      const apiKey = await generateApiKey(userId)

      return NextResponse.json({
        success: true,
        apiKey,
      })
    } catch (redisError) {
      console.error("Redis error when generating API key:", redisError)

      // Fallback: Generate a simple API key without Redis
      // Note: This won't be stored in Redis, so verification will need a fallback too
      const fallbackApiKey = `readme_api_${crypto.randomUUID().replace(/-/g, "")}`

      return NextResponse.json({
        success: true,
        apiKey: fallbackApiKey,
        note: "Using fallback API key generation due to Redis unavailability",
      })
    }
  } catch (error) {
    console.error("Error generating API key:", error)
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin secret key
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid admin secret key. Please provide a valid admin secret key in the Authorization header.",
        },
        { status: 401 },
      )
    }

    const adminSecretKey = authHeader.substring(7) // Remove "Bearer " prefix

    // Verify against the environment variable
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Invalid admin secret key." }, { status: 401 })
    }

    // List all API keys
    const userId = "api-user"
    const apiKeys = await listApiKeys(userId)

    return NextResponse.json({
      success: true,
      apiKeys: apiKeys.map((key) => ({
        id: key.key,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
      })),
    })
  } catch (error) {
    console.error("Error listing API keys:", error)
    return NextResponse.json({ error: "Failed to list API keys" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin secret key
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid admin secret key. Please provide a valid admin secret key in the Authorization header.",
        },
        { status: 401 },
      )
    }

    const adminSecretKey = authHeader.substring(7) // Remove "Bearer " prefix

    // Verify against the environment variable
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Invalid admin secret key." }, { status: 401 })
    }

    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Revoke the API key
    const success = await revokeApiKey(apiKey)

    if (!success) {
      return NextResponse.json({ error: "Failed to revoke API key" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "API key revoked successfully",
    })
  } catch (error) {
    console.error("Error revoking API key:", error)
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 })
  }
}

