import { motion } from "framer-motion"
import { Brain } from "lucide-react"

const funFacts = [
  "The first README was written in 1969 on paper tape! 📜",
  "The longest README on GitHub is over 100,000 words long! 📚",
  "Some developers hide Easter eggs in their READMEs using invisible characters! 🥚",
  "GitHub's most starred README contains only emojis! 🌟",
  "The word README was originally written in caps to appear first in directory listings! 📂",
]

export function ReadmeLoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/80 backdrop-blur-sm"
    >
      <div className="max-w-lg text-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mb-8 inline-block"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-8 w-8 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-medium text-white mb-3">
            Analyzing Repository...
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-indigo-200 mb-6"
          >
            {funFacts[Math.floor(Math.random() * funFacts.length)]}
          </motion.p>
        </motion.div>

        <motion.div
          className="w-full bg-indigo-900/50 h-2 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
} 