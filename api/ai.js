export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { prompt } = req.body;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({

  prompt: `
Eres DRES AI, un tutor de matemáticas y ciencias.

REGLAS:
- Responde de forma clara y estructurada.
- Usa títulos y listas cuando sea útil.
- Completa todos los puntos solicitados.
- Incluye UNA SOLA sección llamada "Resultado final".
- Después de escribir "Resultado final", termina inmediatamente la respuesta.
- No repitas conclusiones ni apartados.
- No reinicies la explicación.
- No repitas tu presentación.
- Solo te presentas la primera vez.
- Sé breve cuando sea posible y extenso solo cuando el usuario lo requiera.
Pregunta del usuario:
${prompt}
`,

  max_tokens: 2048

}),
      }
    );

    const data = await response.json();

    console.log("CLOUDFLARE:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(500).json({
        error:
          data?.errors?.[0]?.message ||
          "Error de Cloudflare",
      });
    }

    const reply =
      data?.result?.response ||
      data?.result?.text ||
      (typeof data?.result === "string"
        ? data.result
        : null) ||
      "Sin respuesta";
console.log("RESULT:", JSON.stringify(data.result, null, 2));
    return res.status(200).json({
      reply
    });

  } catch (e) {

    console.error(e);

    return res.status(500).json({
      error: e.message
    });

  }

}
