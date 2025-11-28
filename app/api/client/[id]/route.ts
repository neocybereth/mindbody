import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id: clientId } = await params;

    // Fetch client by idx
    const { data, error } = await supabase
      .from("mindbody_clients")
      .select("*")
      .eq("idx", clientId)
      .single();

    if (error || !data) {
      console.error("Client fetch error:", error);
      return NextResponse.json(
        { found: false, message: "Client not found" },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedData = { ...data };
    const jsonFields = ["visits", "purchases", "memberships", "services"];
    for (const field of jsonFields) {
      if (typeof parsedData[field] === "string") {
        try {
          parsedData[field] = JSON.parse(parsedData[field]);
        } catch {
          // Keep as string if parse fails
        }
      }
    }

    return NextResponse.json({
      found: true,
      client: parsedData,
    });
  } catch (error) {
    console.error("Client detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client details" },
      { status: 500 }
    );
  }
}
