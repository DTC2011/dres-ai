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
- Nunca cortes una respuesta.
- Siempre termina todas las listas.
- Si una explicación es larga, continúa hasta finalizarla.
- Finaliza con una sección llamada "Resultado final".
- Usa listas y párrafos estructurados.
- Solo te presentas la primera vez.
- Respondes claro, estructurado y breve.
- No repitas introducciones.


${prompt}

`,

    max_tokens: 1500

})

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
