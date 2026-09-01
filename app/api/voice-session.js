async function validSupabaseUser(request) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return false;
  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return false;
  const result = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: authorization } });
  return result.ok;
}

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Método não permitido." });
  if (!await validSupabaseUser(request)) return response.status(401).json({ error: "Entre na sua conta para conversar por voz." });
  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_AGENT_ID) return response.status(503).json({ error: "Conversa por voz ainda não configurada." });
  try {
    const url = new URL("https://api.elevenlabs.io/v1/convai/conversation/get-signed-url");
    url.searchParams.set("agent_id", process.env.ELEVENLABS_AGENT_ID);
    const signedResponse = await fetch(url, { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY } });
    if (!signedResponse.ok) {
      console.error("ElevenLabs signed URL failed", signedResponse.status, (await signedResponse.text()).slice(0, 300));
      return response.status(signedResponse.status === 429 ? 429 : 502).json({ error: signedResponse.status === 429 ? "A franquia gratuita de voz foi atingida." : "Não foi possível iniciar a conversa por voz." });
    }
    const data = await signedResponse.json();
    return response.status(200).json({ signedUrl: data.signed_url, provider: "elevenlabs" });
  } catch (error) {
    console.error("ElevenLabs session error", error instanceof Error ? error.message : "unknown");
    return response.status(500).json({ error: "Conversa por voz temporariamente indisponível." });
  }
}
