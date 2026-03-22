import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders/repository.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
} as const;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json(
      { error: "Missing order id" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  let supabaseHost = "";
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (u) supabaseHost = new URL(u).hostname;
  } catch {
    supabaseHost = "";
  }

  const diagHeaders = {
    ...noStoreHeaders,
    ...(supabaseHost ? { "X-Supabase-Host": supabaseHost } : {}),
  };

  try {
    const result = await getOrderById(id);
    if (!result.ok) {
      if (result.kind === "not_found") {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404, headers: diagHeaders },
        );
      }
      console.error("GET /api/orders/[id]:", result.error);
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500, headers: diagHeaders },
      );
    }
    return NextResponse.json(
      { order: result.order },
      { status: 200, headers: diagHeaders },
    );
  } catch (e) {
    console.error("GET /api/orders/[id]:", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: diagHeaders },
    );
  }
}

