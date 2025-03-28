"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  Copy,
  Github,
  FileText,
  Loader2,
  Settings,
  CheckCircle,
  Info,
  Code,
  BookOpen,
  Brain,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ReactMarkdown from "react-markdown"

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("")
  const [readme, setReadme] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const [githubApiKey, setGithubApiKey] = useState("")
  const [useApiKey, setUseApiKey] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("github-api-key")
    if (savedApiKey) {
      setGithubApiKey(savedApiKey)
      setUseApiKey(true)
      setApiKeySaved(true)
    }

    // Apply dark mode by default
    document.documentElement.classList.add("dark")
  }, [])

  const saveApiKey = () => {
    if (githubApiKey) {
      localStorage.setItem("github-api-key", githubApiKey)
      setApiKeySaved(true)
      setUseApiKey(true)
    } else {
      localStorage.removeItem("github-api-key")
      setApiKeySaved(false)
      setUseApiKey(false)
    }
  }

  const clearApiKey = () => {
    localStorage.removeItem("github-api-key")
    setGithubApiKey("")
    setApiKeySaved(false)
    setUseApiKey(false)
  }

  const generateReadme = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/generate-readme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl,
          apiKey: useApiKey ? githubApiKey : null,
        }),
      })

      // Check if the response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response. Please try again later.")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate README")
      }

      setReadme(data.readme)
      setActiveTab("preview")
    } catch (err: any) {
      console.error("Error generating README:", err)
      setError(err.message || "An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(readme)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mono-grid absolute inset-0 z-0 opacity-5 pointer-events-none"></div>
      <div className="container mx-auto py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-white bg-opacity-10 rounded-full mb-6 mono-glow">
              <Github className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold mb-6 text-white mono-glitch">AI README Generator</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Create comprehensive, professional README files for your GitHub repositories with just a URL.
              <span className="block mt-2 text-white">Powered by Gemini AI for deep code analysis.</span>
            </p>
          </div>

          <div className="grid gap-8 mb-16">
            <Card className="border-0 bg-zinc-900 shadow-mono rounded-xl overflow-hidden backdrop-blur-sm border-t border-zinc-800">
              <CardHeader className="pb-2 border-b border-zinc-800">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-white" />
                      <span>Generate Your README</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Enter a GitHub repository URL to analyze code and generate a detailed README file.
                    </CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-white hover:bg-zinc-800"
                            >
                              <Settings className="h-5 w-5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-900 border border-zinc-800 text-white">
                            <DialogHeader>
                              <DialogTitle className="text-white">API Settings</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Configure your GitHub API key to access private repositories and avoid rate limits.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="github-api-key" className="text-gray-300">
                                  GitHub API Key
                                </Label>
                                <Input
                                  id="github-api-key"
                                  type="password"
                                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                  value={githubApiKey}
                                  onChange={(e) => setGithubApiKey(e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white"
                                />
                                <p className="text-sm text-gray-400">
                                  Create a personal access token with{" "}
                                  <code className="bg-zinc-800 px-1 rounded text-white">repo</code> scope at{" "}
                                  <a
                                    href="https://github.com/settings/tokens"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-white hover:underline"
                                  >
                                    GitHub Settings
                                  </a>
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="use-api-key"
                                  checked={useApiKey}
                                  onCheckedChange={setUseApiKey}
                                  disabled={!apiKeySaved}
                                  className="data-[state=checked]:bg-white"
                                />
                                <Label htmlFor="use-api-key" className="text-gray-300">
                                  Use API Key for requests
                                </Label>
                              </div>
                              {apiKeySaved && (
                                <Alert className="bg-white bg-opacity-5 border border-white border-opacity-20 text-white">
                                  <CheckCircle className="h-4 w-4" />
                                  <AlertTitle>API Key Saved</AlertTitle>
                                  <AlertDescription>
                                    Your GitHub API key is saved in your browser's local storage.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                            <DialogFooter className="flex justify-between sm:justify-between">
                              <Button
                                variant="destructive"
                                onClick={clearApiKey}
                                disabled={!apiKeySaved}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white"
                              >
                                Clear API Key
                              </Button>
                              <Button
                                onClick={saveApiKey}
                                disabled={!githubApiKey}
                                className="bg-white hover:bg-gray-200 text-black"
                              >
                                Save API Key
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 text-white border-zinc-800">
                        <p>API Settings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="repo-url"
                          placeholder="https://github.com/username/repository"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          className="pr-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-white focus:ring-white"
                        />
                        {useApiKey && apiKeySaved && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-zinc-900 text-white border-zinc-800">
                                <p>Using authenticated API access</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <Button
                        onClick={generateReadme}
                        disabled={isLoading || !repoUrl}
                        className="whitespace-nowrap bg-white hover:bg-gray-200 text-black border-0 shadow-mono-sm"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-4 w-4" />
                            Generate README
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-white bg-opacity-5 border border-white border-opacity-20 text-white">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Deep Repository Analysis</AlertTitle>
                    <AlertDescription>
                      This tool analyzes your repository's code structure, functions, dependencies, and architecture to
                      generate a comprehensive README using Gemini AI.
                    </AlertDescription>
                  </Alert>

                  {!apiKeySaved && (
                    <Alert className="bg-white bg-opacity-5 border border-white border-opacity-20 text-white">
                      <Info className="h-4 w-4" />
                      <AlertTitle>API Key Recommended</AlertTitle>
                      <AlertDescription>
                        Using a GitHub API key allows access to private repositories and avoids rate limits.{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-white underline"
                          onClick={() => setSettingsOpen(true)}
                        >
                          Add your API key
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert className="bg-white bg-opacity-5 border border-white border-opacity-20 text-white">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {readme && (
              <Card className="border-0 bg-zinc-900 shadow-mono rounded-xl overflow-hidden backdrop-blur-sm border-t border-zinc-800">
                <CardHeader className="pb-2 border-b border-zinc-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-white" />
                        <span>Generated README</span>
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Preview and edit your AI-generated README before using it.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white transition-all"
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4 text-white" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-800 p-1">
                      <TabsTrigger
                        value="preview"
                        className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-gray-400"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger
                        value="markdown"
                        className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-gray-400"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        Markdown
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="mt-4">
                      <div className="border border-zinc-800 rounded-md p-6 bg-zinc-900 shadow-inner">
                        <div className="prose dark:prose-invert max-w-none prose-headings:text-white prose-a:text-gray-300 prose-code:bg-zinc-800 prose-code:text-white prose-pre:bg-zinc-800 prose-pre:text-gray-300 prose-strong:text-white">
                          <ReactMarkdown>{readme}</ReactMarkdown>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="markdown" className="mt-4">
                      <Textarea
                        className="min-h-[500px] font-mono bg-zinc-800/50 border-zinc-700 text-white resize-none"
                        value={readme}
                        onChange={(e) => setReadme(e.target.value)}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-16">
            <div>
              <h2 className="text-3xl font-bold mb-8 text-center text-white">Features</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-0 bg-zinc-900/50 hover:bg-zinc-900 transition-all duration-300 backdrop-blur-sm rounded-xl overflow-hidden group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="bg-white bg-opacity-10 p-2 rounded-lg group-hover:shadow-mono-sm transition-all duration-300">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <span>AI-Powered Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      Uses Gemini AI to analyze code structure, functions, and architecture to generate intelligent
                      documentation.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-zinc-900/50 hover:bg-zinc-900 transition-all duration-300 backdrop-blur-sm rounded-xl overflow-hidden group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="bg-white bg-opacity-10 p-2 rounded-lg group-hover:shadow-mono-sm transition-all duration-300">
                        <Code className="h-5 w-5 text-white" />
                      </div>
                      <span>Deep Code Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      Examines your codebase to identify patterns, frameworks, and architecture to explain your
                      project's technical implementation.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-zinc-900/50 hover:bg-zinc-900 transition-all duration-300 backdrop-blur-sm rounded-xl overflow-hidden group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="bg-white bg-opacity-10 p-2 rounded-lg group-hover:shadow-mono-sm transition-all duration-300">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <span>Comprehensive Documentation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      Creates detailed documentation including tech stack, architecture, installation instructions, and
                      usage guides tailored to your project.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 shadow-mono">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">Why Use This Tool?</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg bg-black/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
                      <div className="p-1.5 rounded-full bg-white bg-opacity-10 text-white">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      Problem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      Creating comprehensive README files that explain your code's architecture, tech stack, and
                      functionality is time-consuming and often overlooked. Many repositories lack proper technical
                      documentation.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-black/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
                      <div className="p-1.5 rounded-full bg-white bg-opacity-10 text-white">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      Solution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      This tool uses AI to analyze your entire codebase, understand your project's architecture, and
                      generate a detailed README that explains your tech stack, functionality, and implementation
                      details automatically.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

