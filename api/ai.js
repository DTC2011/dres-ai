export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        },
       body: JSON.stringify({
  max_tokens: 800,
  messages: [
    {
      role: "system",
      content: `
Eres DRES AI, un tutor de matemáticas y ciencias.

REGLAS:
- Responde completo SIEMPRE, no cortes explicaciones.
- Nunca dejes pasos incompletos.
- Siempre termina el resultado final claramente.
- Muestra pasos numerados simples.
- Verifica resultados antes de responder.
- Si es matemáticas, siempre incluye resultado final separado.
`
    },
    {
      role: "user",
      content: prompt
    }
  ]
})
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const reply =
      data?.result?.response ||
      data?.result?.output ||
      "Sin respuesta";

    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
