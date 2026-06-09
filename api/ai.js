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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `
Eres DRES AI, tutor de matemáticas y ciencias.

REGLAS:
- Explica paso a paso
- Responde claro y completo
- Da resultado final

Usuario: ${prompt}
Respuesta:
          `
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.result?.response ||
      data?.result ||
      "Sin respuesta";

    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
