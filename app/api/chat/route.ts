import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { createSupabaseTools } from "@/lib/mindbody-tools-supabase";
import { getSystemPrompt } from "@/lib/system-prompt";
import { DEFAULT_MODEL } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

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

    // Environment checks
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("[Chat API] OPENROUTER_API_KEY not configured");
      return Response.json(
        {
          error:
            "OpenRouter API key not configured. Get one at https://openrouter.ai/",
        },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("[Chat API] Supabase credentials not configured");
      return Response.json(
        {
          error:
            "Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.",
        },
        { status: 500 }
      );
    }

    // Initialize Supabase and tools
    console.log("[Chat API] Initializing Supabase client...");
    const supabase = getSupabaseClient();

    console.log("[Chat API] Creating tools...");
    let allTools;
    try {
      allTools = createSupabaseTools(supabase);
      console.log(
        "[Chat API] Tools created successfully:",
        Object.keys(allTools)
      );
    } catch (error) {
      console.error("[Chat API] Failed to create tools:", error);
      throw new Error("Failed to initialize tools");
    }

    // Provide all tools to the model
    console.log("[Chat API] Using all available tools:", Object.keys(allTools));

    // ========================================
    // STREAM TEXT
    // ========================================
    try {
      // Clean messages (remove incomplete tool invocations)
      const cleanedMessages = messages.filter(
        (msg: {
          role?: string;
          toolInvocations?: Array<{ result?: unknown }>;
        }) => {
          if (msg.role === "assistant" && msg.toolInvocations) {
            return msg.toolInvocations.every((inv) => inv.result !== undefined);
          }
          return true;
        }
      );

      const result = streamText({
        model: openrouter(DEFAULT_MODEL),
        system: getSystemPrompt(),
        messages: convertToCoreMessages(cleanedMessages),
        tools: allTools,
        maxSteps: 30,
        temperature: 0.1,
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
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return Response.json(
      {
        error: errorMessage,
        hint: errorMessage.includes("OpenRouter")
          ? "Check your OpenRouter API key"
          : errorMessage.includes("Supabase")
          ? "Check your Supabase configuration"
          : "Check server logs for details",
      },
      { status: 500 }
    );
  }
}
