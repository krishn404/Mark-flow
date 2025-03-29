import OpenAI from 'openai';

// Initialize OpenAI client
export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not defined in environment variables");
  }

  return new OpenAI({ apiKey });
}

// Generate README content using OpenAI
export async function generateReadmeWithOpenAI(repoData: any) {
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
  } = repoData;

  const prompt = `Generate a comprehensive README.md file for a GitHub repository.
  Use this repository data to generate accurate, specific content:

  Repository Information:
  ${JSON.stringify(repoInfo, null, 2)}

  Code Structure:
  ${JSON.stringify(contents, null, 2)}

  Languages Used:
  ${JSON.stringify(languages, null, 2)}

  Contributors:
  ${JSON.stringify(contributors, null, 2)}

  Package.json (if exists):
  ${packageJson ? JSON.stringify(packageJson, null, 2) : 'Not available'}

  Code Analysis:
  ${codeAnalysis || 'Not available'}

  Key Files Content:
  ${fileContents ? fileContents.map((f: any) => `${f.path}:\n${f.content}`).join('\n\n') : 'Not available'}

  Generate a detailed README.md that includes:
  1. Project title and description
  2. Features and capabilities
  3. Technical architecture and implementation details
  4. Installation and usage instructions
  5. API documentation if applicable
  6. Contributing guidelines
  7. License information

  Format the response in Markdown.`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a technical documentation expert that specializes in creating comprehensive README files for software projects."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    throw error;
  }
} 