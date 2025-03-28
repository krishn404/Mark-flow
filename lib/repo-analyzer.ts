import type { Octokit } from "@octokit/rest"

// Analyze a GitHub repository in depth
export async function analyzeRepository(octokit: Octokit, owner: string, repo: string) {
  try {
    // Get repository information
    const repoInfo = await octokit.repos.get({
      owner,
      repo,
    })

    // Get repository contents (root directory)
    const contents = await octokit.repos.getContent({
      owner,
      repo,
      path: "",
    })

    // Get languages used in the repository
    const languages = await octokit.repos.listLanguages({
      owner,
      repo,
    })

    // Get contributors
    const contributors = await octokit.repos.listContributors({
      owner,
      repo,
      per_page: 10,
    })

    // Try to fetch README if it exists
    let existingReadme = null
    try {
      const readmeResponse = await octokit.repos.getReadme({
        owner,
        repo,
      })

      const readmeContent = Buffer.from(readmeResponse.data.content, "base64").toString()
      existingReadme = readmeContent
    } catch (error) {
      // README doesn't exist or couldn't be fetched, that's okay
    }

    // Try to fetch package.json if it exists
    let packageJson = null
    try {
      const packageJsonResponse = await octokit.repos.getContent({
        owner,
        repo,
        path: "package.json",
      })

      if ("content" in packageJsonResponse.data) {
        const packageJsonContent = Buffer.from(packageJsonResponse.data.content, "base64").toString()
        packageJson = JSON.parse(packageJsonContent)
      }
    } catch (error) {
      // package.json doesn't exist or couldn't be fetched, that's okay
    }

    // Get key files for deeper analysis
    const keyFiles = await getKeyFiles(
      octokit,
      owner,
      repo,
      Array.isArray(contents.data) ? contents.data : [contents.data],
    )

    // Analyze code patterns and architecture
    const codeAnalysis = analyzeCodePatterns(keyFiles, packageJson)

    return {
      repoInfo: repoInfo.data,
      contents: Array.isArray(contents.data) ? contents.data : [contents.data],
      languages: languages.data,
      contributors: contributors.data,
      existingReadme,
      packageJson,
      owner,
      repo,
      codeAnalysis,
      fileContents: keyFiles,
    }
  } catch (error) {
    console.error("Error analyzing repository:", error)
    throw error
  }
}

// Get important files from the repository for deeper analysis
async function getKeyFiles(octokit: Octokit, owner: string, repo: string, contents: any[]) {
  const keyFiles = []
  const maxFilesToAnalyze = 10
  const filesToAnalyze = []

  // Identify key files to analyze
  for (const item of contents) {
    if (item.type === "file") {
      // Prioritize important files
      if (
        item.name === "package.json" ||
        item.name === "tsconfig.json" ||
        item.name === "webpack.config.js" ||
        item.name === "next.config.js" ||
        item.name === "app.js" ||
        item.name === "index.js" ||
        item.name === "main.js" ||
        item.name === "server.js" ||
        item.name.endsWith(".ts") ||
        item.name.endsWith(".tsx")
      ) {
        filesToAnalyze.push(item)
      }
    } else if (item.type === "dir") {
      // Look for key directories
      if (
        item.name === "src" ||
        item.name === "app" ||
        item.name === "pages" ||
        item.name === "components" ||
        item.name === "lib" ||
        item.name === "utils"
      ) {
        try {
          const dirContents = await octokit.repos.getContent({
            owner,
            repo,
            path: item.path,
          })

          if (Array.isArray(dirContents.data)) {
            // Add some files from key directories
            for (const file of dirContents.data) {
              if (
                file.type === "file" &&
                (file.name.endsWith(".js") ||
                  file.name.endsWith(".ts") ||
                  file.name.endsWith(".tsx") ||
                  file.name.endsWith(".jsx"))
              ) {
                filesToAnalyze.push(file)
                if (filesToAnalyze.length >= maxFilesToAnalyze) break
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching contents of ${item.path}:`, error)
        }
      }
    }

    if (filesToAnalyze.length >= maxFilesToAnalyze) break
  }

  // Fetch content of key files
  for (const file of filesToAnalyze.slice(0, maxFilesToAnalyze)) {
    try {
      const fileResponse = await octokit.repos.getContent({
        owner,
        repo,
        path: file.path,
      })

      if ("content" in fileResponse.data) {
        const fileContent = Buffer.from(fileResponse.data.content, "base64").toString()
        keyFiles.push({
          path: file.path,
          content: fileContent,
        })
      }
    } catch (error) {
      console.error(`Error fetching content of ${file.path}:`, error)
    }
  }

  return keyFiles
}

// Analyze code patterns and architecture
function analyzeCodePatterns(keyFiles: any[], packageJson: any) {
  let analysis = ""

  // Identify framework
  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

    if (deps.react && deps.next) {
      analysis += "Framework: Next.js (React framework)\n"
    } else if (deps.react) {
      analysis += "Framework: React\n"
    } else if (deps.vue) {
      analysis += "Framework: Vue.js\n"
    } else if (deps.express) {
      analysis += "Framework: Express.js (Node.js)\n"
    } else if (deps.koa) {
      analysis += "Framework: Koa.js (Node.js)\n"
    } else if (deps["@nestjs/core"]) {
      analysis += "Framework: NestJS (Node.js)\n"
    }

    // Identify state management
    if (deps.redux || deps["@reduxjs/toolkit"]) {
      analysis += "State Management: Redux\n"
    } else if (deps.mobx) {
      analysis += "State Management: MobX\n"
    } else if (deps.zustand) {
      analysis += "State Management: Zustand\n"
    } else if (deps.recoil) {
      analysis += "State Management: Recoil\n"
    }

    // Identify styling approach
    if (deps.tailwindcss) {
      analysis += "Styling: Tailwind CSS\n"
    } else if (deps["styled-components"]) {
      analysis += "Styling: Styled Components\n"
    } else if (deps["@emotion/react"]) {
      analysis += "Styling: Emotion\n"
    } else if (deps.sass || deps["node-sass"]) {
      analysis += "Styling: Sass/SCSS\n"
    }

    // Identify testing frameworks
    if (deps.jest) {
      analysis += "Testing: Jest\n"
    } else if (deps.mocha) {
      analysis += "Testing: Mocha\n"
    } else if (deps.cypress) {
      analysis += "Testing: Cypress\n"
    } else if (deps["@testing-library/react"]) {
      analysis += "Testing: React Testing Library\n"
    }

    // Identify API/data fetching
    if (deps.axios) {
      analysis += "API Client: Axios\n"
    } else if (deps["@apollo/client"] || deps["apollo-client"]) {
      analysis += "API Client: Apollo (GraphQL)\n"
    } else if (deps["@tanstack/react-query"] || deps["react-query"]) {
      analysis += "Data Fetching: React Query\n"
    } else if (deps.swr) {
      analysis += "Data Fetching: SWR\n"
    }

    // Identify database/ORM
    if (deps.mongoose) {
      analysis += "Database: MongoDB (Mongoose)\n"
    } else if (deps.sequelize) {
      analysis += "Database: SQL (Sequelize ORM)\n"
    } else if (deps.prisma) {
      analysis += "Database: Prisma ORM\n"
    } else if (deps.typeorm) {
      analysis += "Database: TypeORM\n"
    }
  }

  // Analyze code structure and patterns from files
  const filePatterns = new Map()

  for (const file of keyFiles) {
    // Check for React components
    if (file.content.includes("React.Component") || file.content.includes("extends Component")) {
      filePatterns.set("React Class Components", (filePatterns.get("React Class Components") || 0) + 1)
    }

    if (file.content.includes("function") && file.content.includes("return (") && file.content.includes("jsx")) {
      filePatterns.set("React Functional Components", (filePatterns.get("React Functional Components") || 0) + 1)
    }

    // Check for hooks
    if (file.content.includes("useState") || file.content.includes("useEffect")) {
      filePatterns.set("React Hooks", (filePatterns.get("React Hooks") || 0) + 1)
    }

    // Check for API routes
    if (
      file.content.includes("app.get(") ||
      file.content.includes("router.get(") ||
      file.content.includes("app.post(") ||
      file.content.includes("router.post(")
    ) {
      filePatterns.set("API Routes", (filePatterns.get("API Routes") || 0) + 1)
    }

    // Check for database operations
    if (
      file.content.includes("mongoose") ||
      file.content.includes("Model.find") ||
      file.content.includes("Model.findById") ||
      file.content.includes("Model.create")
    ) {
      filePatterns.set("Database Operations", (filePatterns.get("Database Operations") || 0) + 1)
    }

    // Check for authentication
    if (
      file.content.includes("jwt") ||
      file.content.includes("passport") ||
      file.content.includes("authenticate") ||
      file.content.includes("authorization")
    ) {
      filePatterns.set("Authentication", (filePatterns.get("Authentication") || 0) + 1)
    }
  }

  // Add code patterns to analysis
  if (filePatterns.size > 0) {
    analysis += "\nCode Patterns:\n"
    for (const [pattern, count] of filePatterns.entries()) {
      analysis += `- ${pattern}: Found in ${count} files\n`
    }
  }

  return analysis
}

