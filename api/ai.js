export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    console.log("PROMPT:", prompt);

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
Eres DRES AI, un tutor experto en matemáticas y ciencias.

REGLAS:
- Explica paso a paso
- Nunca dejes respuestas incompletas
- Siempre da resultado final claro
- Usa lenguaje simple

Usuario: ${prompt}
Respuesta:
          `
        }),
      }
    );

    const data = await response.json();

    console.log("CLOUDFLARE RAW:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(500).json({
        error: data?.errors?.[0]?.message || data || "Cloudflare error",
      });
    }

    const reply =
      data?.result?.response ||
      data?.result ||
      "Sin respuesta";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }
}
