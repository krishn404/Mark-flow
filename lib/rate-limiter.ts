import type { NextRequest } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis client with error handling
let redis: Redis | null = null

try {
  // Only initialize Redis if environment variables are available
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch (error) {
  console.error("Failed to initialize Redis client:", error)
  // Continue without Redis - rate limiting will be disabled
}

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 10 // Number of requests
const RATE_LIMIT_WINDOW = 60 * 60 // Time window in seconds (1 hour)

// Higher limits for authenticated API requests
const API_RATE_LIMIT_REQUESTS = 100 // Number of requests for API users
const API_RATE_LIMIT_WINDOW = 60 * 60 // Time window in seconds (1 hour)

export async function rateLimiter(request: NextRequest) {
  // Skip rate limiting if Redis is not available
  if (!redis) {
    console.warn("Rate limiting is disabled: Redis client not available")
    return null
  }

  // Check if this is an API request
  const isApiRequest = request.nextUrl.pathname.startsWith("/api/v1/")
  const authHeader = request.headers.get("Authorization")

  // For API requests, use the API key as the identifier
  // For regular requests, use IP
  const identifier = isApiRequest && authHeader ? authHeader.replace("Bearer ", "") : request.ip || "anonymous"

  const key = `rate-limit:${identifier}`

  try {
    // Get current count for this identifier
    const currentCount = ((await redis.get(key)) as number) || 0

    // Determine which limits to apply
    const maxRequests = isApiRequest && authHeader ? API_RATE_LIMIT_REQUESTS : RATE_LIMIT_REQUESTS
    const windowSize = isApiRequest && authHeader ? API_RATE_LIMIT_WINDOW : RATE_LIMIT_WINDOW

    // If first request, set expiry
    if (currentCount === 0) {
      await redis.set(key, 1, { ex: windowSize })
    } else {
      // Increment count
      await redis.incr(key)
    }

    // Add rate limit headers
    const remainingRequests = Math.max(0, maxRequests - (currentCount + 1))
    const resetTime = await redis.ttl(key)

    // Check if over limit
    if (currentCount >= maxRequests) {
      const response = {
        error: "Rate limit exceeded. Please try again later.",
        limit: maxRequests,
        remaining: 0,
        reset: resetTime,
      }

      const headers = new Headers({
        "Content-Type": "application/json",
        "X-RateLimit-Limit": maxRequests.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": resetTime.toString(),
      })

      return new Response(JSON.stringify(response), {
        status: 429,
        headers,
      })
    }

    // Add rate limit headers to the request for downstream handlers
    request.headers.set("X-RateLimit-Limit", maxRequests.toString())
    request.headers.set("X-RateLimit-Remaining", remainingRequests.toString())
    request.headers.set("X-RateLimit-Reset", resetTime.toString())
  } catch (error) {
    console.error("Rate limiting error:", error)
    // If rate limiting fails, we'll still allow the request to proceed
  }

  return null // No rate limiting issues
}

