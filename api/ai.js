export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;
    console.log("PROMPT:", prompt);

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    console.log("ACCOUNT:", accountId ? "exists" : "MISSING");
    console.log("TOKEN:", apiToken ? "exists" : "MISSING");

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "Eres DRES AI, un tutor de matemáticas y ciencias. Responde completo SIEMPRE, no cortes explicaciones. Nunca dejes pasos incompletos. Siempre termina el resultado final claramente. Muestra pasos numerados simples. Verifica resultados antes de responder. Si es matemáticas, siempre incluye resultado final separado.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("CLOUDFLARE RAW:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log("Cloudflare error:", JSON.stringify(data, null, 2));
      return res.status(500).json({
        error: data?.errors?.[0]?.message || data || "Cloudflare error",
      });
    }

    const result = data?.result;

    const reply =
      typeof result?.response === "string"
        ? result.response
        : result?.response?.response
        ?? result?.output
        ?? result?.text
        ?? (typeof result === "string" ? result : null)
        ?? "Sin respuesta";

    res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }
}
