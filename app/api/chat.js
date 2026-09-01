import { classifyRisk, safetyReply } from "../lib/safety.js";

const MODEL = "gemini-3.5-flash-lite";
const MAX_MESSAGE = 1600;
const MAX_HISTORY = 16;

function clean(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Método não permitido." });
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ error: "A conversa ainda não foi configurada." });

  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const authorization = request.headers.authorization || "";
    if (!authorization.startsWith("Bearer ")) return response.status(401).json({ error: "Entre na sua conta para conversar." });
    try {
      const authResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: authorization } });
      if (!authResponse.ok) return response.status(401).json({ error: "Sua sessão expirou. Entre novamente." });
    } catch (_error) { return response.status(503).json({ error: "Não foi possível validar sua sessão." }); }
  }

  const message = clean(request.body?.message, MAX_MESSAGE);
  const mode = ["vent", "understand", "unstuck", "create", "action"].includes(request.body?.mode) ? request.body.mode : "balanced";
  const name = clean(request.body?.name, 40).replace(/[^\p{L}\p{M}\s'-]/gu, "");
  if (!message) return response.status(400).json({ error: "Escreva ou fale uma mensagem." });
  const risk = classifyRisk(message);
  if (risk.level !== "low") return response.status(200).json({ reply: safetyReply(risk), risk: risk.level, crisis: risk.level === "high" });

  const history = Array.isArray(request.body?.history) ? request.body.history.slice(-MAX_HISTORY) : [];
  const contents = history.map((item) => ({
    role: item?.role === "assistant" ? "model" : "user",
    parts: [{ text: clean(item?.content, MAX_MESSAGE) }]
  })).filter((item) => item.parts[0].text);
  contents.push({ role: "user", parts: [{ text: message }] });

  const modeGuidance = {
    vent: "MODO SÓ DESABAFAR: acolha e reflita o que ouviu. Não dê conselho e, em regra, não faça perguntas.",
    understand: "MODO ENTENDER: ajude a nomear emoção, fato, pensamento e necessidade. Após até duas rodadas de exploração, entregue uma síntese.",
    unstuck: "MODO DESTRAVAR: investigue brevemente se há medo, exaustão, perfeccionismo ou falta de clareza. Não presuma preguiça. Ofereça uma ação minúscula e opcional, que não precisa ser perfeita.",
    create: "MODO CRIAR: acolha a ideia sem transformá-la em produtividade. Ajude a abrir espaço para curiosidade, expressão e um experimento criativo pequeno, privado e opcional.",
    action: "MODO PRÓXIMO PASSO: vá direto a uma síntese breve e ofereça um passo pequeno, concreto e possível para hoje.",
    balanced: "MODO EQUILIBRADO: acolha, compreenda e avance para uma síntese ou pequeno passo sem prolongar a investigação."
  }[mode];
  const instruction = `Você é Júlia, a presença conversacional da Casa Mora, uma companhia de autoconhecimento emocional criada especialmente para mulheres e inspirada em princípios da TCC. Converse em português brasileiro, com calor humano, curiosidade gentil, leveza e respostas curtas.
${name ? `A usuária prefere ser chamada de ${name}. Use o primeiro nome ocasionalmente, nunca em toda resposta.` : ""}
${modeGuidance}
REGRA CENTRAL: não transforme a conversa em interrogatório. Nunca faça mais de uma pergunta por resposta e não termine toda resposta com pergunta. Depois de no máximo duas respostas exploratórias, pare de investigar e entregue, quando fizer sentido: “O que estou percebendo”, “O que pode estar por trás” e “Um próximo passo possível”.
SEQUÊNCIA: acolha, escute, faça uma pergunta que aumente a clareza, devolva o que apareceu e preserve a escolha da mulher. Prefira “o que faz sentido para você?”, “uma possibilidade” e “você pode escolher”. Não dê ordens, não use “você tem que” ou “você deve”, não decida por ela e não entregue soluções prontas como regra.
Ajude a separar fato observável, pensamento automático, emoção, comportamento, consequência e necessidade. Validar não significa concordar com toda interpretação.
Quando houver contexto suficiente, conecte com algo já dito, mas trate padrões como hipóteses: “pode ser”, “talvez”, “veja se faz sentido”. Dê permissão explícita para a pessoa pausar e não resolver tudo agora.
Não diagnostique, não prescreva, não afirme intenções de terceiros, não substitua terapia e não estimule dependência. Não diga que é terapeuta.
Não peça nome completo, endereço, documentos ou dados desnecessários. Se houver urgência médica ou risco, recomende ajuda local imediata.`;

  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instruction }] }, contents,
        generationConfig: { temperature: 0.55, maxOutputTokens: 450 }
      })
    });
    if (!geminiResponse.ok) {
      const details = await geminiResponse.text();
      console.error("Gemini chat failed", geminiResponse.status, details.slice(0, 500));
      return response.status(502).json({ error: "A Casa Mora não conseguiu responder agora. Tente novamente em instantes." });
    }
    const payload = await geminiResponse.json();
    const reply = clean(payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n"), 3000);
    if (!reply) return response.status(502).json({ error: "A Casa Mora não retornou uma resposta." });
    return response.status(200).json({ reply, risk: "low", crisis: false, model: MODEL });
  } catch (error) {
    console.error("Chat route error", error instanceof Error ? error.message : "unknown");
    return response.status(500).json({ error: "A conversa está temporariamente indisponível." });
  }
}
