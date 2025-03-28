"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Info, Key, Lock, AlertCircle } from 'lucide-react'
import { Label } from "@/components/ui/label"

export default function ApiDocsPage() {
  const [apiKey, setApiKey] = useState("")
  const [generatedApiKey, setGeneratedApiKey] = useState("")
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const generateApiKey = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate API key")
      }

      setGeneratedApiKey(data.apiKey)
      fetchApiKeys()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchApiKeys = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/keys")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch API keys")
      }

      setApiKeys(data.apiKeys || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const revokeApiKey = async (keyToRevoke: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/keys", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: keyToRevoke }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke API key")
      }

      fetchApiKeys()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block p-2 bg-primary/10 rounded-full mb-4">
            <Key className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            README Generator API
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Integrate our README generation capabilities into your own applications with our REST API.
          </p>
        </div>

        <div className="grid gap-8 mb-12">
          <Card className="border-2 border-muted shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">API Authentication</CardTitle>
              <CardDescription>Generate an API key to access the README Generator API.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <Button
                    onClick={generateApiKey}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Generate New API Key
                  </Button>

                  <Button onClick={fetchApiKeys} variant="outline" disabled={loading}>
                    View My API Keys
                  </Button>
                </div>

                {generatedApiKey && (
                  <Alert className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 border-green-200 dark:border-green-800">
                    <Info className="h-4 w-4" />
                    <AlertTitle>API Key Generated</AlertTitle>
                    <AlertDescription className="flex items-center gap-2">
                      <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded font-mono">
                        {generatedApiKey}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(generatedApiKey)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </AlertDescription>
                    <AlertDescription className="mt-2 text-sm">
                      Save this key securely. For security reasons, it will not be displayed again.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {apiKeys.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Your API Keys</h3>
                    <div className="border rounded-md divide-y">
                      {apiKeys.map((key) => (
                        <div key={key.id} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-mono text-sm truncate max-w-xs">{key.id}</p>
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(key.createdAt).toLocaleDateString()}
                              {key.lastUsed && ` • Last used: ${new Date(key.lastUsed).toLocaleDateString()}`}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => revokeApiKey(key.id)}
                            disabled={loading}
                          >
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-muted shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">API Documentation</CardTitle>
              <CardDescription>Learn how to use our API to generate README files programmatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="endpoint" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="endpoint">Endpoint</TabsTrigger>
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>

                <TabsContent value="endpoint" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Base URL</h3>
                    <code className="bg-muted px-2 py-1 rounded font-mono">
                      https://your-domain.com/api/v1/generate
                    </code>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Method</h3>
                    <code className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">
                      POST
                    </code>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Headers</h3>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm">
                      <p>Content-Type: application/json</p>
                      <p>Authorization: Bearer YOUR_API_KEY</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Rate Limits</h3>
                    <p className="text-muted-foreground">
                      The API is rate-limited to 100 requests per hour per API key. Rate limit information is returned
                      in the response headers:
                    </p>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm mt-2">
                      <p>X-RateLimit-Limit: 100</p>
                      <p>X-RateLimit-Remaining: 99</p>
                      <p>X-RateLimit-Reset: 3600</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="request" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Request Body</h3>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm">
                      {`{
  "repoUrl": "https://github.com/username/repository",
  "githubToken": "github_pat_..." // Optional
}`}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Parameters</h3>
                    <div className="border rounded-md divide-y">
                      <div className="p-4 grid grid-cols-3 gap-4">
                        <div>
                          <p className="font-medium">repoUrl</p>
                          <p className="text-xs text-muted-foreground">string</p>
                        </div>
                        <div className="col-span-2">
                          <p>The URL of the GitHub repository to generate a README for.</p>
                          <p className="text-xs text-muted-foreground mt-1">Required</p>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-3 gap-4">
                        <div>
                          <p className="font-medium">githubToken</p>
                          <p className="text-xs text-muted-foreground">string</p>
                        </div>
                        <div className="col-span-2">
                          <p>A GitHub personal access token to access private repositories or avoid rate limits.</p>
                          <p className="text-xs text-muted-foreground mt-1">Optional</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Example Request</h3>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm">
                      {`curl -X POST https://your-domain.com/api/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key" \\
  -d '{
    "repoUrl": "https://github.com/username/repository"
  }'`}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="response" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Success Response (200 OK)</h3>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
                      {`{
  "success": true,
  "readme": "# Repository Name\\n\\nRepository description...\\n\\n## Problem Statement\\n\\n...",
  "metadata": {
    "repository": {
      "name": "repository",
      "owner": "username",
      "stars": 42,
      "language": "JavaScript",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-06-15T00:00:00Z"
    }
  }
}`}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Error Responses</h3>
                    <div className="border rounded-md divide-y">
                      <div className="p-4 grid grid-cols-3 gap-4">
                        <div>
                          <p className="font-medium">400 Bad Request</p>
                        </div>
                        <div className="col-span-2">
                          <p>Missing or invalid parameters.</p>
                          <div className="bg-muted p-2 rounded-md font-mono text-xs mt-2">
                            {`{
  "error": "Repository URL is required"
}`}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-3 gap-4">
                        <div>
                          <p className="font-medium">401 Unauthorized</p>
                        </div>
                        <div className="col-span-2">
                          <p>Missing or invalid API key.</p>
                          <div className="bg-muted p-2 rounded-md font-mono text-xs mt-2">
                            {`{
  "error": "Missing or invalid API key. Please provide a valid API key in the Authorization header."
}`}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-3 gap-4">
                        <div>
                          <p className="font-medium">404 Not Found</p>
                        </div>
                        <div className="col-span-2">
                          <p>Repository not found.</p>
                          <div className="bg-muted p-2 rounded-md font-mono text-xs mt-2">
                            {`{
  "error": "Repository not found. Check the URL or provide a GitHub token for private repositories."
}`}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-3 gap-4">
                        <div>
                          <p className="font-medium">429 Too Many Requests</p>
                        </div>
                        <div className="col-span-2">
                          <p>Rate limit exceeded.</p>
                          <div className="bg-muted p-2 rounded-md font-mono text-xs mt-2">
                            {`{
  "error": "Rate limit exceeded. Please try again later.",
  "limit": 100,
  "remaining": 0,
  "reset": 3600
}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Try It Out</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Your API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repo-url">Repository URL</Label>
                    <Input id="repo-url" placeholder="https://github.com/username/repository" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github-token">GitHub Token (Optional)</Label>
                    <Input id="github-token" type="password" placeholder="GitHub personal access token" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="response">Response</Label>
                    <Textarea
                      id="response"
                      placeholder="Response will appear here..."
                      className="min-h-[200px] font-mono"
                      readOnly
                    />
                  </div>

                  <Button className="w-full">
                    <Lock className="mr-2 h-4 w-4" />
                    Send Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-muted shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">AI-Powered README Generation</CardTitle>
              <CardDescription>
                Use Gemini AI to generate more comprehensive and insightful README files.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our API can use Google's Gemini AI to analyze your repository code and generate more detailed README files with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>In-depth code analysis and architecture explanations</li>
                <li>Detailed tech stack descriptions</li>
                <li>Comprehensive feature documentation</li>
                <li>More accurate API documentation</li>
              </ul>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Gemini API Key Required</AlertTitle>
                <AlertDescription>
                  To use AI-powered generation, you need to provide a Gemini API key in your request.
                </AlertDescription>
              </Alert>
              
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                {`{
  "repoUrl": "https://github.com/username/repository",
  "githubToken": "github_pat_...", // Optional
  "geminiApiKey": "AIzaSy..." // Optional, for AI-powered generation
}`}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

