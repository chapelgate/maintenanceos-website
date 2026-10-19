import { NextRequest, NextResponse } from "next/server";
import { processEnquiry, type EnquiryRequest } from "@/lib/enquiry-processor";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let input: EnquiryRequest;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { status, body } = await processEnquiry(input);
  return NextResponse.json(body, { status });
}