import { Resend } from "resend"
import { BlogNotificationEmail } from "@/components/emails/blog-notification"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const post = await request.json()

    const { title, excerpt, slug, category, tags, featured, published } = post

    if (!title || !slug) {
      return Response.json(
        { error: "Title and slug are required" },
        { status: 400 }
      )
    }

    // In production, save to database here
    // const savedPost = await db.blogPosts.create({ data: post })

    // Send newsletter notification to subscribers if published
    if (published) {
      // In production, fetch subscribers from database
      // const subscribers = await db.subscribers.findMany({ where: { active: true } })
      
      // For demo, send to a test email
      const { data, error } = await resend.emails.send({
        from: "Onyx Insights <newsletter@resend.dev>",
        to: ["delivered@resend.dev"], // In production: subscribers.map(s => s.email)
        subject: `New Article: ${title}`,
        react: BlogNotificationEmail({
          title,
          excerpt: excerpt || "Check out our latest article on the Onyx blog.",
          slug,
          author: "Onyx Team",
          category: category || "General",
          readTime: "5 min read",
        }),
      })

      if (error) {
        console.error("Newsletter send error:", error)
        // Don't fail the publish if email fails
      }
    }

    return Response.json({
      success: true,
      message: published ? "Post published and newsletter sent" : "Post saved as draft",
      post: {
        title,
        slug,
        published,
        publishedAt: published ? new Date().toISOString() : null,
      },
    })
  } catch (error) {
    console.error("Blog publish error:", error)
    return Response.json(
      { error: "Failed to publish blog post" },
      { status: 500 }
    )
  }
}
