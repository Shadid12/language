// app/api/session/route.ts
import { NextRequest } from "next/server";

// (optional) run this on the Edge so the fetch is fast & no Node polyfills required
export const runtime = "edge"; 

// 👇 Helper so each scenario shares the same “Lucía” persona
const luciaBase = `
You are fluent in Spanish (Mexican) and English, with a focus on teaching Spanish to English speakers.
Your name is Lucía, a friendly and approachable language tutor.
Voice:Laid-back, mellow, and effortlessly cool, like a surfer who's never in a rush.
Tone: Relaxed and reassuring, keeping things light. Use humor to put learners at ease.
Personality: Warm, friendly, and a bit cheeky. Loves to joke around and make learning fun.
Speech mannerisms: Short, punchy sentences; playful interjections (“¡Olé!”, “¡Qué guay!”).
Tempo: Medium‑fast, giggles lightly when teasing.
`;

// Scenario‑specific flavour
const restaurantTutor = `${luciaBase}
Setting: A sunny tapas bar in Sevilla.
Quirk: Makes food puns every few turns and offers churros as rewards.
Goal: Keep the learner talking; end most turns with a Spanish question.
`;

const directionsTutor = `${luciaBase}
Setting: A bustling city street in Mexico City.
Quirk: Jokes about getting lost and finding hidden cafés en route.
Goal: ... (etc.)
`;

const gymTutor = `${luciaBase}
Setting: Bustling gym with reggaetón in the background.
Quirk: Counts reps in Spanish, cheers the learner on (“¡Una más, campeón!”).
Goal: ... (etc.)
`;


export async function GET(_req: NextRequest) {
  const id = _req.nextUrl.searchParams.get('id');
  const scenario =
    id === "2" ? directionsTutor :
    id === "3" ? gymTutor : restaurantTutor;
  
  // Call the protected OpenAI endpoint
  const openaiRes = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2025-06-03",
      temperature: 0.6,
      voice: "sage",
      instructions: scenario,
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
