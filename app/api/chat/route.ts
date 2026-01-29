import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: `You are Onyx AI, an intelligent assistant for the Onyx enterprise platform. You help users with:
- Understanding blockchain and Web3 technologies
- Digital identity management and security best practices
- AI agent configuration and workflows
- General questions about the Onyx platform

Be helpful, concise, and professional. Use technical terminology appropriately but explain complex concepts when needed.
If you don't know something, say so rather than making up information.`,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: allMessages, isAborted }) => {
      if (isAborted) return
      // In production, save chat history to database
      // await saveChat({ chatId, messages: allMessages })
    },
    consumeSseStream: consumeStream,
  })
}
