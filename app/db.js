let client = null;
let currentUser = null;
let currentSession = null;

export async function initializeDatabase() {
  const config = await fetch("/api/config").then((response) => response.json()).catch(() => ({}));
  if (!config.supabaseUrl || !config.supabaseAnonKey) return { configured: false, user: null };
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const { data: sessionData } = await client.auth.getSession();
  currentSession = sessionData.session || null;
  currentUser = currentSession?.user || null;
  client.auth.onAuthStateChange((_event, session) => { currentSession = session; currentUser = session?.user || null; window.dispatchEvent(new CustomEvent("casa-mora-auth-change", { detail: currentUser })); });
  return { configured: true, user: currentUser };
}

export const getUser = () => currentUser;
export const getAccessToken = () => currentSession?.access_token || "";

export async function signUp(email, password) {
  if (!client) throw new Error("Supabase não configurado.");
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!client) throw new Error("Supabase não configurado.");
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function loadMessages(limit = 80) {
  if (!client || !currentUser) return null;
  const { data, error } = await client.from("messages").select("id, role, content, created_at, crisis").order("created_at", { ascending: true }).limit(limit);
  if (error) throw error;
  return data.map((item) => ({ id: item.id, role: item.role, content: item.content, createdAt: item.created_at, crisis: item.crisis }));
}

export async function saveMessage(message) {
  if (!client || !currentUser) return null;
  const { data, error } = await client.from("messages").insert({ user_id: currentUser.id, role: message.role, content: message.content, crisis: Boolean(message.crisis) }).select("id, created_at").single();
  if (error) throw error;
  return data;
}

export async function loadEntries(limit = 60) {
  if (!client || !currentUser) return [];
  const { data, error } = await client.from("entries").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

export async function saveEntry(entry) {
  const { data, error } = await client.from("entries").insert({ user_id: currentUser.id, situation: entry.situation, thought: entry.thought, emotion: entry.emotion, intensity: entry.intensity, reaction: entry.reaction, ai_reflection: entry.analysis || null }).select().single();
  if (error) throw error;
  return data;
}

export async function saveCheckin(mood, note = "") {
  const { data, error } = await client.from("checkins").insert({ user_id: currentUser.id, mood, note }).select().single();
  if (error) throw error;
  return data;
}

export async function loadCheckins(limit = 14) {
  if (!client || !currentUser) return [];
  const { data, error } = await client.from("checkins").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

export async function loadGoals() {
  if (!client || !currentUser) return [];
  const { data, error } = await client.from("goals").select("*").order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data;
}

export async function saveGoal(title) {
  const { data, error } = await client.from("goals").insert({ user_id: currentUser.id, title }).select().single();
  if (error) throw error;
  return data;
}

export async function toggleGoal(id, completed) {
  const { error } = await client.from("goals").update({ completed }).eq("id", id);
  if (error) throw error;
}

export async function deleteAllCloudData() {
  if (!client || !currentUser) return;
  for (const table of ["messages", "entries", "checkins", "goals"]) {
    const { error } = await client.from(table).delete().eq("user_id", currentUser.id);
    if (error) throw error;
  }
}
