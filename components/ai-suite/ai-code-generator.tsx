"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Code, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generateCode } from "@/app/actions/ai-actions" // Import the action
import type { AIModel } from "@/lib/types/database"

interface AICodeGeneratorProps {
  user: any
  aiModels: AIModel[]
}

export function AICodeGenerator({ user, aiModels }: AICodeGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [language, setLanguage] = useState("typescript")
  const [framework, setFramework] = useState("")
  const [selectedModel, setSelectedModel] = useState<string>(
    aiModels.find((m) => m.model_id === "gpt-5")?.model_id ||
      aiModels.find((m) => m.model_id === "gpt-4.1")?.model_id ||
      aiModels.find((m) => m.model_id === "gpt-4o")?.model_id ||
      "gpt-4o",
  )
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")
  const [explanation, setExplanation] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    setGeneratedCode("")
    setExplanation("")
    setSuggestions([])

    try {
      const result = await generateCode({
        language,
        description: prompt,
        framework: framework || undefined,
        model: selectedModel,
      })

      if (result.success) {
        setGeneratedCode(result.code)
        setExplanation(result.explanation)
        setSuggestions(result.suggestions || [])
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating code:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const languageOptions = [
    { value: "typescript", label: "TypeScript" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "ruby", label: "Ruby" },
    { value: "php", label: "PHP" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "sql", label: "SQL" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
  ]

  const frameworkOptions = [
    { value: "none", label: "None" },
    { value: "react", label: "React" },
    { value: "next.js", label: "Next.js" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "express", label: "Express" },
    { value: "django", label: "Django" },
    { value: "flask", label: "Flask" },
    { value: "spring", label: "Spring" },
    { value: "laravel", label: "Laravel" },
    { value: "rails", label: "Ruby on Rails" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Code Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {aiModels
                    .filter((model) => model.capabilities.includes("text") || model.capabilities.includes("coding"))
                    .sort((a, b) => {
                      const modelPriority = (model: string) => {
                        if (model.includes("gpt-5")) return 1000
                        if (model.includes("gpt-4.1")) return 900
                        if (model.includes("gpt-4o")) return 800
                        return 0
                      }
                      return modelPriority(b.model_id) - modelPriority(a.model_id)
                    })
                    .map((model) => (
                      <SelectItem key={model.model_id} value={model.model_id}>
                        {model.name}
                        {(model.model_id.includes("gpt-5") || model.model_id.includes("gpt-4.1")) && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 rounded">NEW</span>
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Programming Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value || ""}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Framework (Optional)</label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworkOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value || ""}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Describe what you want to build</label>
              <Textarea
                placeholder="E.g., Create a function that sorts an array of objects by a specific property..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={isLoading || !prompt.trim()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Code className="mr-2 h-4 w-4" />
                  Generate Code
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Generated Code</span>
              {generatedCode && (
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {generatedCode ? (
              <Tabs defaultValue="code">
                <TabsList>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="explanation">Explanation</TabsTrigger>
                  {suggestions.length > 0 && <TabsTrigger value="suggestions">Suggestions</TabsTrigger>}
                </TabsList>
                <TabsContent value="code" className="mt-4">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    <code className="text-sm">{generatedCode}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="explanation" className="mt-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{explanation}</p>
                  </div>
                </TabsContent>
                {suggestions.length > 0 && (
                  <TabsContent value="suggestions" className="mt-4">
                    <ul className="list-disc pl-5 space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <Code className="h-12 w-12 mb-4" />
                <p>Your generated code will appear here</p>
                <p className="text-sm mt-2">Describe what you want to build and click "Generate Code" to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
