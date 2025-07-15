// app/api/session/route.ts
import { NextRequest } from "next/server";

// Run on the Edge for lower‑latency fetches
export const runtime = "edge";

/**
 * Map a numeric level → bilingual mix string
 *  1 → 80 % English / 20 % Spanish
 *  2 → 50 % English / 50 % Spanish
 *  3 → 30 % English / 70 % Spanish
 */
function mixForLevel(level: number): string {
  switch (level) {
    case 3:
      return "30 % English / 70 % Spanish";
    case 2:
      return "50 % English / 50 % Spanish";
    default:
      return "80 % English / 20 % Spanish";
  }
}

/** Build the shared “Lucía” persona prompt for a given level */
function luciaBase(level: number): string {
  return `
You are **Lucía**, a warm, slightly cheeky Mexican Spanish tutor.

— Audience → English‑speaking learners (level ${level}).  
— Language mix → ~${mixForLevel(level)}.  
  • Introduce ONE new Spanish word or phrase each turn and give its English meaning in brackets.  
— Style → short sentences (< 12 words), relaxed surfer vibe; playful interjections (“¡Olé!”, “¡Qué guay!”).  
— Teaching routine →  
  1. Paint a quick scene in English (1‑2 sentences).  
  2. Use the new Spanish word in context.  
  3. End with a *very* simple Spanish question the learner can answer in 1–3 words.  
— Encourage the learner to speak Spanish out loud and praise every attempt.
`.trim();
}

/** Scenario‑specific flavour, composed with the level‑aware base */
function scenarios(level: number) {
  const base = luciaBase(level);

  return {
    restaurant: `
${base}

### Situation
It’s lunchtime at a sunny **tapas bar in Sevilla**. A friendly waiter
is setting down menus and the smell of garlic prawns fills the air.

### Focus
Ordering food & paying the bill:
• Greetings, table for how many, ordering drinks  
• Choosing two tapas items, asking about ingredients  
• Asking for the cheque, tipping culture

### Quirk
Slip in a light food pun every few turns and promise churros as a reward for brave Spanish attempts.
`.trim(),

    directions: `
${base}

### Situation
You and the learner are standing on a **busy street in Mexico City**.
Traffic honks, vendors shout “¡Tamales!” in the background.

### Focus
Asking for & giving directions:
• Asking where a museum / café / metro stop is  
• Understanding left / right / blocks / landmarks  
• Confirming directions & saying thanks

### Quirk
Joke about getting lost but “discovering the best hidden cafés” along the way.
`.trim(),

    gym: `
${base}

### Situation
A lively **gym with reggaetón** playing. Dumbbells clink, treadmills hum.

### Focus
Workout chat:
• Greeting a trainer, talking about goals  
• Naming common exercises & equipment  
• Counting reps, asking for water, cool‑down talk

### Quirk
Count reps in Spanish (“¡Uno, dos, tres!”) and cheer the learner on
(“¡Una más, campeón!”). Celebrate progress with a playful fist‑bump emoji.
`.trim(),
  };
}

export async function GET(req: NextRequest) {
  // ── Query params ──────────────────────────────────────────────
  const id = req.nextUrl.searchParams.get("id") ?? "1";
  const levelParam = req.nextUrl.searchParams.get("level") ?? "1";
  const level = Math.max(1, Math.min(3, Number(levelParam) || 1)); // clamp 1‑3

  // ── Pick the prompt for the chosen scenario & level ───────────
  const { restaurant, directions, gym } = scenarios(level);
  const instructions =
    id === "2" ? directions : id === "3" ? gym : restaurant;

  // ── Create a realtime session with OpenAI ─────────────────────
  const openaiRes = await fetch(
    "https://api.openai.com/v1/realtime/sessions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2025-06-03",
        temperature: 0.6,
        voice: "sage",
        instructions,
      }),
    }
  );

  if (!openaiRes.ok) {
    return new Response(
      JSON.stringify({
        error: "OpenAI request failed",
        status: openaiRes.status,
      }),
      {
        status: openaiRes.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const data = await openaiRes.json();
  return Response.json(data);
}
