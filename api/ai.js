export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { prompt } = req.body;

    // Validación básica
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Prompt inválido",
      });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `
Eres DRES AI, un tutor de matemáticas y ciencias.

REGLAS IMPORTANTES:
- Responde de forma clara y estructurada.
- Usa títulos y listas cuando sea útil.
- Completa toda la respuesta sin cortarla.
- Incluye SOLO UNA sección llamada "Resultado final".
- No repitas "Resultado final".
- No reinicies la explicación.
- Sé claro y evita redundancias.

Pregunta del usuario:
${prompt}
          `,
          max_tokens: 768,
        }),
      }
    );

    const data = await response.json();

    console.log("CLOUDFLARE:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(500).json({
        error: data?.errors?.[0]?.message || "Error de Cloudflare",
      });
    }

    let reply =
      data?.result?.response ||
      data?.result?.text ||
      (typeof data?.result === "string" ? data.result : null) ||
      "Sin respuesta";

    console.log("RAW RESULT:", JSON.stringify(data.result, null, 2));

    // 🧠 FIX 1: cortar loops de "Resultado final"
    reply = reply.split("Resultado final").slice(0, 2).join("Resultado final");

    // 🧠 FIX 2: evitar respuestas extremadamente largas o repetidas
    const lines = reply.split("\n");
    const cleanedLines = [];
    const seen = new Set();

    for (const line of lines) {
      if (!seen.has(line)) {
        cleanedLines.push(line);
        seen.add(line);
      }
    }

    reply = cleanedLines.join("\n");

    return res.status(200).json({
      reply,
    });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: e.message,
    });
  }
}
