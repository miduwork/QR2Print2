import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders/repository.server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json(
      { error: "Missing order id" },
      { status: 400 },
    );
  }

  try {
    const result = await getOrderById(id);
    if (!result.ok) {
      if (result.kind === "not_found") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      console.error("GET /api/orders/[id]:", result.error);
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500 },
      );
    }
    return NextResponse.json({ order: result.order }, { status: 200 });
  } catch (e) {
    console.error("GET /api/orders/[id]:", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 },
    );
  }
}

