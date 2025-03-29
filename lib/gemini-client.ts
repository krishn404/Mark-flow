import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI client
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables")
  }

  return new GoogleGenerativeAI(apiKey)
}

// Generate content using Gemini AI
export async function generateWithGemini(prompt: string, model = "gemini-1.5-pro") {
  try {
    const genAI = getGeminiClient()
    const geminiModel = genAI.getGenerativeModel({ model })

    const result = await geminiModel.generateContent(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error("Error generating content with Gemini:", error)

    // Provide a more specific error message
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Invalid Gemini API key. Please check your API key configuration.")
      }
      if (error.message.includes("quota")) {
        throw new Error("Gemini API quota exceeded. Please try again later.")
      }
    }

    throw new Error("Failed to generate content with Gemini AI. Please try again later.")
  }
}

// Generate README content using Gemini AI
export async function generateReadmeWithGemini(repoData: any) {
  const {
    repoInfo,
    contents,
    languages,
    contributors,
    existingReadme,
    packageJson,
    owner,
    repo,
    codeAnalysis,
    fileContents,
  } = repoData

  // Create a detailed prompt for Gemini
  const prompt = `
Generate a comprehensive, professional README.md file for a GitHub repository. Use standard well-aligned markdown formatting throughout the document. Do not use HTML center tags or other centering methods.

REPOSITORY INFORMATION:
- Name: ${repoInfo.name}
- Description: ${repoInfo.description || "No description provided"}
- Owner: ${owner}
- Created: ${new Date(repoInfo.created_at).toLocaleDateString()}
- Last Updated: ${new Date(repoInfo.updated_at).toLocaleDateString()}
- Stars: ${repoInfo.stargazers_count}
- Forks: ${repoInfo.forks_count}
- Open Issues: ${repoInfo.open_issues_count}
- License: ${repoInfo.license ? repoInfo.license.name : "Not specified"}

LANGUAGES:
${Object.entries(languages)
  .map(([lang, bytes]: [string, any]) => {
    const percentage = ((bytes / Object.values(languages).reduce((sum: any, b: any) => sum + b, 0)) * 100).toFixed(1)
    return `- ${lang}: ${percentage}%`
  })
  .join("\n")}

PROJECT STRUCTURE:
${contents
  .map((item: any) => {
    return `- ${item.type === "dir" ? "Directory" : "File"}: ${item.name}`
  })
  .join("\n")}

${
  packageJson
    ? `DEPENDENCIES:
${Object.entries({ ...packageJson.dependencies, ...packageJson.devDependencies })
  .map(([name, version]: [string, any]) => `- ${name}: ${version}`)
  .join("\n")}`
    : ""
}

${
  codeAnalysis
    ? `CODE ANALYSIS:
${codeAnalysis}`
    : ""
}

${
  fileContents && fileContents.length > 0
    ? `KEY FILES CONTENT:
${fileContents.map((file: any) => `--- ${file.path} ---\n${file.content.substring(0, 500)}...\n`).join("\n")}`
    : ""
}

CONTRIBUTORS:
${contributors.map((contributor: any) => `- ${contributor.login}: ${contributor.contributions} contributions`).join("\n")}

INSTRUCTIONS:
1. Create a comprehensive README.md in markdown format.
2. Start with a title (the repository name) and a brief description.
3. Include badges for license, version, and build status if applicable.
4. Add a "Problem Statement" section that identifies what problem this project solves.
5. Add a "Solution" section that explains how the project solves the problem.
6. Create a "Features" section highlighting the key capabilities.
7. Include a detailed "Tech Stack" section explaining the technologies used and why.
8. Add an "Architecture" section explaining the code structure and design patterns.
9. Include "Installation" and "Usage" sections with clear instructions.
10. Add "API Documentation" if the project has an API.
11. Include "Contributing" guidelines and acknowledgments of contributors.
12. Make the README visually appealing with appropriate formatting, headings, and code blocks.
13. Focus on explaining the project's functionality, logic, and technical implementation in a clear, professional manner.

The README should be comprehensive but concise, focusing on helping developers understand the project quickly.
`

  try {
    const readmeContent = await generateWithGemini(prompt)
    return readmeContent
  } catch (error) {
    console.error("Error generating README with Gemini:", error)

    // Fallback to a basic README if Gemini fails
    if (error instanceof Error && error.message.includes("Gemini API")) {
      return generateBasicReadme(repoData)
    }

    throw error
  }
}

// Fallback function to generate a basic README without AI
function generateBasicReadme(repoData: any) {
  const { repoInfo, languages, contributors, packageJson, owner, repo } = repoData

  // Format date
  const lastUpdated = new Date(repoInfo.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const createdAt = new Date(repoInfo.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Format languages with percentages
  const totalBytes = Object.values(languages).reduce((sum: any, bytes: any) => sum + bytes, 0)
  const languagesList = Object.entries(languages)
    .map(([lang, bytes]: [string, any]) => {
      const percentage = ((bytes / totalBytes) * 100).toFixed(1)
      return `- **${lang}**: ${percentage}%`
    })
    .join("\n")

  // Format contributors
  const contributorsList = contributors
    .map(
      (contributor: any) =>
        `- [${contributor.login}](${contributor.html_url}) - ${contributor.contributions} contributions`,
    )
    .join("\n")

  // Extract dependencies if package.json exists
  let dependenciesList = ""
  if (packageJson) {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
    dependenciesList = Object.entries(dependencies || {})
      .map(([name, version]: [string, any]) => `- **${name}**: ${version}`)
      .join("\n")
  }

  // Create README content
  return `# ${repoInfo.name}

${repoInfo.description || "No description provided."}

## Project Overview

This is a software development project.

## Repository Information

- **Owner:** [${owner}](https://github.com/${owner})
- **Repository:** [${repo}](${repoInfo.html_url})
- **Created:** ${createdAt}
- **Last Updated:** ${lastUpdated}
- **Stars:** ${repoInfo.stargazers_count}
- **Forks:** ${repoInfo.forks_count}
- **Watchers:** ${repoInfo.watchers_count}
- **Open Issues:** ${repoInfo.open_issues_count}
- **License:** ${repoInfo.license ? repoInfo.license.name : "Not specified"}

## Technologies Used

### Languages

${languagesList}

${
  dependenciesList
    ? `### Dependencies

${dependenciesList}
`
    : ""
}

## Installation

\`\`\`bash
# Clone the repository
git clone ${repoInfo.clone_url}

# Navigate to the directory
cd ${repo}

${
  packageJson
    ? `# Install dependencies
npm install

# Run the project
npm ${packageJson.scripts && packageJson.scripts.start ? "start" : "run dev"}`
    : "# Install dependencies (if applicable)"
}
\`\`\`

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

### Contributors

${contributorsList}

## Additional Resources

- [Issues](${repoInfo.html_url}/issues)
- [Pull Requests](${repoInfo.html_url}/pulls)
- [Wiki](${repoInfo.html_url}/wiki)
${repoInfo.homepage ? `- [Project Homepage](${repoInfo.homepage})` : ""}

## License

This project is licensed under the ${repoInfo.license ? repoInfo.license.name : "No License Specified"} - see the LICENSE file for details.

---

Generated by [GitHub Repository README Generator](https://github.com/readme-generator)
`
}

