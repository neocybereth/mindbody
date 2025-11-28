import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ clients: [] });
  }

  try {
    const supabase = getSupabaseClient();
    const term = query.trim();

    // Search by name, email, or phone
    const { data, error } = await supabase
      .from("mindbody_clients")
      .select(
        "idx, mindbody_client_id, first_name, last_name, email, mobile_phone, status"
      )
      .or(
        `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,mobile_phone.ilike.%${term}%`
      )
      .eq("is_active", true)
      .order("last_name")
      .limit(10);

    if (error) {
      console.error("Client search error:", error);
      return NextResponse.json(
        { error: "Failed to search clients" },
        { status: 500 }
      );
    }

    return NextResponse.json({ clients: data || [] });
  } catch (error) {
    console.error("Client search error:", error);
    return NextResponse.json(
      { error: "Failed to search clients" },
      { status: 500 }
    );
  }
}
