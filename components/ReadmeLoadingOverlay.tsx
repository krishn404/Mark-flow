"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Code, FileText, Zap, Github, Star, GitBranch, CheckCircle2 } from "lucide-react"

const funFacts = [
  "The first README was written in 1969 on paper tape! 📜",
  "The longest README on GitHub is over 100,000 words long! 📚",
  "Some developers hide Easter eggs in their READMEs using invisible characters! 🥚",
  "GitHub's most starred README contains only emojis! 🌟",
  "The word README was originally written in caps to appear first in directory listings! 📂",
  "A good README can increase your project's adoption by up to 50%! 📈",
  "Some READMEs have hidden games inside them! 🎮",
  "The average README takes 7 minutes to read! ⏱️",
  "Over 90% of top GitHub projects have comprehensive READMEs! 🏆",
  "Some developers spend more time on their README than the actual code! 🤓",
]

const loadingSteps = [
  {
    icon: <Github />,
    title: "Fetching Repository",
    description: "Connecting to GitHub and retrieving repository data...",
    duration: 3000,
  },
  {
    icon: <Code />,
    title: "Analyzing Code Structure",
    description: "Examining files, dependencies, and architecture patterns...",
    duration: 4000,
  },
  {
    icon: <Brain />,
    title: "Understanding Project",
    description: "Identifying frameworks, libraries, and project purpose...",
    duration: 4000,
  },
  {
    icon: <Zap />,
    title: "Generating Documentation",
    description: "Creating comprehensive README with AI assistance...",
    duration: 5000,
  },
  {
    icon: <FileText />,
    title: "Formatting Content",
    description: "Applying markdown formatting and organizing sections...",
    duration: 3000,
  },
  {
    icon: <CheckCircle2 />,
    title: "Finalizing",
    description: "Polishing content and preparing for display...",
    duration: 2000,
  },
]

export function ReadmeLoadingOverlay() {
  const [currentFact, setCurrentFact] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Set initial random fact
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * funFacts.length)
    setCurrentFact(funFacts[randomIndex])

    // Cycle through facts every 8 seconds
    const factInterval = setInterval(() => {
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * funFacts.length)
      } while (funFacts[newIndex] === currentFact) // Ensure we don't show the same fact twice

      setCurrentFact(funFacts[newIndex])
    }, 8000)

    return () => clearInterval(factInterval)
  }, [currentFact])

  // Progress through loading steps
  useEffect(() => {
    if (currentStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, currentStep])
        setCurrentStep((prev) => prev + 1)
      }, loadingSteps[currentStep].duration)

      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // Update progress bar
  useEffect(() => {
    const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0)
    const interval = 50 // Update every 50ms
    const increment = 100 / (totalDuration / interval)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment
        return newProgress > 100 ? 100 : newProgress
      })
    }, interval)

    return () => clearInterval(progressInterval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/80 backdrop-blur-sm"
    >
      <div className="max-w-md w-full mx-auto px-4">
        <div className="relative bg-indigo-900/40 backdrop-blur-md border border-indigo-500/30 rounded-xl p-6 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
          {/* Animated particles in background */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-indigo-500/30"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                  opacity: Math.random() * 0.5 + 0.3,
                }}
                animate={{
                  x: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
                  y: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
                  opacity: [Math.random() * 0.5 + 0.3, Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.3],
                }}
                transition={{
                  duration: Math.random() * 10 + 15,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="mb-4 inline-block"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Brain className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <h2 className="text-2xl font-medium text-white mb-2">Creating Your README</h2>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentFact}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-indigo-200 text-sm mb-4 min-h-[2.5rem] flex items-center justify-center"
                  >
                    {currentFact}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-1.5 bg-indigo-900/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: "5%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeInOut" }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-indigo-300">
                <span>Analyzing</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-4">
              <AnimatePresence mode="wait">
                {currentStep < loadingSteps.length && (
                  <motion.div
                    key={`active-${currentStep}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-purple-500/50 bg-purple-500/10"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/20">
                      <div className="text-purple-400">{loadingSteps[currentStep].icon}</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-200 text-sm">{loadingSteps[currentStep].title}</div>
                      <div className="text-xs text-indigo-300">{loadingSteps[currentStep].description}</div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Completed steps */}
              <div className="space-y-2">
                {completedSteps.map((stepIndex) => (
                  <motion.div
                    key={`completed-${stepIndex}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 0.7, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 p-2 rounded-lg border border-green-500/30 bg-green-500/5"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-500/20">
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                    </div>
                    <div className="text-xs text-green-200">{loadingSteps[stepIndex].title}</div>
                  </motion.div>
                ))}
              </div>

              {/* Upcoming steps (faded) */}
              {currentStep < loadingSteps.length - 1 && (
                <div className="space-y-2 opacity-50">
                  {loadingSteps.slice(currentStep + 1, currentStep + 3).map((step, index) => (
                    <motion.div
                      key={`upcoming-${currentStep + index + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ duration: 0.3, delay: 0.2 * index }}
                      className="flex items-center gap-3 p-2 rounded-lg border border-indigo-500/20 bg-indigo-900/20"
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-indigo-500/20">
                        <div className="text-indigo-400 h-3 w-3">{step.icon}</div>
                      </div>
                      <div className="text-xs text-indigo-300">{step.title}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  )
}

