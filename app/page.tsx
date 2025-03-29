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
  Zap,
  Shield,
  ArrowRight
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
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { motion, AnimatePresence } from "framer-motion"
import { ReadmeLoadingOverlay } from "@/components/ReadmeLoadingOverlay"

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
  const [user, setUser] = useState<any>(null)

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

  // Add this useEffect for auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })
    return () => unsubscribe()
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

  // Add sign in/out functions
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Error signing in with Google:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const generateReadme = async () => {
    if (!user) {
      setError("Please sign in to generate README")
      return
    }
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

      const data = await response.json().catch(() => ({
        error: "Failed to parse server response"
      }))

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      setReadme(data.readme)
      setActiveTab("preview")
    } catch (err) {
      console.error("Error generating README:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again later.")
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
    <main className="min-h-screen relative overflow-hidden bg-[#080320]">
      <AnimatePresence>
        {isLoading && <ReadmeLoadingOverlay />}
      </AnimatePresence>

      {/* Enhanced mesh gradient background with subtle animation */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2] 
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute top-0 left-[-20%] w-[500px] h-[500px] rounded-full bg-purple-800/30 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.25, 0.2] 
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute top-[20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-indigo-700/30 blur-[150px]" 
        />
        <div className="absolute bottom-[-20%] left-[20%] w-[700px] h-[700px] rounded-full bg-violet-900/40 blur-[140px]" />
      </div>

      {/* Header with hover effects */}
      <header className="container mx-auto py-4 px-4 relative z-10">
        <div className="flex justify-between items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Code className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-semibold text-xl">Mark FLow</span>
          </motion.div>
          <div className="flex items-center gap-4">
            {/* <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-indigo-900/40">
              Documentation
            </Button>
            <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-indigo-900/40">
              Blog
            </Button>
            <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-indigo-900/40">
              About
            </Button> */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white">{user.displayName}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full px-4"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={signInWithGoogle}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full px-4"
              >
                Sign In with Google
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto py-12 px-4 relative z-10">
        {user ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex h-full animate-background-shine cursor-pointer items-center justify-center rounded-full border border-indigo-400/20 bg-[linear-gradient(110deg,#000B1F,45%,#4C1D95,55%,#000B1F)] bg-[length:250%_100%] px-4 py-1.5 text-sm font-medium text-violet-300 tracking-wider uppercase mb-4 backdrop-blur-sm">
              Documentation Assistant
            </div>
            <h1 className="text-5xl font-normal mb-6 leading-tight tracking-tight bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-300 text-transparent bg-clip-text">
              Readme <span className="font-bold">Assistant</span> for Your
              <span className="font-bold"> Project</span>
            </h1>
            <p className="text-lg text-indigo-200/90 max-w-2xl mx-auto leading-relaxed mb-12 font-light">
              Accept repository details and let Mark FLow analyze your codebase to generate professional documentation in seconds.
            </p>
            
            <div className="grid gap-10">
              <Card className="bg-indigo-950/40 backdrop-blur-xl border border-indigo-500/20 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(79_70_229/0.3)]">
                <CardHeader className="pb-4 border-b border-indigo-500/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-normal text-white flex items-center gap-2">
                        <Brain className="h-5 w-5 text-indigo-400" />
                        <span>Generate Your README</span>
                      </CardTitle>
                      <CardDescription className="text-sm text-indigo-200/80 font-light mt-1">
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
                                className="text-indigo-300 hover:text-white hover:bg-indigo-900/50"
                              >
                                <Settings className="h-5 w-5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-indigo-950 border border-indigo-600/30 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-white">API Settings</DialogTitle>
                                <DialogDescription className="text-indigo-300">
                                  Configure your GitHub API key to access private repositories and avoid rate limits.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="github-api-key" className="text-indigo-200">
                                    GitHub API Key
                                  </Label>
                                  <Input
                                    id="github-api-key"
                                    type="password"
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    value={githubApiKey}
                                    onChange={(e) => setGithubApiKey(e.target.value)}
                                    className="bg-indigo-900/40 border-indigo-600/30 text-white focus:border-purple-500 focus:ring-purple-500/30"
                                  />
                                  <p className="text-sm text-indigo-300">
                                    Create a personal access token with{" "}
                                    <code className="bg-indigo-900/60 px-1 rounded text-indigo-200">repo</code> scope at{" "}
                                    <a
                                      href="https://github.com/settings/tokens"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-purple-400 hover:underline"
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
                                    className="data-[state=checked]:bg-purple-500"
                                  />
                                  <Label htmlFor="use-api-key" className="text-indigo-200">
                                    Use API Key for requests
                                  </Label>
                                </div>
                                {apiKeySaved && (
                                  <Alert className="bg-purple-900/20 border border-purple-500/30 text-indigo-200">
                                    <CheckCircle className="h-4 w-4 text-purple-400" />
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
                                  className="bg-red-900/40 hover:bg-red-800/60 text-white border border-red-500/30"
                                >
                                  Clear API Key
                                </Button>
                                <Button
                                  onClick={saveApiKey}
                                  disabled={!githubApiKey}
                                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                >
                                  Save API Key
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TooltipTrigger>
                        <TooltipContent className="bg-indigo-900 text-white border-indigo-700">
                          <p>API Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <motion.div 
                            animate={{ 
                              width: ["0%", "100%", "0%"]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute -top-[1px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                          />
                          <Input
                            id="repo-url"
                            placeholder="https://github.com/username/repository"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            className="h-12 px-4 bg-indigo-900/30 backdrop-blur-sm border-indigo-500/30 focus:border-purple-500 focus:ring-purple-500/30 rounded-xl text-white placeholder:text-indigo-400/60"
                          />
                          {useApiKey && apiKeySaved && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <CheckCircle className="h-5 w-5 text-purple-500" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-indigo-900/90 backdrop-blur-sm text-white border-indigo-700/30">
                                  <p>Using authenticated API access</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <Button
                          onClick={generateReadme}
                          disabled={isLoading || !repoUrl}
                          className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 relative overflow-hidden"
                        >
                          {isLoading && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{ 
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            />
                          )}
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-5 w-5" />
                              Generate README
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="bg-indigo-900/30 border border-indigo-500/20 rounded-xl p-4 flex items-start hover:border-purple-500/40 transition-colors cursor-pointer"
                        onClick={() => setRepoUrl("https://github.com/facebook/react")}
                      >
                        <div className="mr-3 bg-purple-500/20 p-2 rounded-lg">
                          <Code className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm mb-1">React</h3>
                          <p className="text-indigo-300 text-xs">facebook/react</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="bg-indigo-900/30 border border-indigo-500/20 rounded-xl p-4 flex items-start hover:border-purple-500/40 transition-colors cursor-pointer"
                        onClick={() => setRepoUrl("https://github.com/krishn404/Mark-flow")}
                      >
                        <div className="mr-3 bg-purple-500/20 p-2 rounded-lg">
                          <Zap className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm mb-1">Mark-flow</h3>
                          <p className="text-indigo-300 text-xs">krishn404/Mark-flow</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="bg-indigo-900/30 border border-indigo-500/20 rounded-xl p-4 flex items-start hover:border-purple-500/40 transition-colors cursor-pointer"
                        onClick={() => setRepoUrl("https://github.com/github/docs")}
                      >
                        <div className="mr-3 bg-purple-500/20 p-2 rounded-lg">
                          <Github className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm mb-1">GitHub Docs</h3>
                          <p className="text-indigo-300 text-xs">github/docs</p>
                        </div>
                      </motion.div>
                    </div>

                    {error && (
                      <Alert className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 text-red-300">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {readme && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-indigo-950/40 backdrop-blur-xl border border-indigo-500/20 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(79_70_229/0.3)] mt-10">
                    <CardHeader className="pb-4 border-b border-indigo-500/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl font-normal text-white flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-400" />
                            <span>Generated README</span>
                          </CardTitle>
                          <CardDescription className="text-sm text-indigo-200/80 font-light mt-1">
                            Preview and edit your AI-generated README before using it.
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          onClick={copyToClipboard}
                          className="border-indigo-500/30 text-indigo-200 hover:bg-indigo-800/50 hover:text-white transition-all text-sm"
                        >
                          {copySuccess ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
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
                    <CardContent className="pt-8">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-indigo-900/20 p-1 rounded-lg">
                          <TabsTrigger
                            value="preview"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-indigo-300 text-sm rounded-md"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Preview
                          </TabsTrigger>
                          <TabsTrigger
                            value="markdown"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-indigo-300 text-sm rounded-md"
                          >
                            <Github className="mr-2 h-4 w-4" />
                            Markdown
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="preview" className="mt-4">
                          <div className="border border-indigo-600/20 rounded-xl p-6 bg-indigo-900/20 shadow-inner">
                            <div className="prose dark:prose-invert max-w-none prose-headings:text-white prose-a:text-purple-400 prose-code:bg-indigo-900/60 prose-code:text-indigo-200 prose-pre:bg-indigo-900/60 prose-pre:text-indigo-200 prose-strong:text-indigo-100">
                              <ReactMarkdown>{readme}</ReactMarkdown>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="markdown" className="mt-4">
                          <Textarea
                            className="min-h-[500px] font-mono bg-indigo-900/30 border-indigo-600/30 text-white resize-none"
                            value={readme}
                            onChange={(e) => setReadme(e.target.value)}
                          />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-6xl font-normal mb-6 leading-tight tracking-tight bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-300 text-transparent bg-clip-text">
              Generate Professional <span className="font-bold">README</span> Files with AI
            </h1>
            <p className="text-xl text-indigo-200/90 max-w-2xl mx-auto leading-relaxed mb-12">
              Transform your repository documentation with our AI-powered README generator. 
              Sign in to get started.
            </p>
            <Button
              onClick={signInWithGoogle}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-8 py-6 text-lg"
            >
              <Github className="mr-2 h-5 w-5" />
              Sign In with Google to Get Started
            </Button>
          </motion.div>
        )}
        
        {/* Stats Section */}
        {!readme && !user && (
          <div className="max-w-4xl mx-auto mt-20 text-center">
            <h2 className="text-3xl font-light mb-8 text-white">Trusted by <span className="font-medium">leading developers</span></h2>
            
            <motion.div 
              className="grid grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="bg-indigo-900/30 border border-indigo-500/20 p-6 rounded-xl">
                  <div className="flex justify-center mb-2">
                    <Shield className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">99.9%</div>
                  <div className="text-indigo-300 text-sm">Successful Analysis</div>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="bg-indigo-900/30 border border-indigo-500/20 p-6 rounded-xl">
                  <div className="flex justify-center mb-2">
                    <FileText className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">500k+</div>
                  <div className="text-indigo-300 text-sm">READMEs Generated</div>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="bg-indigo-900/30 border border-indigo-500/20 p-6 rounded-xl">
                  <div className="flex justify-center mb-2">
                    <Code className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">20M+</div>
                  <div className="text-indigo-300 text-sm">Code Files Analyzed</div>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="bg-indigo-900/30 border border-indigo-500/20 p-6 rounded-xl">
                  <div className="flex justify-center mb-2">
                    <Github className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">80%</div>
                  <div className="text-indigo-300 text-sm">User Satisfaction</div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        )}
        
        {/* FAQ Section */}
        {!readme && !user && (
          <motion.div 
            className="max-w-3xl mx-auto mt-20 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-light mb-8 text-white text-center">Frequently Asked <span className="font-medium">Questions</span></h2>
            
            <div className="space-y-4">
              <Card className="bg-indigo-900/30 border border-indigo-500/20 p-5 rounded-xl overflow-hidden">
                <CardTitle className="text-lg text-white mb-2 flex justify-between items-center cursor-pointer">
                  <span>How does Mark FLow work?</span>
                  <ArrowRight className="h-5 w-5 text-purple-400" />
                </CardTitle>
                <CardDescription className="text-indigo-200">
                  Mark FLow analyzes your repository's code structure, functions, dependencies, and architecture to generate a comprehensive README using advanced AI models.
                </CardDescription>
              </Card>
              
              <Card className="bg-indigo-900/30 border border-indigo-500/20 p-5 rounded-xl overflow-hidden">
                <CardTitle className="text-lg text-white mb-2 flex justify-between items-center cursor-pointer">
                  <span>Is my code secure when using Mark FLow?</span>
                  <ArrowRight className="h-5 w-5 text-purple-400" />
                </CardTitle>
                <CardDescription className="text-indigo-200">
                  Yes, all repository analysis happens securely. We never store your code and all processing is done with strict privacy protocols in place.
                </CardDescription>
              </Card>
              
              <Card className="bg-indigo-900/30 border border-indigo-500/20 p-5 rounded-xl overflow-hidden">
                <CardTitle className="text-lg text-white mb-2 flex justify-between items-center cursor-pointer">
                  <span>Why do I need a GitHub API key?</span>
                  <ArrowRight className="h-5 w-5 text-purple-400" />
                </CardTitle>
                <CardDescription className="text-indigo-200">
                  A GitHub API key allows Mark FLow to access private repositories and avoids rate limits when analyzing larger projects. It's optional but recommended.
                </CardDescription>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-indigo-500/20 mt-10">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Code className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-semibold">Mark FLow</span>
            </div>
            <div className="text-indigo-400 text-sm">
              © 2025 Mark FLow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}