// app/api/session/route.ts
import { NextRequest } from "next/server";

// (optional) run this on the Edge so the fetch is fast & no Node polyfills required
export const runtime = "edge"; 

export async function GET(_req: NextRequest) {
  // Call the protected OpenAI endpoint
  const openaiRes = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2025-06-03",
      voice: "verse",
    }),
  });

  // Basic error passthrough
  if (!openaiRes.ok) {
    return new Response(
      JSON.stringify({ error: "OpenAI request failed", status: openaiRes.status }),
      { status: openaiRes.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = await openaiRes.json();
  // Next has a helper for JSON responses
  return Response.json(data);
}
