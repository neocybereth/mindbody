# Mindbody Chat Interface

A beautiful, modern chat interface for interacting with Mindbody data using the Model Context Protocol (MCP).

![Mindbody Chat](https://img.shields.io/badge/Mindbody-Chat-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MCP](https://img.shields.io/badge/MCP-Enabled-green)

## ✨ Features

- 🤖 **AI-Powered Chat** - Intelligent responses using Claude 3.5 Sonnet via OpenRouter
- 💬 **Natural Language** - Ask anything in any way, AI understands context
- 📡 **Streaming Responses** - See answers appear in real-time
- 🔄 **Real-time MCP Integration** - Direct connection to MindbodyMCP server
- 🎨 **Beautiful UI** - Modern dashboard with Cortex-inspired design
- 🚀 **Zero MCP Setup** - Uses MCP server directly from GitHub
- 🧠 **Multi-Step Reasoning** - AI can chain multiple tools to answer complex questions
- 📊 **Rich Formatting** - Beautiful display of classes, clients, and more

## 🚀 Quick Start

1. **Clone and Install**

   ```bash
   git clone <your-repo>
   cd mindbody
   npm install
   ```

2. **Configure Environment**

   Create `.env.local`:

   ```env
   # Mindbody credentials
   MINDBODY_API_KEY=your_api_key
   MINDBODY_SITE_ID=-99
   MINDBODY_SOURCE_NAME=your_source_name
   MINDBODY_SOURCE_PASSWORD=your_source_password

   # OpenRouter API key (get from https://openrouter.ai/)
   OPENROUTER_API_KEY=sk-or-v1-xxx
   ```

3. **Run**

   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## 📖 Usage Examples

Try asking:

- "Show me today's yoga classes"
- "Find client John Smith"
- "Who's on the waitlist?"
- "List all staff members"
- "What are our locations?"

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Vercel AI SDK + OpenRouter (Claude 3.5 Sonnet)
- **MCP Integration**: @modelcontextprotocol/sdk
- **Runtime**: Node.js (API routes) + React 19

## 📁 Project Structure

```
mindbody/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Chat endpoint
│   │   └── tools/route.ts     # MCP tools list
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── components/
│   ├── Chat.tsx               # Chat interface
│   └── QuickActions.tsx       # Quick action buttons
├── lib/
│   ├── mcp-client.ts          # MCP client connection
│   └── types.ts               # TypeScript types
└── SETUP.md                   # Detailed setup guide
```

## 🔧 Configuration

### Environment Variables

| Variable                   | Required | Description                 | Default                                    |
| -------------------------- | -------- | --------------------------- | ------------------------------------------ |
| `MINDBODY_API_KEY`         | ✅       | Your Mindbody API key       | -                                          |
| `MINDBODY_SITE_ID`         | ✅       | Site ID (-99 for all sites) | `-99`                                      |
| `MINDBODY_SOURCE_NAME`     | ✅       | API source name             | -                                          |
| `MINDBODY_SOURCE_PASSWORD` | ✅       | API source password         | -                                          |
| `OPENROUTER_API_KEY`       | ✅       | OpenRouter API key          | -                                          |
| `DEFAULT_MODEL`            | ❌       | AI model to use             | `anthropic/claude-3.5-sonnet`              |
| `MINDBODY_API_URL`         | ❌       | API base URL                | `https://api.mindbodyonline.com/public/v6` |

### MCP Server

The app uses the MindbodyMCP server directly from GitHub:

```typescript
command: "bunx",
args: ["github:vespo92/MindbodyMCP"]
```

No separate installation needed!

## 📚 Documentation

- **[AI_SDK_MIGRATION.md](./AI_SDK_MIGRATION.md)** - New! Learn about the AI-powered features
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions and troubleshooting
- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Technical architecture

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🙏 Acknowledgments

- [MindbodyMCP](https://github.com/vespo92/MindbodyMCP) - MCP server for Mindbody API
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI chat framework
- [OpenRouter](https://openrouter.ai/) - AI model routing and access
- [Model Context Protocol](https://modelcontextprotocol.io/) - Protocol specification
- [Mindbody](https://www.mindbodyonline.com/) - Fitness studio management platform
- [Cortex](https://github.com/neocybereth/cortex) - UI/UX inspiration

## 🔗 Links

- [MindbodyMCP GitHub](https://github.com/vespo92/MindbodyMCP)
- [Mindbody Developer Portal](https://developers.mindbodyonline.com/)
- [MCP Documentation](https://modelcontextprotocol.io/docs)

---

Made with ❤️ for yoga studios and wellness centers
