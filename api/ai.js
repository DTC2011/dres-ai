export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "No API key" });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

 const data = await response.json();

if (!response.ok) {
  return res.status(500).json({ error: data });
}

console.log("Gemini response:", JSON.stringify(data, null, 2));

const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!reply) {
  return res.status(500).json({ error: data });
}

res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
