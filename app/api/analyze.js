const MODEL = "gemini-3.5-flash-lite";
const MAX_LENGTH = 2400;

const systemInstruction = `Você é a camada de reflexão da Casa Mora, um produto de autoconhecimento e desenvolvimento pessoal para mulheres, inspirado em TCC.
Não é terapeuta e não diagnostica. Nunca afirme transtornos, traumas, intenções de terceiros ou verdades sobre a personalidade.
Organize o relato com linguagem acolhedora, breve e probabilística. Não dê orientação médica.
Preserve a autonomia: não use ordens, não diga o que a mulher deve fazer e apresente alternativas como possibilidades que ela pode aceitar ou não.
Retorne somente JSON válido no formato pedido.`;

function clean(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Método não permitido." });
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ error: "A IA ainda não foi configurada." });

  const situation = clean(request.body?.situation, 800);
  const thought = clean(request.body?.thought, 500);
  const emotion = clean(request.body?.emotion, 40);
  const reaction = clean(request.body?.reaction, 500);
  const intensity = Number(request.body?.intensity);
  const total = situation.length + thought.length + emotion.length + reaction.length;
  if (!situation || !thought || !emotion || !reaction || total > MAX_LENGTH || intensity < 1 || intensity > 10) {
    return response.status(400).json({ error: "Registro incompleto ou inválido." });
  }

  const prompt = `${systemInstruction}

Analise este registro confirmado pelo usuário:
- Situação observável: ${situation}
- Pensamento automático: ${thought}
- Emoção: ${emotion} (${intensity}/10)
- Reação: ${reaction}

Retorne este JSON:
{
  "reflection": "uma reflexão de até 35 palavras que separe fato de interpretação",
  "alternative": "uma explicação alternativa plausível, sem invalidar a emoção, até 25 palavras",
  "question": "uma pergunta curta para a pessoa refletir",
  "theme": "uma categoria entre trabalho, relacionamento, família, autoestima, incerteza ou outro"
}`;

  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3, maxOutputTokens: 300 },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
      })
    });
    if (!geminiResponse.ok) {
      const details = await geminiResponse.text();
      console.error("Gemini request failed", geminiResponse.status, details.slice(0, 500));
      return response.status(502).json({ error: "Não conseguimos gerar a reflexão agora. Seu registro continua disponível." });
    }
    const payload = await geminiResponse.json();
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return response.status(502).json({ error: "A IA não retornou uma reflexão." });
    const analysis = JSON.parse(text);
    return response.status(200).json({
      reflection: clean(analysis.reflection, 320), alternative: clean(analysis.alternative, 240),
      question: clean(analysis.question, 220), theme: clean(analysis.theme, 40), model: MODEL
    });
  } catch (error) {
    console.error("Analyze route error", error instanceof Error ? error.message : "unknown");
    return response.status(500).json({ error: "A reflexão está temporariamente indisponível." });
  }
}
