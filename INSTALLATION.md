# Installation & Setup Instructions

## Prerequisites

- **Node.js 18+** or **Bun runtime**
- **npm**, **yarn**, or **bun** package manager
- **Mindbody Developer Account** - Get credentials at [developers.mindbodyonline.com](https://developers.mindbodyonline.com/)
- **OpenRouter Account** - Get API key at [openrouter.ai](https://openrouter.ai/)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mindbody
```

### 2. Install Dependencies

```bash
npm install
```

**Important:** This will install the new AI SDK dependencies:
- `@ai-sdk/openai` - OpenRouter integration
- `@ai-sdk/react` - React hooks for AI chat
- `ai` - Vercel AI SDK core

### 3. Get Your API Keys

#### Mindbody API Credentials

1. Go to [Mindbody Developer Portal](https://developers.mindbodyonline.com/)
2. Sign in or create an account
3. Create a new API application
4. Note down:
   - API Key
   - Site ID (use `-99` for all sites)
   - Source Name
   - Source Password

#### OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to **Keys** section
4. Click **Create Key**
5. Copy your API key (starts with `sk-or-v1-`)

**Cost:** OpenRouter uses pay-as-you-go pricing. With Claude 3.5 Sonnet:
- Most conversations cost less than $0.01
- Typical usage: $5-10/month for a small studio

### 4. Configure Environment Variables

Run the setup script:

```bash
npm run setup
```

Or manually create `.env.local`:

```bash
# Mindbody API Configuration
MINDBODY_API_KEY=your_mindbody_api_key
MINDBODY_SITE_ID=-99
MINDBODY_SOURCE_NAME=your_source_name
MINDBODY_SOURCE_PASSWORD=your_source_password

# OpenRouter Configuration (Required for AI chat)
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_key

# Optional: Choose AI model (defaults to claude-3.5-sonnet)
DEFAULT_MODEL=anthropic/claude-3.5-sonnet

# Optional: Mindbody settings
MINDBODY_API_URL=https://api.mindbodyonline.com/public/v6
CACHE_TTL_MINUTES=5
```

### 5. Verify Configuration

Check that your `.env.local` file has all required variables:

```bash
# Should see all your keys (masked)
cat .env.local
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Test the Chat

Try these sample queries:

- "Show me today's classes"
- "List all staff members"
- "What are our locations?"
- "Find client John Smith"

## Troubleshooting

### Error: "Cannot find module '@ai-sdk/openai'"

**Solution:** Install dependencies:

```bash
npm install
```

### Error: "OpenRouter API key not configured"

**Solution:** Make sure you have `OPENROUTER_API_KEY` in `.env.local`:

```bash
echo "OPENROUTER_API_KEY=sk-or-v1-xxx" >> .env.local
```

### Error: "Mindbody credentials not configured"

**Solution:** Verify all Mindbody variables are set:

```bash
grep MINDBODY .env.local
```

### Error: "Failed to connect to MCP server"

**Solution:** Install Bun runtime:

```bash
curl -fsSL https://bun.sh/install | bash
```

Or modify `lib/mcp-client.ts` to use `npx` instead:

```typescript
command: "npx",
args: ["-y", "github:vespo92/MindbodyMCP"]
```

### Slow or No Responses

**Possible causes:**

1. **OpenRouter API key invalid** - Check your key at openrouter.ai
2. **Network issues** - Check internet connection
3. **Rate limiting** - Add credit card to OpenRouter account
4. **Model selection** - Try a different model:

```env
DEFAULT_MODEL=anthropic/claude-3.5-haiku
```

### Type Errors in VS Code

**Solution:** Restart TypeScript server:
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
- Type "TypeScript: Restart TS Server"
- Press Enter

## Available Models

You can change the AI model in `.env.local`:

### Fast & Budget-Friendly

```env
DEFAULT_MODEL=anthropic/claude-3.5-haiku
```
**Cost:** ~$0.25 per 1M input tokens

### Balanced (Default)

```env
DEFAULT_MODEL=anthropic/claude-3.5-sonnet
```
**Cost:** ~$3 per 1M input tokens

### Most Powerful

```env
DEFAULT_MODEL=anthropic/claude-3-opus
```
**Cost:** ~$15 per 1M input tokens

### OpenAI Alternative

```env
DEFAULT_MODEL=openai/gpt-4o
```
**Cost:** ~$5 per 1M input tokens

See all available models: [openrouter.ai/models](https://openrouter.ai/models)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `MINDBODY_API_KEY`
   - `MINDBODY_SITE_ID`
   - `MINDBODY_SOURCE_NAME`
   - `MINDBODY_SOURCE_PASSWORD`
   - `OPENROUTER_API_KEY`
4. Deploy!

### Other Platforms

Requirements:
- Node.js 18+ runtime
- Bun installed (for MCP server)
- Environment variables configured
- Build command: `npm run build`
- Start command: `npm start`

## Project Structure

```
mindbody/
├── app/
│   ├── api/
│   │   └── chat/route.ts       # AI-powered chat API
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page
├── components/
│   └── Chat.tsx                # Chat interface (useChat hook)
├── lib/
│   ├── mcp-client.ts          # MCP server connection
│   ├── mindbody-tools.ts      # AI SDK tool definitions
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Utility functions
└── scripts/
    └── setup.sh               # Environment setup
```

## Next Steps

1. **Read the docs:**
   - [AI_SDK_MIGRATION.md](./AI_SDK_MIGRATION.md) - Learn about AI features
   - [SETUP.md](./SETUP.md) - Detailed configuration guide
   - [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Technical details

2. **Customize:**
   - Add more tools in `lib/mindbody-tools.ts`
   - Modify UI in `components/Chat.tsx`
   - Adjust AI behavior in `app/api/chat/route.ts`

3. **Deploy:**
   - Push to GitHub
   - Deploy on Vercel
   - Share with your team!

## Support

### Documentation
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Mindbody API Docs](https://developers.mindbodyonline.com/PublicDocumentation/V6)
- [MindbodyMCP GitHub](https://github.com/vespo92/MindbodyMCP)

### Issues
- **AI/OpenRouter issues**: Check [sdk.vercel.ai](https://sdk.vercel.ai)
- **MCP issues**: [MindbodyMCP Issues](https://github.com/vespo92/MindbodyMCP/issues)
- **Mindbody API**: [Developer Portal](https://developers.mindbodyonline.com/)

## FAQ

### Q: Do I need both Mindbody AND OpenRouter?

**A:** Yes. Mindbody provides the data, OpenRouter provides the AI that interprets it.

### Q: How much does OpenRouter cost?

**A:** Pay-as-you-go. Most studios spend $5-10/month. First $1 is usually free credits.

### Q: Can I use a different AI model?

**A:** Yes! Set `DEFAULT_MODEL` in `.env.local`. See [openrouter.ai/models](https://openrouter.ai/models)

### Q: Does this work offline?

**A:** No. Requires internet for both Mindbody API and OpenRouter API.

### Q: Can I self-host the AI?

**A:** Not with this setup, but you could modify the code to use a local LLM via Ollama.

### Q: Is my data secure?

**A:** Yes. Credentials are stored in `.env.local` (not committed to git). API calls are over HTTPS.

---

**Ready to chat with your Mindbody data!** 🚀

If you run into issues, check the troubleshooting section above or review the documentation.

