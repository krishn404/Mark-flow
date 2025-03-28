// Export the README generation functions for reuse across the application

export function generateReadme({
  repoInfo,
  contents,
  languages,
  contributors,
  existingReadme,
  packageJson,
  owner,
  repo,
}: any) {
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

  // Get list of files and directories with descriptions
  const filesList = contents
    .map((item: any) => {
      let description = ""
      if (item.name === "package.json") description = " - Project dependencies and scripts"
      else if (item.name === "README.md") description = " - Project documentation"
      else if (item.name === ".gitignore") description = " - Git ignore rules"
      else if (item.name === "LICENSE") description = " - License information"
      else if (item.name.endsWith(".js") || item.name.endsWith(".ts"))
        description = " - JavaScript/TypeScript source file"
      else if (item.name.endsWith(".css") || item.name.endsWith(".scss")) description = " - Stylesheet"
      else if (item.name.endsWith(".html")) description = " - HTML file"
      else if (item.name === "src" || item.name === "app") description = " - Source code directory"
      else if (item.name === "public") description = " - Public assets directory"
      else if (item.name === "tests" || item.name === "__tests__") description = " - Test files directory"

      return `- ${item.type === "dir" ? "📁" : "📄"} **${item.name}**${description}`
    })
    .join("\n")

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

  // Determine project type and features
  const projectType = determineProjectType(contents, languages, packageJson)
  const features = determineFeatures(contents, packageJson, repoInfo)

  // Extract problem statement and solution
  const problemSolution = extractProblemAndSolution(existingReadme, repoInfo.description, projectType)

  // Create README content
  return `# ${repoInfo.name}

${repoInfo.description || "No description provided."}

${problemSolution.problem ? `## Problem Statement\n\n${problemSolution.problem}\n` : ""}

${problemSolution.solution ? `## Solution\n\n${problemSolution.solution}\n` : ""}

## Project Overview

${projectType.description}

${features.length > 0 ? `### Key Features\n\n${features.map((f) => `- ${f}`).join("\n")}\n` : ""}

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

## Project Structure

${filesList}

## Technologies Used

### Languages

${languagesList}

${dependenciesList ? `### Dependencies\n\n${dependenciesList}\n` : ""}

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

## Usage

${generateUsageInstructions(projectType, packageJson)}

## API Documentation

${generateApiDocs(projectType, contents)}

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

export function determineProjectType(contents: any[], languages: any, packageJson: any) {
  // Default type
  let type = {
    name: "Software Project",
    description: "This is a software development project.",
  }

  // Check for package.json to identify Node.js projects
  const hasPackageJson = contents.some((item) => item.name === "package.json")

  // Check for specific frameworks
  if (packageJson) {
    if (packageJson.dependencies) {
      if (packageJson.dependencies.react) {
        type = {
          name: "React Application",
          description: "This is a React-based web application that provides an interactive user interface.",
        }

        if (packageJson.dependencies.next) {
          type = {
            name: "Next.js Application",
            description:
              "This is a Next.js application that provides server-side rendering, static site generation, and API routes for a React-based web application.",
          }
        }
      } else if (packageJson.dependencies.express) {
        type = {
          name: "Express.js API",
          description: "This is an Express.js API that provides RESTful endpoints for client applications.",
        }
      } else if (packageJson.dependencies.vue) {
        type = {
          name: "Vue.js Application",
          description: "This is a Vue.js-based web application that provides an interactive user interface.",
        }
      }
    }
  }

  // Check languages
  const primaryLanguage = Object.entries(languages).sort((a: any, b: any) => b[1] - a[1])[0]?.[0]

  if (primaryLanguage === "Python") {
    const hasDjango = contents.some(
      (item) => item.name === "manage.py" || item.name === "wsgi.py" || item.name === "asgi.py",
    )

    if (hasDjango) {
      type = {
        name: "Django Application",
        description: "This is a Django web application built with Python.",
      }
    } else {
      type = {
        name: "Python Project",
        description: "This is a Python-based software project.",
      }
    }
  } else if (primaryLanguage === "Java") {
    type = {
      name: "Java Project",
      description: "This is a Java-based software project.",
    }
  }

  return type
}

export function determineFeatures(contents: any[], packageJson: any, repoInfo: any) {
  const features = []

  // Check for common features based on files
  if (contents.some((item) => item.name === "Dockerfile" || item.name === "docker-compose.yml")) {
    features.push("Docker containerization for easy deployment")
  }

  if (
    contents.some((item) => item.name === ".github" || item.name === ".gitlab-ci.yml" || item.name === ".travis.yml")
  ) {
    features.push("CI/CD pipeline for automated testing and deployment")
  }

  if (contents.some((item) => item.name.includes("test") || item.name.includes("spec"))) {
    features.push("Comprehensive test suite")
  }

  // Check for features based on package.json
  if (packageJson) {
    if (packageJson.dependencies) {
      if (packageJson.dependencies.redux || packageJson.dependencies["@reduxjs/toolkit"]) {
        features.push("State management with Redux")
      }

      if (packageJson.dependencies.typescript) {
        features.push("Type safety with TypeScript")
      }

      if (packageJson.dependencies.tailwindcss) {
        features.push("Styling with Tailwind CSS")
      }

      if (packageJson.dependencies.graphql) {
        features.push("GraphQL API integration")
      }

      if (packageJson.dependencies.firebase || packageJson.dependencies["@firebase/app"]) {
        features.push("Firebase integration for backend services")
      }
    }
  }

  // Add generic features based on repository description
  if (repoInfo.description) {
    const description = repoInfo.description.toLowerCase()

    if (description.includes("dashboard")) {
      features.push("Interactive dashboard for data visualization")
    }

    if (description.includes("api") || description.includes("backend")) {
      features.push("RESTful API endpoints")
    }

    if (description.includes("auth") || description.includes("login")) {
      features.push("User authentication and authorization")
    }
  }

  return features
}

export function extractProblemAndSolution(existingReadme: string | null, description: string, projectType: any) {
  let problem = ""
  let solution = ""

  // Try to extract from existing README
  if (existingReadme) {
    // Look for problem statement sections
    const problemRegex = /## problem|## challenge|## motivation|## why/i
    const problemMatch = existingReadme.match(new RegExp(`(${problemRegex.source})([\\s\\S]*?)(?=##|$)`, "i"))

    if (problemMatch && problemMatch[2]) {
      problem = problemMatch[2].trim()
    }

    // Look for solution sections
    const solutionRegex = /## solution|## how it works|## approach|## what it does/i
    const solutionMatch = existingReadme.match(new RegExp(`(${solutionRegex.source})([\\s\\S]*?)(?=##|$)`, "i"))

    if (solutionMatch && solutionMatch[2]) {
      solution = solutionMatch[2].trim()
    }
  }

  // If we couldn't extract from README, generate generic ones based on project type
  if (!problem) {
    if (projectType.name === "React Application" || projectType.name === "Next.js Application") {
      problem =
        "Modern web applications require interactive user interfaces that provide a seamless user experience while maintaining performance and accessibility."
    } else if (projectType.name === "Express.js API") {
      problem =
        "Web applications need robust backend services that can handle data processing, authentication, and business logic while providing reliable API endpoints for frontend clients."
    } else if (projectType.name.includes("Python")) {
      problem =
        "Organizations need efficient data processing and automation solutions that can handle complex tasks while remaining maintainable and scalable."
    } else {
      problem =
        "Software development projects often face challenges related to scalability, maintainability, and delivering value to users efficiently."
    }
  }

  if (!solution) {
    if (description) {
      solution = `This project addresses these challenges by providing ${description.toLowerCase()}`
    } else {
      solution = `This ${projectType.name.toLowerCase()} provides a comprehensive solution to these challenges with a focus on code quality, performance, and user experience.`
    }
  }

  return { problem, solution }
}

export function generateUsageInstructions(projectType: any, packageJson: any) {
  let usage = "Here are instructions on how to use this project:"

  if (projectType.name === "React Application" || projectType.name === "Next.js Application") {
    usage = `
After installation, you can:

1. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Open your browser and navigate to \`http://localhost:3000\` to see the application.

3. Build for production:
   \`\`\`bash
   npm run build
   \`\`\`

4. Start the production server:
   \`\`\`bash
   npm start
   \`\`\``
  } else if (projectType.name === "Express.js API") {
    usage = `
After installation, you can:

1. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

2. The API will be available at \`http://localhost:${packageJson?.scripts?.start?.includes("PORT") ? "(specified PORT)" : "3000"}\`.

3. Use tools like Postman or curl to interact with the API endpoints.`
  } else if (projectType.name.includes("Python")) {
    usage = `
After installation, you can:

1. Run the main script:
   \`\`\`bash
   python main.py
   \`\`\`

2. For more specific usage instructions, refer to the documentation or help command:
   \`\`\`bash
   python main.py --help
   \`\`\``
  }

  return usage
}

export function generateApiDocs(projectType: any, contents: any[]) {
  if (projectType.name === "Express.js API" || projectType.name.includes("API")) {
    return `
This project provides the following API endpoints:

### Authentication

- \`POST /api/auth/login\` - Authenticate a user and receive a token
- \`POST /api/auth/register\` - Register a new user
- \`POST /api/auth/logout\` - Logout a user

### Resources

- \`GET /api/resources\` - Get a list of resources
- \`GET /api/resources/:id\` - Get a specific resource
- \`POST /api/resources\` - Create a new resource
- \`PUT /api/resources/:id\` - Update a specific resource
- \`DELETE /api/resources/:id\` - Delete a specific resource

For detailed API documentation, refer to the API documentation file or use the Swagger UI if available.`
  }

  // Check if there's a routes folder or API folder
  const hasApiRoutes = contents.some(
    (item) => item.name === "routes" || item.name === "api" || item.name === "controllers",
  )

  if (hasApiRoutes) {
    return `
This project includes API endpoints. For detailed documentation, refer to the API documentation file or check the routes directory in the source code.`
  }

  return `
API documentation is not applicable for this project type or could not be automatically generated. If this project does include APIs, please document them manually.`
}

