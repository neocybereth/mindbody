# Mindbody Chat Setup Guide

This Next.js application provides a chat interface that integrates with Mindbody using the Model Context Protocol (MCP).

## Prerequisites

- Node.js 18+ or Bun runtime
- Mindbody API credentials (API Key, Site ID, Source Name, Source Password)
- Mindbody Developer Account

## Environment Setup

1. Create a `.env.local` file in the root directory:

```bash
# Mindbody API Configuration
MINDBODY_API_KEY=your_api_key_here
MINDBODY_SITE_ID=-99
MINDBODY_SOURCE_NAME=your_source_name
MINDBODY_SOURCE_PASSWORD=your_source_password

# Optional settings
MINDBODY_API_URL=https://api.mindbodyonline.com/public/v6
CACHE_TTL_MINUTES=5
MCP_SERVER_NAME=mindbody-mcp
MCP_SERVER_VERSION=2.0.0
```

2. Replace the placeholder values with your actual Mindbody credentials:
   - Get your API Key from the Mindbody Developer Portal
   - Use `-99` for Site ID if you want to access all sites, or specify your studio's Site ID
   - Source Name and Password are your Mindbody API source credentials

## Installation

Install dependencies:

```bash
npm install
# or
yarn install
# or
bun install
```

## Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Architecture

1. **MCP Client** (`lib/mcp-client.ts`) - Connects to the MindbodyMCP server using stdio transport
2. **API Routes** (`app/api/chat/route.ts`) - Handles chat requests and calls MCP tools
3. **Chat UI** (`components/Chat.tsx`) - Provides the chat interface
4. **Intent Detection** - Simple NLP to map user queries to MCP tools

### Available Queries

You can ask questions like:

- **Classes**: "Show me today's yoga classes" or "What classes are tomorrow?"
- **Clients**: "Find client John Smith" or "Search for member Sarah"
- **Staff**: "Show me all staff members" or "Who are the instructors?"
- **Locations**: "What are our studio locations?" or "Where are we located?"
- **Waitlist**: "Show me the waitlist" or "Who's waiting?"
- **Services**: "What services do we offer?" or "List available services"

### MCP Tools Integration

The app uses the MindbodyMCP server directly from GitHub:

```json
{
  "command": "bunx",
  "args": ["github:vespo92/MindbodyMCP"],
  "env": { ... }
}
```

This means no local installation of the MCP server is required - it's fetched and run automatically.

## Features

### 1. Real-time Chat Interface

- Clean, modern UI with dark mode support
- Real-time message updates
- Loading states and error handling

### 2. Intent Detection

- Automatically detects what you're asking for
- Maps natural language to MCP tools
- Provides helpful suggestions if intent is unclear

### 3. Smart Formatting

- Formats class schedules with times and capacity
- Displays client information clearly
- Structures staff listings
- Handles various data types automatically

### 4. Error Handling

- Validates credentials before making requests
- Provides clear error messages
- Graceful fallbacks for failed requests

## Troubleshooting

### "Mindbody credentials not configured"

Make sure your `.env.local` file exists and contains all required credentials.

### "Failed to connect to MCP server"

Ensure you have Bun installed globally: `curl -fsSL https://bun.sh/install | bash`

Alternatively, modify `lib/mcp-client.ts` to use `npx` instead of `bunx`:

```typescript
const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "github:vespo92/MindbodyMCP"],
  env: { ... }
});
```

### No results returned

- Check your Site ID is correct
- Verify your API credentials have the necessary permissions
- Check the Mindbody API status

## Customization

### Adding New Intent Patterns

Edit `app/api/chat/route.ts` and add patterns to the `detectIntent` function:

```typescript
if (lowerMessage.includes("appointments")) {
  return { toolName: "getStaffAppointments", args: {} };
}
```

### Customizing Response Formatting

Modify the `formatToolResponse` function in `app/api/chat/route.ts` to change how data is displayed.

### Styling

The app uses Tailwind CSS. Customize colors and styles in:

- `components/Chat.tsx` - Main chat interface
- `app/globals.css` - Global styles

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Make sure to:

- Set all environment variables
- Enable Node.js runtime for API routes
- Install Bun runtime if using bunx

## API Routes

### POST /api/chat

Send a message and get a response.

**Request:**

```json
{
  "message": "Show me today's classes",
  "conversationHistory": []
}
```

**Response:**

```json
{
  "message": {
    "id": "123",
    "role": "assistant",
    "content": "Here are today's classes...",
    "timestamp": "2025-11-26T...",
    "toolCalls": [...]
  }
}
```

### GET /api/tools

List all available MCP tools.

**Response:**

```json
{
  "tools": [
    {
      "name": "getClasses",
      "description": "...",
      "inputSchema": { ... }
    }
  ]
}
```

## Resources

- [MindbodyMCP GitHub](https://github.com/vespo92/MindbodyMCP)
- [Mindbody API Documentation](https://developers.mindbodyonline.com/PublicDocumentation/V6)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT

## Support

For issues related to:

- The MCP server: https://github.com/vespo92/MindbodyMCP/issues
- This chat interface: Create an issue in your repository
- Mindbody API: https://developers.mindbodyonline.com/
