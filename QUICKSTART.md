# Quick Start Guide

Get up and running with Mindbody Chat in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

## Step 2: Setup Environment

Run the setup script:

```bash
./scripts/setup.sh
```

Or manually create `.env.local`:

```env
MINDBODY_API_KEY=your_api_key_here
MINDBODY_SITE_ID=-99
MINDBODY_SOURCE_NAME=your_source_name
MINDBODY_SOURCE_PASSWORD=your_source_password
```

## Step 3: Get Mindbody Credentials

1. Go to [Mindbody Developer Portal](https://developers.mindbodyonline.com/)
2. Sign in or create an account
3. Create a new API application
4. Copy your credentials to `.env.local`

## Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Start Chatting!

Try these queries:

### Classes
```
Show me today's classes
What yoga classes are available tomorrow?
```

### Clients
```
Find client Sarah Johnson
Search for member john@email.com
```

### Staff
```
Show me all instructors
Who's teaching yoga?
```

### Locations
```
What are our studio locations?
Where are we located?
```

### Waitlists
```
Show me the waitlist
Who's waiting for classes?
```

### Services
```
What services do we offer?
List available packages
```

## Troubleshooting

### Can't connect to MCP server

**Solution:** Install Bun runtime:
```bash
curl -fsSL https://bun.sh/install | bash
```

Or modify to use npx instead of bunx in `lib/mcp-client.ts`:
```typescript
command: "npx",
args: ["-y", "github:vespo92/MindbodyMCP"]
```

### No credentials error

**Solution:** Make sure `.env.local` exists and has valid credentials.

### API errors

**Solution:** 
- Verify your Site ID is correct
- Check your API key has necessary permissions
- Ensure you're using the correct API URL

## What's Next?

- Read [SETUP.md](./SETUP.md) for advanced configuration
- Check [README.md](./README.md) for project overview
- Explore the [MindbodyMCP GitHub](https://github.com/vespo92/MindbodyMCP) for available tools

## Need Help?

- Check the [Mindbody API Docs](https://developers.mindbodyonline.com/PublicDocumentation/V6)
- Review the [MCP Documentation](https://modelcontextprotocol.io/docs)
- Open an issue on GitHub

---

Happy chatting! 🎉

