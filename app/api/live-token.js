const LIVE_MODEL = "gemini-3.1-flash-live-preview";

async function validSupabaseUser(request) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return false;
  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return false;
  const result = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: authorization } });
  return result.ok;
}

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Método não permitido." });
  if (!await validSupabaseUser(request)) return response.status(401).json({ error: "Entre na sua conta para iniciar uma conversa ao vivo." });
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ error: "Áudio ao vivo ainda não configurado." });
  const now = Date.now();
  const body = {
    uses: 1,
    expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
    newSessionExpireTime: new Date(now + 60 * 1000).toISOString()
  };
  try {
    const tokenResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY }, body: JSON.stringify(body) });
    if (!tokenResponse.ok) { console.error("Live token failed", tokenResponse.status, (await tokenResponse.text()).slice(0, 400)); return response.status(502).json({ error: "Não foi possível iniciar o áudio ao vivo." }); }
    const token = await tokenResponse.json();
    return response.status(200).json({ token: token.name, model: LIVE_MODEL, expiresInMinutes: 30 });
  } catch (error) { console.error("Live token error", error instanceof Error ? error.message : "unknown"); return response.status(500).json({ error: "Áudio ao vivo temporariamente indisponível." }); }
}
