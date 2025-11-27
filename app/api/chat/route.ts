import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { createMindbodyTools } from "@/lib/mindbody-tools-direct";
import { getMindbodyCredentials } from "@/lib/mindbody-api";
import { DEFAULT_MODEL } from "@/lib/utils";

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

    let allMindbodyTools;
    try {
      allMindbodyTools = createMindbodyTools(credentials);
      console.log("[Chat API] Mindbody tools created successfully");
    } catch (error) {
      console.error("[Chat API] Failed to create tools:", error);
      throw new Error("Failed to initialize Mindbody tools");
    }

    // Get current date for context
    const today = new Date().toISOString().split("T")[0];

    // ========================================
    // DYNAMIC TOOL SELECTION
    // Use a cheap LLM to select only relevant tools for this query
    // ========================================
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const allToolNames = Object.keys(allMindbodyTools);

    console.log(
      "[Chat API] Selecting relevant tools for query:",
      lastUserMessage.substring(0, 100)
    );

    let selectedToolNames: string[];
    try {
      const { generateText } = await import("ai");

      const toolSelectionResult = await generateText({
        model: openrouter("x-ai/grok-4.1-fast:free"),
        prompt: `Analyze query and select tools.
        

CRITICAL RULE: If ANY of these selected tools require clientId or clientIds parameters, "getClients" **must** be in your selection FIRST.

Tools that ABSOLUTELY REQUIRE getClients first (require clientId/clientIds):
- getClientServices, getClientCompleteInfo, getActiveClientMemberships, getActiveClientsMemberships
- getClientPurchases, getClientSchedule, getClientVisits


Any tool with "⚠️ REQUIRES clientId" in its description MUST be preceded by getClients. Get Clients always comes first.

USER QUERY: "${lastUserMessage}"

AVAILABLE TOOLS:
${allToolNames.join(", ")}

OUTPUT (JSON only):
{"tools": ["tool1", "tool2"], "reasoning": "why"}`,
        temperature: 0.1,
      });

      const text = toolSelectionResult.text.trim();
      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;

      const parsed = JSON.parse(jsonText);
      const rawTools = Array.isArray(parsed.tools) ? parsed.tools : [];

      // Filter out non-existent tools
      selectedToolNames = rawTools.filter((name: string) =>
        allToolNames.includes(name)
      );

      if (rawTools.length !== selectedToolNames.length) {
        console.log(
          "[Chat API] Filtered out non-existent tools:",
          rawTools.filter((name: string) => !allToolNames.includes(name))
        );
      }

      console.log("[Chat API] Tool selection:", {
        selected: selectedToolNames,
        count: selectedToolNames.length,
        reasoning: parsed.reasoning || "No reasoning provided",
      });
    } catch (error) {
      console.warn("[Chat API] Tool selection failed, using all tools");
      console.warn(
        "[Chat API] Error details:",
        error instanceof Error ? error.message : error
      );
      selectedToolNames = allToolNames; // Fallback to all tools
    }

    // Filter tools based on selection
    const mindbodyTools =
      selectedToolNames.length === 0
        ? {} // No tools needed
        : Object.fromEntries(
            selectedToolNames
              .filter((name) => name in allMindbodyTools)
              .map((name) => [
                name,
                allMindbodyTools[name as keyof typeof allMindbodyTools],
              ])
          );

    console.log(
      "[Chat API] Using",
      Object.keys(mindbodyTools).length,
      "tools out of",
      allToolNames.length
    );
    console.log("[Chat API] Starting streamText with OpenRouter");

    // Wrap tools with validation to prevent empty parameter calls
    const validatedTools = Object.fromEntries(
      Object.entries(mindbodyTools).map(([name, toolDef]) => {
        const tool = toolDef as {
          parameters: unknown;
          description?: string;
          execute: (params: Record<string, unknown>) => Promise<unknown>;
        };

        const originalExecute = tool.execute;

        return [
          name,
          {
            ...tool,
            execute: async (params: Record<string, unknown>) => {
              console.log(`[Tool Validation] ${name} called with:`, params);

              // Coerce clientId to string if it's a number
              if ("clientId" in params && typeof params.clientId === "number") {
                params.clientId = String(params.clientId);
                console.log(
                  `[Tool Validation] Coerced clientId to string: ${params.clientId}`
                );
              }

              // Also handle clientIds array
              if ("clientIds" in params && Array.isArray(params.clientIds)) {
                params.clientIds = params.clientIds.map((id) =>
                  typeof id === "number" ? String(id) : id
                );
              }

              // All validation passed, execute the original tool
              return originalExecute(params);
            },
          },
        ];
      })
    );

    try {
      // Use streamText with OpenRouter and validated Mindbody tools
      const result = streamText({
        model: openrouter(DEFAULT_MODEL),
        system: `You are a helpful AI assistant for a Mindbody studio management system.

Today's date is ${today}. When users ask about dates like "today", "tomorrow", "this week", etc., calculate the appropriate dates based on today's date.

system: 

If you're running the getNonMemberTrialClients tool then make some recommendations for follow ups and outreach coupons etc.

🔴🔴🔴 CRITICAL TOOL CALLING RULES - READ CAREFULLY 🔴🔴🔴

1. PARAMETER EXTRACTION IS MANDATORY:
   - When user mentions a name like "Mike Allen" → extract it as searchText
   - NEVER call getClients with empty {} when user provided a name
   - Example: "purchases for Mike Allen" → getClients({ searchText: "Mike Allen" })

2. TOOL CHAINING IS MANDATORY:
   - After getClients returns results, EXTRACT the clientId from the response
   - Use that clientId in the next tool call
   - Example flow:
     Step 1: getClients({ searchText: "Mike Allen" }) → returns { Clients: [{ Id: "12345", ... }] }
     Step 2: getClientPurchases({ clientId: "12345" })  ← USE THE ID FROM STEP 1

3. NEVER call a tool with empty {} if:
   - User provided a name (use searchText)
   - Previous tool returned an ID you need (use clientId)

   🔴 CRITICAL - ITERATING OVER RESULTS:
When a user asks about "all clients", "how many clients", or similar aggregate questions:
1. First get the list of clients
2. You MUST call the follow-up tool for EACH client in the list, not just the first one
3. Keep track of results for all clients
4. Summarize the aggregate results at the end

Example: "How many new clients returned for a second visit?"
- Step 1: getClients({ lastModifiedDate: "..." }) → returns 50 clients
- Step 2-51: getClientVisits({ clientId: "..." }) for EACH of the 50 clients
- Step 52: Count and report how many had 2+ visits

DO NOT stop after checking just one client.

TOOL USAGE EXAMPLES:
- User: "get purchases for Mike Allen" 
  → First call: getClients({ searchText: "Mike Allen" })
  → Then call: getClientPurchases({ clientId: "<id from above>" })

- User: "show me Jane Doe's schedule"
  → First call: getClients({ searchText: "Jane Doe" })
  → Then call: getClientSchedule({ clientId: "<id from above>" })

🔴 CRITICAL: When calling getClients for "new clients", "recent clients", or clients from "last X days/weeks/months":
  1. Calculate the date: new Date(Date.now() - X*24*60*60*1000).toISOString()
  2. Pass it as lastModifiedDate parameter to getClients
  3. Example: For "last 30 days", use: lastModifiedDate: new Date(Date.now() - 30*24*60*60*1000).toISOString()
  4. NEVER call getClients without lastModifiedDate when the user asks for new/recent clients

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

When you encounter errors:
- If a search* tool returns success: false with an error, it means the client wasn't found
  → Ask the user to verify the spelling or provide more details
- Authentication errors: Explain that staff credentials may need to be configured
- Other errors: Provide helpful context and suggest alternatives

Be conversational, helpful, and proactive in suggesting relevant information.`,
        messages: convertToCoreMessages(messages),
        tools: validatedTools,
        maxSteps: 30,
        temperature: 0.2,
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
