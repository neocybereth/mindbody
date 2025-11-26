# Mindbody Chat - Project Overview

## What is This?

A Next.js-based chat interface that connects to Mindbody's API through the Model Context Protocol (MCP). It allows you to interact with your Mindbody data using natural language queries.

## Architecture

```
┌─────────────────┐
│   User Browser  │
│   (React UI)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Next.js API   │
│   Routes        │
└────────┬────────┘
         │ stdio
         ▼
┌─────────────────┐
│  MindbodyMCP    │
│  Server (Bun)   │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Mindbody API   │
│  (Cloud)        │
└─────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Styling

### Backend (API Routes)
- **Node.js**: Runtime for API routes
- **MCP SDK**: Model Context Protocol client
- **Stdio Transport**: Communication with MCP server

### External
- **MindbodyMCP**: MCP server for Mindbody API
- **Bun**: Runtime for MCP server (via bunx)
- **Mindbody API**: Cloud service

## Key Components

### 1. Chat Interface (`components/Chat.tsx`)
The main UI component that:
- Displays conversation history
- Handles user input
- Shows loading states
- Formats responses with markdown support
- Provides real-time updates

### 2. MCP Client (`lib/mcp-client.ts`)
Manages connection to the MCP server:
- Establishes stdio transport connection
- Maintains single client instance
- Handles connection lifecycle
- Provides tool calling interface

### 3. Chat API (`app/api/chat/route.ts`)
Processes chat requests:
- Detects user intent from natural language
- Maps intents to MCP tools
- Calls appropriate MCP tools
- Formats responses for display
- Handles errors gracefully

### 4. Tools API (`app/api/tools/route.ts`)
Lists available MCP tools:
- Fetches tool definitions from MCP server
- Returns tool schemas
- Used for documentation/debugging

## Data Flow

1. **User Input**: User types a question in the chat interface
2. **Intent Detection**: API analyzes the query to determine intent
3. **MCP Connection**: Client connects to MindbodyMCP server
4. **Tool Call**: Appropriate MCP tool is called with parameters
5. **API Request**: MCP server makes request to Mindbody API
6. **Data Return**: Response flows back through the chain
7. **Formatting**: Response is formatted for display
8. **UI Update**: Chat interface shows the formatted response

## Intent Detection

The system uses simple pattern matching to detect intent:

```typescript
User Query                    → Detected Intent → MCP Tool
"Show me today's classes"    → Classes          → getClasses
"Find client John Smith"     → Client search    → getClients
"Who's on staff?"            → Staff list       → getStaff
"What are our locations?"    → Locations        → getLocations
```

## Response Formatting

Different data types are formatted differently:

- **Classes**: Time, location, instructor, capacity
- **Clients**: Name, email, phone
- **Staff**: Name, bio
- **Generic**: JSON pretty-print

## Configuration

### Environment Variables

All configuration is done through `.env.local`:

```
MINDBODY_API_KEY       → Your Mindbody API key
MINDBODY_SITE_ID       → Studio site ID (-99 = all)
MINDBODY_SOURCE_NAME   → API source name
MINDBODY_SOURCE_PASSWORD → API source password
```

### MCP Server Configuration

Defined in `lib/mcp-client.ts`:

```typescript
{
  command: "bunx",
  args: ["github:vespo92/MindbodyMCP"],
  env: { /* environment variables */ }
}
```

## Available MCP Tools (50+)

### Classes (7 tools)
- getClasses
- getClassDescriptions
- getClassSchedules
- addClientToClass
- removeClientFromClass
- getWaitlistEntries
- substituteClassTeacher

### Clients (8 tools)
- getClients
- addClient
- updateClient
- getClientVisits
- getClientMemberships
- addClientArrival
- getClientAccountBalances
- getClientContracts

### Sales (6 tools)
- getServices
- getPackages
- getProducts
- getContracts
- checkoutShoppingCart
- purchaseContract

### Site Management (6 tools)
- getSites
- getLocations
- getPrograms
- getResources
- getSessionTypes
- getStaff

### Appointments (5 tools)
- getStaffAppointments
- addAppointment
- updateAppointment
- getBookableItems
- getScheduleItems

### Enrollments (3 tools)
- getEnrollments
- addClientToEnrollment
- getClientEnrollments

## Extending the System

### Adding New Intent Patterns

Edit `app/api/chat/route.ts`:

```typescript
function detectIntent(message: string) {
  // Add new pattern
  if (lowerMessage.includes("appointment")) {
    return { toolName: "getStaffAppointments", args: {} };
  }
}
```

### Custom Response Formatting

Edit `formatToolResponse()` in `app/api/chat/route.ts`:

```typescript
function formatToolResponse(toolName: string, result: any) {
  // Add custom formatting
  if (toolName === "myCustomTool") {
    return formatCustomData(result);
  }
}
```

### Adding UI Features

Components to modify:
- `components/Chat.tsx` - Main chat interface
- `components/QuickActions.tsx` - Quick action buttons
- `app/page.tsx` - Page layout

## Security

### API Credentials
- Stored in `.env.local` (not committed to git)
- Only accessible on server-side (API routes)
- Never exposed to client browser

### API Routes
- Run in Node.js runtime (isolated from client)
- Validate all inputs
- Handle errors without exposing internals

### MCP Connection
- Stdio transport (local process communication)
- Environment variables passed securely
- No network exposure of credentials

## Performance

### Caching
MCP server includes built-in caching:
- Dynamic data: 5 minutes (configurable)
- Static data: 60 minutes
- Reduces API calls to Mindbody

### Connection Management
- Single MCP client instance (singleton pattern)
- Persistent connection during app lifecycle
- Automatic reconnection on failure

### Response Times
Typical response times:
- Intent detection: < 1ms
- MCP tool call: 100-500ms
- Total (including Mindbody API): 200-1000ms

## Deployment

### Local Development
```bash
npm run dev
```

### Production (Vercel)
1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy automatically

### Other Platforms
Requirements:
- Node.js 18+
- Bun runtime (for MCP server)
- Environment variables configured

## Limitations

1. **Intent Detection**: Simple pattern matching (not AI-based)
2. **Tool Support**: Limited to implemented patterns
3. **Error Handling**: Basic error messages
4. **Conversation Context**: No multi-turn conversation memory
5. **Authentication**: No user-level authentication

## Future Enhancements

### Short Term
- [ ] Add more intent patterns
- [ ] Improve error messages
- [ ] Add loading indicators for specific operations
- [ ] Conversation history persistence
- [ ] Quick action buttons for common queries

### Medium Term
- [ ] AI-powered intent detection (using LLM)
- [ ] Multi-turn conversations with context
- [ ] User authentication and sessions
- [ ] Real-time updates via webhooks
- [ ] Advanced filtering and search

### Long Term
- [ ] Multi-site support
- [ ] Analytics dashboard
- [ ] Custom report generation
- [ ] Appointment booking workflow
- [ ] Client self-service portal

## Resources

### Documentation
- [QUICKSTART.md](./QUICKSTART.md) - Get started in 5 minutes
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [README.md](./README.md) - Project overview

### External Links
- [MindbodyMCP](https://github.com/vespo92/MindbodyMCP)
- [Mindbody API Docs](https://developers.mindbodyonline.com/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Next.js Docs](https://nextjs.org/docs)

## Support

For issues:
- **MCP Server**: https://github.com/vespo92/MindbodyMCP/issues
- **Mindbody API**: https://developers.mindbodyonline.com/
- **This Project**: Create an issue in your repository

## License

MIT - See LICENSE file

---

**Built with ❤️ for yoga studios and wellness centers**

