// Cloudflare Pages Function — runs server-side at /api/ai-question
// Reads GROQ_API_KEY from the Pages project's Environment Variables
// (Cloudflare dashboard → your project → Settings → Environment variables → add GROQ_API_KEY as a Secret).
// The key never reaches the browser this way.

export async function onRequestPost(context) {
  const { env } = context;

  if (!env.GROQ_API_KEY) {
    return json({ error: 'GROQ_API_KEY is not set on this Cloudflare Pages project.' }, 500);
  }

  const prompt = `Generate exactly one random, moderately challenging school/competitive-exam level maths question (topics vary: arithmetic, algebra, geometry, percentages, time-speed-distance, probability, etc). Respond with ONLY raw JSON, no markdown fences, no explanation, in this exact shape: {"question": "string", "options": ["a","b","c","d"], "answerIndex": 0}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return json({ error: `Groq request failed (${res.status}): ${errText}` }, 502);
    }

    const data = await res.json();
    let text = data.choices?.[0]?.message?.content || '';
    text = text.replace(/```json|```/g, '').trim();
    const question = JSON.parse(text);
    return json(question, 200);
  } catch (e) {
    return json({ error: e.message || 'Unexpected error contacting Groq.' }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
