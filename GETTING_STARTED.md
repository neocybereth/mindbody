# 🚀 Getting Started with Mindbody Chat

Welcome! Your Mindbody Chat interface is ready to use. This guide will get you up and running quickly.

## ✅ What's Been Set Up

Your project now includes:

### Core Application
- ✅ **Chat Interface** - Modern UI with dark mode support
- ✅ **MCP Integration** - Direct connection to MindbodyMCP server
- ✅ **API Routes** - Backend handling for chat and tools
- ✅ **Intent Detection** - Natural language query understanding
- ✅ **Response Formatting** - Beautiful display of Mindbody data

### Files Created

```
mindbody/
├── components/
│   ├── Chat.tsx                # Main chat interface
│   └── QuickActions.tsx        # Quick action buttons
├── lib/
│   ├── mcp-client.ts          # MCP server connection
│   └── types.ts               # TypeScript definitions
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Chat message handling
│   │   └── tools/route.ts     # MCP tools listing
│   └── page.tsx               # Updated main page
├── scripts/
│   └── setup.sh               # Environment setup script
└── Documentation/
    ├── README.md              # Project overview
    ├── QUICKSTART.md          # 5-minute start guide
    ├── SETUP.md               # Detailed setup
    ├── PROJECT_OVERVIEW.md    # Technical details
    └── GETTING_STARTED.md     # This file
```

## 🎯 Quick Setup (3 Steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Credentials

Run the setup script:

```bash
npm run setup
```

Then edit `.env.local` with your Mindbody credentials:

```env
MINDBODY_API_KEY=your_actual_api_key
MINDBODY_SITE_ID=-99
MINDBODY_SOURCE_NAME=your_source_name
MINDBODY_SOURCE_PASSWORD=your_source_password
```

**Get your credentials at:** https://developers.mindbodyonline.com/

### 3. Start the App

```bash
npm run dev
```

Open http://localhost:3000 and start chatting!

## 💬 Try These Queries

### View Classes
```
Show me today's yoga classes
What classes are available tomorrow?
```

### Find Clients
```
Find client John Smith
Search for member sarah@example.com
```

### Check Staff
```
Show me all staff members
Who are the yoga instructors?
```

### View Locations
```
What are our studio locations?
Where are we located?
```

### Check Waitlists
```
Show me the waitlist
Who's waiting for classes?
```

## 🎨 Features

### Natural Language Interface
Just type what you want in plain English. The system understands:
- Class queries with date references (today, tomorrow)
- Client searches by name
- Staff and location listings
- Waitlist inquiries
- Service offerings

### Smart Response Formatting
Responses are automatically formatted based on data type:
- **Classes**: Show time, location, instructor, capacity
- **Clients**: Display name, email, phone
- **Staff**: List names and bios
- **Everything else**: Clean JSON display

### Real-Time Updates
- Messages appear instantly
- Loading indicators show progress
- Timestamps on all messages
- Smooth animations

### Dark Mode Support
The interface automatically adapts to your system theme.

## 📚 Documentation

Each document serves a different purpose:

| Document | Purpose | Best For |
|----------|---------|----------|
| `QUICKSTART.md` | Get running in 5 minutes | First-time users |
| `SETUP.md` | Detailed configuration | Customization |
| `PROJECT_OVERVIEW.md` | Technical architecture | Developers |
| `README.md` | Project summary | Overview |
| `GETTING_STARTED.md` | This guide | Getting started |

## 🔧 Troubleshooting

### "Failed to connect to MCP server"

**Install Bun runtime:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Or switch to npx** in `lib/mcp-client.ts`:
```typescript
command: "npx",
args: ["-y", "github:vespo92/MindbodyMCP"]
```

### "Mindbody credentials not configured"

Make sure `.env.local` exists and contains valid credentials.

### "No results found"

- Verify your Site ID is correct
- Check API key permissions
- Ensure data exists in Mindbody

### API Errors

- Check Mindbody API status
- Verify credentials are active
- Review API limits

## 🎓 Next Steps

### 1. Explore Available Tools
Try different queries to see what the system can do:
- Classes and schedules
- Client management
- Staff information
- Location details
- Services and packages

### 2. Customize Intent Detection
Add new patterns in `app/api/chat/route.ts`:

```typescript
if (lowerMessage.includes("your_pattern")) {
  return { toolName: "mcpTool", args: {} };
}
```

### 3. Customize UI
Modify `components/Chat.tsx` to change:
- Colors and styling
- Message layout
- Loading animations
- Welcome message

### 4. Add Features
Ideas for enhancement:
- Quick action buttons
- Conversation history
- Export functionality
- Advanced filters

## 🌟 Key Concepts

### Model Context Protocol (MCP)
A standardized way for applications to connect to external services. Think of it as a universal adapter for APIs.

### Intent Detection
The system analyzes your question to figure out what you're asking for, then calls the appropriate tool.

### Stdio Transport
The MCP client communicates with the server using standard input/output, like command-line tools talking to each other.

### Response Formatting
Different data types get different visual treatments for better readability.

## 📖 Learning Resources

### Mindbody API
- [Developer Portal](https://developers.mindbodyonline.com/)
- [API Documentation](https://developers.mindbodyonline.com/PublicDocumentation/V6)
- [Getting Started Guide](https://developers.mindbodyonline.com/GettingStarted)

### Model Context Protocol
- [MCP Website](https://modelcontextprotocol.io/)
- [MCP Documentation](https://modelcontextprotocol.io/docs)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)

### MindbodyMCP Server
- [GitHub Repository](https://github.com/vespo92/MindbodyMCP)
- [Available Tools](https://github.com/vespo92/MindbodyMCP#tools)
- [Documentation](https://github.com/vespo92/MindbodyMCP/blob/master/Claude.md)

### Next.js
- [Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Getting Help

### Common Issues
Check `SETUP.md` for detailed troubleshooting.

### MCP Server Issues
Report at: https://github.com/vespo92/MindbodyMCP/issues

### Mindbody API Issues
Contact: https://developers.mindbodyonline.com/

### This Project
Create an issue in your repository.

## 🎉 You're Ready!

Your Mindbody Chat interface is ready to use. Key things to remember:

1. **Set up credentials** in `.env.local`
2. **Run** with `npm run dev`
3. **Ask questions** in natural language
4. **Explore** the available MCP tools
5. **Customize** to fit your needs

Have fun chatting with your Mindbody data! 🚀

---

**Questions?** Check the other documentation files or open an issue.

**Ready to customize?** Start with `PROJECT_OVERVIEW.md` for technical details.

**Need quick help?** See `QUICKSTART.md` for common solutions.

