import { AIClient } from "../ai/ai-client"

// Define the code generation request interface
export interface CodeGenerationRequest {
  language: string
  description: string
  context?: string
  framework?: string
  libraries?: string[]
  examples?: string[]
}

// Define the code generation result interface
export interface CodeGenerationResult {
  code: string
  explanation: string
  language: string
  suggestions?: string[]
}

// Define the code review request interface
export interface CodeReviewRequest {
  code: string
  language: string
  focus?: Array<"security" | "performance" | "readability" | "maintainability" | "bugs">
}

// Define the code review result interface
export interface CodeReviewResult {
  issues: Array<{
    type: "security" | "performance" | "readability" | "maintainability" | "bug"
    severity: "low" | "medium" | "high" | "critical"
    line?: number
    description: string
    suggestion: string
  }>
  summary: string
  score: number
  suggestions: string[]
}

// Code generator class
export class CodeGenerator {
  private aiClient: AIClient

  constructor(apiKey: string, model = "gpt-4o") {
    this.aiClient = new AIClient("openai", apiKey, model)
  }

  // Generate code
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    // Prepare the prompt
    const prompt = this.buildCodeGenerationPrompt(request)

    // Call the AI model
    const response = await this.aiClient.createChatCompletion({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert software developer specializing in ${request.language}${request.framework ? ` and ${request.framework}` : ""}. 
Your task is to generate clean, efficient, and well-documented code based on the user's description.
Always include comments explaining key parts of the code.
Format your response as follows:
1. The code block with proper syntax highlighting
2. An explanation of how the code works
3. Any suggestions for improvements or alternatives`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    })

    // Parse the response
    const content = response.choices[0].message.content || ""

    // Extract code, explanation, and suggestions
    const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/)
    const code = codeMatch ? codeMatch[1] : ""

    const explanationMatch = content.match(/```[\w]*\n[\s\S]*?```\s*([\s\S]*?)(?:##|$)/)
    const explanation = explanationMatch ? explanationMatch[1].trim() : ""

    const suggestionsMatch = content.match(/(?:##\s*Suggestions|Suggestions:)\s*([\s\S]*?)(?:##|$)/i)
    const suggestionsText = suggestionsMatch ? suggestionsMatch[1].trim() : ""
    const suggestions = suggestionsText
      ? suggestionsText
          .split("\n")
          .map((s) => s.replace(/^\d+\.\s*/, "").trim())
          .filter((s) => s)
      : undefined

    return {
      code,
      explanation,
      language: request.language,
      suggestions,
    }
  }

  // Build the code generation prompt
  private buildCodeGenerationPrompt(request: CodeGenerationRequest): string {
    let prompt = `Generate ${request.language} code for: ${request.description}\n\n`

    if (request.context) {
      prompt += `Context: ${request.context}\n\n`
    }

    if (request.framework) {
      prompt += `Framework: ${request.framework}\n\n`
    }

    if (request.libraries && request.libraries.length > 0) {
      prompt += `Libraries to use: ${request.libraries.join(", ")}\n\n`
    }

    if (request.examples && request.examples.length > 0) {
      prompt += `Examples for reference:\n\n`
      for (const example of request.examples) {
        prompt += `${example}\n\n`
      }
    }

    return prompt
  }

  // Review code
  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResult> {
    // Prepare the prompt
    const prompt = this.buildCodeReviewPrompt(request)

    // Call the AI model
    const response = await this.aiClient.createChatCompletion({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert code reviewer specializing in ${request.language}. 
Your task is to review the provided code and identify issues related to ${request.focus ? request.focus.join(", ") : "security, performance, readability, maintainability, and bugs"}.
Format your response as JSON with the following structure:
{
  "issues": [
    {
      "type": "security|performance|readability|maintainability|bug",
      "severity": "low|medium|high|critical",
      "line": 42,
      "description": "Description of the issue",
      "suggestion": "Suggestion to fix the issue"
    }
  ],
  "summary": "Overall summary of the code review",
  "score": 85,
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 4000,
      response_format: {
        type: "json_object",
      },
    })

    // Parse the response
    const content = response.choices[0].message.content || ""

    try {
      const result = JSON.parse(content) as CodeReviewResult
      return result
    } catch (error) {
      console.error("Error parsing code review result:", error)
      throw new Error("Failed to parse code review result")
    }
  }

  // Build the code review prompt
  private buildCodeReviewPrompt(request: CodeReviewRequest): string {
    let prompt = `Review the following ${request.language} code:\n\n`

    prompt += `\`\`\`${request.language}\n${request.code}\n\`\`\`\n\n`

    if (request.focus && request.focus.length > 0) {
      prompt += `Focus on the following aspects: ${request.focus.join(", ")}\n\n`
    }

    return prompt
  }
}
