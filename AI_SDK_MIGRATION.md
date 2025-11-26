# AI SDK Migration Guide

This project has been upgraded to use the **Vercel AI SDK** with **OpenRouter** for intelligent chat responses!

## What Changed?

### Before (Simple Intent Detection)
- Basic pattern matching to detect what users were asking
- Limited to predefined queries
- No streaming responses
- Manual tool selection

### After (AI-Powered with OpenRouter)
- **AI understands natural language** - Ask anything in any way
- **Streaming responses** - See answers appear in real-time
- **Intelligent tool selection** - AI decides which Mindbody tools to use
- **Multi-step reasoning** - AI can call multiple tools to answer complex questions
- **Better conversation flow** - More natural, context-aware responses

## Architecture

```
User Question
    ↓
Next.js API Route
    ↓
OpenRouter (Claude 3.5 Sonnet)
    ↓
AI decides which tools to call
    ↓
MCP Client → MindbodyMCP Server → Mindbody API
    ↓
AI formats and streams response
    ↓
Beautiful UI with tool call badges
```

## New Dependencies

```json
{
  "@ai-sdk/openai": "^1.0.0",    // OpenAI/OpenRouter integration
  "@ai-sdk/react": "^1.0.0",     // React hooks for AI chat
  "ai": "^4.0.0"                  // Vercel AI SDK core
}
```

## Configuration

### Required Environment Variables

```env
# Mindbody (existing)
MINDBODY_API_KEY=xxx
MINDBODY_SITE_ID=-99
MINDBODY_SOURCE_NAME=xxx
MINDBODY_SOURCE_PASSWORD=xxx

# OpenRouter (NEW)
OPENROUTER_API_KEY=sk-or-v1-xxx

# Optional: Choose your model
DEFAULT_MODEL=anthropic/claude-3.5-sonnet
```

### Get Your OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up or log in
3. Go to **Keys** section
4. Create a new API key
5. Add it to your `.env.local` file

**Cost**: OpenRouter has pay-as-you-go pricing. Claude 3.5 Sonnet costs approximately:
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

A typical conversation costs less than $0.01!

## Available Models

You can change the model in `.env.local`:

### Recommended Models

```env
# Best overall (default)
DEFAULT_MODEL=anthropic/claude-3.5-sonnet

# Faster & cheaper
DEFAULT_MODEL=anthropic/claude-3.5-haiku

# Most powerful
DEFAULT_MODEL=anthropic/claude-3-opus

# OpenAI alternative
DEFAULT_MODEL=openai/gpt-4o

# Budget option
DEFAULT_MODEL=google/gemini-pro-1.5
```

See all models at: https://openrouter.ai/models

## Code Changes

### Backend (`app/api/chat/route.ts`)

**Before:**
```typescript
// Manual intent detection
if (lowerMessage.includes("class")) {
  return callMCPTool("getClasses", args);
}
```

**After:**
```typescript
// AI-powered with streaming
const result = streamText({
  model: openrouter("anthropic/claude-3.5-sonnet"),
  messages: convertToCoreMessages(messages),
  tools: mindbodyTools,  // AI decides which to use
});
return result.toDataStreamResponse();
```

### Frontend (`components/Chat.tsx`)

**Before:**
```typescript
const [messages, setMessages] = useState([]);
// Manual message handling
```

**After:**
```typescript
const { messages, input, handleSubmit, isLoading } = useChat({
  api: "/api/chat"
});
// Automatic streaming & state management
```

### Tools (`lib/mindbody-tools.ts`)

**New file** that adapts MCP tools to AI SDK format:

```typescript
export function createMindbodyTools(): Record<string, CoreTool> {
  return {
    getClasses: {
      description: "Get class schedules...",
      parameters: z.object({ /* zod schema */ }),
      execute: async (args) => callMCPTool("getClasses", args)
    }
  };
}
```

## New Features

### 1. Natural Language Understanding

**Before:**
- ❌ "Show me today's yoga classes" ✅
- ❌ "What yoga classes do we have today?" ❌

**After:**
- ✅ "Show me today's yoga classes"
- ✅ "What yoga classes do we have today?"
- ✅ "I want to see yoga for today"
- ✅ "Any yoga happening now?"

### 2. Multi-Step Reasoning

The AI can now handle complex questions that require multiple tools:

**Example:**
> "Find client Sarah Johnson and show me her class attendance this month"

**AI automatically:**
1. Calls `getClients` with search "Sarah Johnson"
2. Takes the client ID from results
3. Calls `getClientVisits` with that ID and date range
4. Formats the results nicely

### 3. Streaming Responses

- See the AI "thinking" with animated dots
- Watch responses appear word-by-word
- Tool call badges show what's happening
- Much better user experience

### 4. Context Awareness

The AI understands:
- Date references ("today", "tomorrow", "this week")
- Follow-up questions
- Implicit requests
- Error handling and retries

## UI Improvements

### Tool Call Badges

When the AI uses tools, you see beautiful badges:

```
📅 Classes    👥 Clients    ⏳ Waitlist
```

Each tool has:
- Custom icon
- Color coding
- Friendly label

### Dashboard

- Welcome screen with quick prompts
- Metric cards showing available features
- Sample questions to get started
- Toggle to show/hide

### Messages

- Gradient backgrounds for user messages
- Clean white cards for AI responses
- Loading animations
- Error states with helpful messages

## Testing

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example
cp .env.example .env.local

# Edit with your keys
nano .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Try These Queries

**Simple:**
- "Show me today's classes"
- "List all staff members"
- "What are our locations?"

**Complex:**
- "Find any yoga classes happening this week and tell me which instructors are teaching"
- "Search for client John Smith and show me his recent visits"
- "Who's on the waitlist for classes today?"

**Creative:**
- "I need to book Sarah into tomorrow's yoga class"
- "Give me a summary of our class schedule for the next 3 days"
- "Show me which staff members are working this week"

## Troubleshooting

### "OpenRouter API key not configured"

Make sure you have `OPENROUTER_API_KEY` in `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxx
```

### Slow Responses

Try a faster model:

```env
DEFAULT_MODEL=anthropic/claude-3.5-haiku
```

### Rate Limits

OpenRouter has generous rate limits, but if you hit them:
- Add a credit card to OpenRouter
- Or switch to a different model

### Tool Calls Not Working

Check that:
1. MCP server is running (happens automatically)
2. Mindbody credentials are configured
3. You have network access
4. Bun is installed (`curl -fsSL https://bun.sh/install | bash`)

## Benefits Summary

| Feature | Before | After |
|---------|--------|-------|
| **Natural Language** | Limited patterns | Full understanding |
| **Response Speed** | All at once | Streaming |
| **Tool Selection** | Manual | AI-powered |
| **Multi-step** | Not supported | Automatic |
| **Error Handling** | Basic | Intelligent retry |
| **UI/UX** | Simple | Beautiful |
| **Conversation** | Single-turn | Context-aware |

## Cost Estimate

Based on Claude 3.5 Sonnet pricing:

- **100 questions/day**: ~$0.30-0.50/day
- **1000 questions/day**: ~$3-5/day
- **Average conversation**: < $0.01

Most studios will spend **less than $10/month** on AI costs.

## Migration Checklist

- [x] Install AI SDK dependencies
- [x] Add OpenRouter configuration
- [x] Create tools adapter
- [x] Rewrite chat API route
- [x] Update frontend with useChat
- [x] Add beautiful UI components
- [x] Remove old intent detection code
- [x] Update documentation

## Next Steps

1. **Get OpenRouter key**: https://openrouter.ai/
2. **Add to .env.local**: `OPENROUTER_API_KEY=sk-or-v1-xxx`
3. **Install dependencies**: `npm install`
4. **Run the app**: `npm run dev`
5. **Start chatting!** 🎉

## Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [MindbodyMCP GitHub](https://github.com/vespo92/MindbodyMCP)
- [Available Models](https://openrouter.ai/models)

---

**Enjoy your AI-powered Mindbody assistant!** 🚀

