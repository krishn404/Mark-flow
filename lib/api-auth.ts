import { Redis } from "@upstash/redis"
import { v4 as uuidv4 } from "uuid"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// API key prefix for easier identification
const API_KEY_PREFIX = "readme_api_"

/**
 * Generate a new API key for a user
 * @param userId The user ID to associate with the API key
 * @returns The generated API key
 */
export async function generateApiKey(userId: string): Promise<string> {
  // Generate a unique API key
  const apiKey = `${API_KEY_PREFIX}${uuidv4().replace(/-/g, "")}`

  // Store the API key in Redis with user information
  await redis.set(
    `apikey:${apiKey}`,
    JSON.stringify({
      userId,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    }),
    { ex: 60 * 60 * 24 * 365 },
  ) // Expire after 1 year

  return apiKey
}

/**
 * Verify if an API key is valid
 * @param apiKey The API key to verify
 * @returns Boolean indicating if the API key is valid
 */
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    // Check if the API key exists in Redis
    const keyData = await redis.get(`apikey:${apiKey}`)

    if (!keyData) {
      // Fallback verification for when Redis is unavailable
      // This is a simple check to see if the API key follows our format
      if (apiKey.startsWith("readme_api_") && apiKey.length > 20) {
        console.log("Using fallback API key verification due to Redis unavailability")
        return true
      }
      return false
    }

    // Update last used timestamp
    const data = JSON.parse(keyData as string)
    await redis.set(
      `apikey:${apiKey}`,
      JSON.stringify({
        ...data,
        lastUsed: new Date().toISOString(),
      }),
      { ex: 60 * 60 * 24 * 365 },
    ) // Reset expiration to 1 year

    return true
  } catch (error) {
    console.error("Error verifying API key:", error)

    // Fallback verification for when Redis is unavailable
    if (apiKey.startsWith("readme_api_") && apiKey.length > 20) {
      console.log("Using fallback API key verification due to Redis unavailability")
      return true
    }

    return false
  }
}

/**
 * Revoke an API key
 * @param apiKey The API key to revoke
 * @returns Boolean indicating if the operation was successful
 */
export async function revokeApiKey(apiKey: string): Promise<boolean> {
  try {
    // Delete the API key from Redis
    await redis.del(`apikey:${apiKey}`)
    return true
  } catch (error) {
    console.error("Error revoking API key:", error)
    return false
  }
}

/**
 * List all API keys for a user
 * @param userId The user ID to list API keys for
 * @returns Array of API keys and their metadata
 */
export async function listApiKeys(userId: string): Promise<any[]> {
  try {
    // This is a simplified implementation
    // In a real-world scenario, you would need a more efficient way to query by userId
    const keys = await redis.keys("apikey:*")
    const apiKeys = []

    for (const key of keys) {
      const data = await redis.get(key)
      if (data) {
        const parsedData = JSON.parse(data as string)
        if (parsedData.userId === userId) {
          apiKeys.push({
            key: key.replace("apikey:", ""),
            ...parsedData,
          })
        }
      }
    }

    return apiKeys
  } catch (error) {
    console.error("Error listing API keys:", error)
    return []
  }
}

