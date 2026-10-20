import { NextRequest, NextResponse } from "next/server";

interface ChatRequest {
  message: string;
  pageContext?: string;
  pageUrl?: string;
}

interface ChatResponse {
  ok: boolean;
  error?: string;
}

const OPERATOR_WEBHOOK_URL = process.env.CHAT_WEBHOOK_URL ?? "";

function isValidMessage(message: string): boolean {
  const trimmed = message.trim();
  return trimmed.length > 0 && trimmed.length <= 2000;
}

function sanitizeMessage(message: string): string {
  return message
    .trim()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 2000);
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body = (await request.json()) as ChatRequest;
    const { message, pageContext, pageUrl } = body;

    if (!isValidMessage(message)) {
      return NextResponse.json(
        { ok: false, error: "Message must be between 1 and 2000 characters." },
        { status: 400 },
      );
    }

    const sanitizedMessage = sanitizeMessage(message);
    const timestamp = new Date().toISOString();
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const referer = request.headers.get("referer") ?? "";

    const payload = {
      type: "chat_message",
      message: sanitizedMessage,
      pageContext,
      pageUrl,
      timestamp,
      userAgent,
      referer,
    };

    if (OPERATOR_WEBHOOK_URL) {
      try {
        const webhookResponse = await fetch(OPERATOR_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!webhookResponse.ok) {
          console.error(
            `Chat webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`,
          );
        }
      } catch (webhookError) {
        console.error("Chat webhook error:", webhookError);
      }
    } else {
      console.log("CHAT_WEBHOOK_URL not configured. Message logged:", payload);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}