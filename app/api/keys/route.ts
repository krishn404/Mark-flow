import { type NextRequest, NextResponse } from "next/server"
import { generateApiKey, listApiKeys, revokeApiKey } from "@/lib/api-auth"

const DEMO_USER_ID = "demo-user"

export async function GET(request: NextRequest) {
  try {
    const userId = DEMO_USER_ID

    // List all API keys for the user
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

export async function POST(request: NextRequest) {
  try {
    // In a real application, you would get the user ID from the session
    const userId = DEMO_USER_ID

    // Generate a new API key
    const apiKey = await generateApiKey(userId)

    return NextResponse.json({
      success: true,
      apiKey,
    })
  } catch (error) {
    console.error("Error generating API key:", error)
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
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

export async function PUT(request: NextRequest) {
  try {
    const { geminiApiKey } = await request.json()

    if (!geminiApiKey) {
      return NextResponse.json({ error: "Gemini API key is required" }, { status: 400 })
    }

    // In a real application, you would store this securely
    // For this demo, we'll just return success
    // You could store it in Redis with the user ID as well

    return NextResponse.json({
      success: true,
      message: "Gemini API key saved successfully",
    })
  } catch (error) {
    console.error("Error saving Gemini API key:", error)
    return NextResponse.json({ error: "Failed to save Gemini API key" }, { status: 500 })
  }
}

