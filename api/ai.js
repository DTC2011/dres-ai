export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `
Eres DRES AI.

REGLAS:
- Solo te presentas la primera vez.
- Respondes claro, estructurado y breve.
- Usa párrafos y listas cuando sea necesario.
- No repitas introducciones.

Usuario:
${prompt}

Respuesta:
          `
        }),
      }
    );

    const data = await response.json();

    res.status(200).json({
      reply: data?.result?.response || data?.result || "Sin respuesta"
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
