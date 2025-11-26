import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { createMindbodyTools } from "@/lib/mindbody-tools-direct";
import { getMindbodyCredentials } from "@/lib/mindbody-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120; // Increased to 60 seconds for large data requests

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    console.log(
      "[Chat API] Received request with",
      messages?.length || 0,
      "messages"
    );

    // Check if Mindbody API key is configured
    if (!process.env.MINDBODY_API_KEY) {
      console.error("[Chat API] MINDBODY_API_KEY not configured");
      return Response.json(
        {
          error:
            "Mindbody API key not configured. Please set MINDBODY_API_KEY environment variable in .env.local",
        },
        { status: 500 }
      );
    }

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("[Chat API] OPENROUTER_API_KEY not configured");
      return Response.json(
        {
          error:
            "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env.local. Get one at https://openrouter.ai/",
        },
        { status: 500 }
      );
    }

    // Get Mindbody credentials and create tools (direct API calls, no MCP)
    const credentials = getMindbodyCredentials();
    console.log("[Chat API] Creating Mindbody tools...");

    let mindbodyTools;
    try {
      mindbodyTools = createMindbodyTools(credentials);
      console.log("[Chat API] Mindbody tools created successfully");
    } catch (error) {
      console.error("[Chat API] Failed to create tools:", error);
      throw new Error("Failed to initialize Mindbody tools");
    }

    // Get current date for context
    const today = new Date().toISOString().split("T")[0];

    console.log("[Chat API] Starting streamText with OpenRouter");

    try {
      // Use streamText with OpenRouter and Mindbody tools
      const result = streamText({
        model: openrouter(
          process.env.DEFAULT_MODEL || "anthropic/claude-3.5-sonnet"
        ),
        system: `You are a helpful AI assistant for a Mindbody studio management system.

Today's date is ${today}. When users ask about dates like "today", "tomorrow", "this week", etc., calculate the appropriate dates based on today's date.

You have access to Mindbody data through various tools. Use them to:
- View and manage class schedules
- Search for and manage client information
- Check staff schedules and information
- View studio locations
- Access waitlists and bookings
- See services and packages

IMPORTANT - Always use reasonable limits:
- When getting clients, classes, or other lists, ALWAYS specify a limit parameter (25-100 is good)
- Default to limit: 25 for general queries
- Use limit: 100 only if the user explicitly wants "all" or a large dataset
- Warn users that getting "all" records may take longer

When presenting data:
- Format dates and times in a user-friendly way
- Show relevant details (capacity, location, instructor for classes)
- Summarize large amounts of data
- Provide insights and helpful context
- If results are limited, mention "Showing first X results"

For date parameters:
- Use ISO format: YYYY-MM-DDTHH:mm:ss for datetime
- Use YYYY-MM-DD for dates only
- Calculate date ranges appropriately (e.g., "this week" = next 7 days)

Tool usage guidelines:
- Some tools like getClassVisits require specific filters (classId OR clientId) - don't call them without the required filters
- If a user asks a vague question (e.g., "show me visits"), ask them to clarify: "Visits for which class or client?"
- When you need IDs, use search tools first: getClients to find clientId, getClasses to find classId
- Never call tools with incomplete/missing required parameters

When you encounter errors:
- Authentication errors: Explain that staff credentials may need to be configured, suggest checking AUTHENTICATION_GUIDE.md
- Missing ID errors: Ask the user which specific client/class/resource they want, then use the search tool first
- "InvalidClassId" or similar errors: You called a tool without required filters - ask the user for more specific information
- If a tool requires a clientId but you don't have one: Ask "Which client?" and wait for their response before proceeding

Be conversational, helpful, and proactive in suggesting relevant information.`,
        messages: convertToCoreMessages(messages),
        tools: mindbodyTools,
        maxSteps: 10,
        temperature: 0.5,
        onError: (error) => {
          console.error("[Chat API] Stream error:", error);
        },
      });

      console.log("[Chat API] Stream initiated successfully");
      return result.toDataStreamResponse();
    } catch (streamError) {
      console.error("[Chat API] StreamText error:", streamError);
      throw streamError;
    }
  } catch (error) {
    console.error("[Chat API] Error:", error);
    console.error(
      "[Chat API] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Return a proper error response
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return Response.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
        hint: errorMessage.includes("Mindbody")
          ? "Check your Mindbody credentials in .env.local. See AUTHENTICATION_GUIDE.md for help."
          : errorMessage.includes("OpenRouter")
          ? "Check your OpenRouter API key in .env.local. Get one at https://openrouter.ai/"
          : "Check the server logs for more details.",
      },
      { status: 500 }
    );
  }
}
