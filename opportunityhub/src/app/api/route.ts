import { NextResponse } from "next/server";

/** Simple health check: GET /api */
export async function GET() {
  return NextResponse.json({
    name: "OpportunityHub API",
    status: "ok",
    endpoints: {
      list: "GET /api/opportunities?type=Internship&q=google",
      create: "POST /api/opportunities",
    },
  });
}
