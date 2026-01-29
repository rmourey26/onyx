"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Eye, Save, Send, Code, FileText, Settings, Trash2 } from "lucide-react"

interface BlogPost {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featured: boolean
  published: boolean
}

const defaultPost: BlogPost = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Product",
  tags: [],
  featured: false,
  published: false,
}

// HTML template for blog posts
const htmlTemplate = `<article class="prose prose-lg dark:prose-invert max-w-none">
  <header class="mb-8">
    <h1 class="text-4xl font-bold heading-gradient mb-4">{{title}}</h1>
    <p class="text-xl text-muted-foreground">{{excerpt}}</p>
  </header>

  <section class="my-8">
    <h2 class="text-2xl font-semibold mb-4">Introduction</h2>
    <p class="text-foreground leading-relaxed">
      Your introduction paragraph here. Use Tailwind classes for styling.
    </p>
  </section>

  <section class="my-8">
    <h2 class="text-2xl font-semibold mb-4">Main Content</h2>
    <p class="text-foreground leading-relaxed mb-4">
      Your main content here.
    </p>
    
    <div class="glass-panel p-6 my-6">
      <h3 class="text-lg font-medium mb-2">Key Highlight</h3>
      <p class="text-muted-foreground">Important information in a styled box.</p>
    </div>

    <ul class="list-disc list-inside space-y-2 my-4">
      <li>First point</li>
      <li>Second point</li>
      <li>Third point</li>
    </ul>
  </section>

  <section class="my-8">
    <h2 class="text-2xl font-semibold mb-4">Code Example</h2>
    <pre class="code-block"><code class="text-green-400">// Your code here
const example = "Hello World";
console.log(example);</code></pre>
  </section>

  <section class="my-8 enterprise-card p-6">
    <h3 class="text-xl font-semibold mb-2">Call to Action</h3>
    <p class="text-muted-foreground mb-4">Encourage readers to take action.</p>
    <button class="btn-tech">Get Started</button>
  </section>
</article>`

export default function BlogAdminPage() {
  const [post, setPost] = useState<BlogPost>(defaultPost)
  const [tagInput, setTagInput] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    setPost({
      ...post,
      title,
      slug: generateSlug(title),
    })
  }

  const addTag = () => {
    if (tagInput && !post.tags.includes(tagInput.toLowerCase())) {
      setPost({
        ...post,
        tags: [...post.tags, tagInput.toLowerCase()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setPost({
      ...post,
      tags: post.tags.filter((t) => t !== tag),
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In production, save to database
      console.log("Saving post:", post)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Post saved successfully!")
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    setSaving(true)
    try {
      // In production, publish and send newsletter
      const response = await fetch("/api/blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, published: true }),
      })
      
      if (response.ok) {
        setPost({ ...post, published: true })
        alert("Post published and newsletter sent!")
      }
    } catch (error) {
      console.error("Publish error:", error)
    } finally {
      setSaving(false)
    }
  }

  const insertTemplate = () => {
    setPost({
      ...post,
      content: htmlTemplate
        .replace("{{title}}", post.title || "Your Title")
        .replace("{{excerpt}}", post.excerpt || "Your excerpt"),
    })
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container-tech max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold heading-gradient">Blog Admin</h1>
            <p className="text-muted-foreground mt-1">Create and publish blog posts</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={saving} className="gap-2 bg-transparent">
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} disabled={saving} className="btn-tech gap-2">
              <Send className="w-4 h-4" />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="content" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="html" className="gap-2">
                  <Code className="w-4 h-4" />
                  HTML Editor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle>Post Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter post title"
                        value={post.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="input-tech"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={post.slug}
                        onChange={(e) => setPost({ ...post, slug: e.target.value })}
                        className="input-tech"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        placeholder="Brief description for previews"
                        value={post.excerpt}
                        onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                        className="input-tech min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="html">
                <Card className="glass-panel">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>HTML Content</CardTitle>
                      <CardDescription>
                        Write HTML with Tailwind CSS classes
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={insertTemplate}>
                      Insert Template
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {previewMode ? (
                      <div
                        className="min-h-[500px] p-6 bg-background rounded-lg border"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    ) : (
                      <Textarea
                        placeholder="<article>Your HTML content here...</article>"
                        value={post.content}
                        onChange={(e) => setPost({ ...post, content: e.target.value })}
                        className="font-mono text-sm min-h-[500px] input-tech"
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Post Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={post.category}
                    onValueChange={(value) => setPost({ ...post, category: value })}
                  >
                    <SelectTrigger className="input-tech">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="AI">AI</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="input-tech"
                    />
                    <Button variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured Post</Label>
                  <Switch
                    id="featured"
                    checked={post.featured}
                    onCheckedChange={(checked) => setPost({ ...post, featured: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="published">Published</Label>
                  <Switch
                    id="published"
                    checked={post.published}
                    onCheckedChange={(checked) => setPost({ ...post, published: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Available CSS Classes</CardTitle>
                <CardDescription>Use these in your HTML</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <code className="block p-2 bg-muted rounded">.glass-panel</code>
                  <code className="block p-2 bg-muted rounded">.enterprise-card</code>
                  <code className="block p-2 bg-muted rounded">.heading-gradient</code>
                  <code className="block p-2 bg-muted rounded">.btn-tech</code>
                  <code className="block p-2 bg-muted rounded">.code-block</code>
                  <code className="block p-2 bg-muted rounded">.badge-tech</code>
                  <code className="block p-2 bg-muted rounded">.divider-tech</code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
