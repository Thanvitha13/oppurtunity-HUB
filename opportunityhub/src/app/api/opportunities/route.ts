import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Opportunity, OPPORTUNITY_TYPES } from "@/lib/opportunity";

// Always fetch fresh data - never cache this API.
export const dynamic = "force-dynamic";

/** GET /api/opportunities?type=Hackathon&q=ai
 *  Returns opportunities sorted by closest deadline first. */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const q = searchParams.get("q");

    const filter: Record<string, unknown> = {};

    // Optional category filter, e.g. ?type=Hackathon
    if (type && type !== "All") {
      if (!OPPORTUNITY_TYPES.includes(type as (typeof OPPORTUNITY_TYPES)[number])) {
        return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 });
      }
      filter.type = type;
    }

    // Optional text search across title / organisation / description
    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ title: regex }, { organisation: regex }, { description: regex }];
    }

    const opportunities = await Opportunity.find(filter).sort({ deadline: 1 }).lean();

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("[GET /api/opportunities]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 }
    );
  }
}

/** POST /api/opportunities - publish a new opportunity. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const createSchema = z.object({
      title: z.string().min(5, "Title must be at least 5 characters").max(120),
      organisation: z.string().min(2, "Organisation is required").max(80),
      type: z.enum(OPPORTUNITY_TYPES),
      description: z.string().min(10, "Description must be at least 10 characters").max(600),
      link: z.url("Enter a valid URL (starting with https://)"),
      deadline: z.coerce
        .date()
        .refine((d) => d.getTime() > Date.now(), "Deadline must be a future date"),
    });

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid form data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    await connectDB();
    const created = await Opportunity.create(parsed.data);

    return NextResponse.json({ opportunity: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/opportunities]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save opportunity" },
      { status: 503 }
    );
  }
}
