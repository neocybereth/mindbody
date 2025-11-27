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
        model: openrouter(DEFAULT_MODEL),
        prompt: `Analyze query and select tools. Make sure to include the getClients tool if we need a client id for the other tools. CHECK: Is a specific client NAME mentioned?
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

              // Check for completely empty params on tools that require IDs (OLD TOOLS - shouldn't be used)
              const clientIdRequiredTools = [
                "getClientVisits",
                "getClientServices",
                "getClientSchedule",
                "getClientPurchases",
                "getActiveClientMemberships",
                "getClientCompleteInfo",
                "getClientContracts",
                "getClientRewards",
                "addClientToClass", // Requires both clientId AND classId
              ];

              const clientIdsRequiredTools = [
                "getClientAccountBalances",
                "getActiveClientsMemberships",
              ];

              // Validate tools that require clientId
              if (clientIdRequiredTools.includes(name)) {
                if (!params || !params.clientId || params.clientId === "") {
                  console.error(
                    `[Tool Validation] ❌ ${name} called without required clientId!`,
                    "Params received:",
                    JSON.stringify(params)
                  );
                  return {
                    error: `❌ CRITICAL ERROR: ${name} requires a clientId parameter but none was provided.`,
                    instructions: [
                      "🚫 DO NOT call this tool again without a clientId.",
                      "✅ Step 1: Ask the user which client they want information for (if not specified)",
                      "✅ Step 2: Use getClients tool with searchText parameter to find the client",
                      "✅ Step 3: Extract the client ID from the response",
                      "✅ Step 4: Call this tool again with the clientId parameter",
                    ],
                    example: `First call: getClients({ searchText: "John Doe" }), then call ${name}({ clientId: "obtained_id" })`,
                    requiredParameters: ["clientId"],
                    receivedParameters: Object.keys(params || {}),
                  };
                }
              }

              // Special validation for addClientToClass - requires BOTH clientId AND classId
              if (name === "addClientToClass") {
                if (!params?.classId) {
                  console.error(
                    `[Tool Validation] ❌ addClientToClass called without required classId!`,
                    "Params received:",
                    JSON.stringify(params)
                  );
                  return {
                    error: `❌ CRITICAL ERROR: addClientToClass requires BOTH clientId AND classId parameters.`,
                    instructions: [
                      "🚫 DO NOT call this tool again without both parameters.",
                      "✅ Step 1: Use getClients to find the client ID",
                      "✅ Step 2: Use getClasses to find the class ID",
                      "✅ Step 3: Call addClientToClass with both IDs",
                    ],
                    example: `addClientToClass({ clientId: "client_id", classId: 12345 })`,
                    requiredParameters: ["clientId", "classId"],
                    receivedParameters: Object.keys(params || {}),
                  };
                }
              }

              // Validate tools that require clientIds array
              if (clientIdsRequiredTools.includes(name)) {
                const clientIds = params?.clientIds;
                if (
                  !params ||
                  !clientIds ||
                  (Array.isArray(clientIds) && clientIds.length === 0)
                ) {
                  console.error(
                    `[Tool Validation] ❌ ${name} called without required clientIds array!`,
                    "Params received:",
                    JSON.stringify(params)
                  );
                  return {
                    error: `❌ CRITICAL ERROR: ${name} requires a clientIds array parameter but none was provided.`,
                    instructions: [
                      "🚫 DO NOT call this tool again without clientIds.",
                      "✅ Use getClients tool first to find client IDs, then provide them as an array",
                    ],
                    example: `First call: getClients({ searchText: "name" }), then call ${name}({ clientIds: ["id1", "id2"] })`,
                    requiredParameters: ["clientIds"],
                    receivedParameters: Object.keys(params || {}),
                  };
                }
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

You have access to Mindbody data through various tools. Use them to:
- View and manage class schedules
- Search for and manage client information
- Check staff schedules and information
- View studio locations
- Access waitlists and bookings
- See services and packages

IMPORTANT - Always use reasonable limits:
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


When you encounter errors:
- If a search* tool returns success: false with an error, it means the client wasn't found
  → Ask the user to verify the spelling or provide more details
- Authentication errors: Explain that staff credentials may need to be configured
- Other errors: Provide helpful context and suggest alternatives

Be conversational, helpful, and proactive in suggesting relevant information.`,
        messages: convertToCoreMessages(messages),
        tools: validatedTools,
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
