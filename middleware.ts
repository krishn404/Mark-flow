import { type NextRequest, NextResponse } from "next/server"
import { rateLimiter } from "./lib/rate-limiter"

export async function middleware(request: NextRequest) {
  try {
    // Only apply rate limiting to the API routes
    if (request.nextUrl.pathname.startsWith("/api/")) {
      const rateLimitResponse = await rateLimiter(request)

      if (rateLimitResponse) {
        return rateLimitResponse
      }

      const response = NextResponse.next()
      response.headers.set("Access-Control-Allow-Origin", "*")
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

      return response
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // If middleware fails, allow the request to proceed
    return NextResponse.next()
  }
}

export const config = {
  matcher: "/api/:path*",
}

