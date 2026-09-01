import { initializeDatabase, getUser, getAccessToken, signUp, signIn, signOut, loadMessages, saveMessage, loadEntries, saveEntry, saveCheckin, loadCheckins, deleteAllCloudData } from "./db.js";
import { LiveConversation } from "./live.js";
import { classifyRisk } from "./lib/safety.js";

const LEGACY_MESSAGES_KEY = "cis_messages_v2";
const LEGACY_CONSENT_KEY = "cis_consent_v1";
const LOCAL_MESSAGES_KEY = "casa_mora_messages_v1";
const CONSENT_KEY = "casa_mora_consent_v1";
const PROFILE_KEY = "casa_mora_profile_v1";
const MAPS_KEY = "casa_mora_maps_v1";
const CYCLE_KEY = "casa_mora_cycle_v1";
const OBSERVATIONS_KEY = "casa_mora_body_observations_v1";
const LOCATION_KEY = "casa_mora_location_v1";
let messages = [];
let databaseConfigured = false;
let authMode = "signin";
let sending = false;
let recognition = null;
let listening = false;
let entries = [], checkins = [], draft = null, selectedMood = 0, liveSession = null;
let onboardingStep = 0, onboardingDraft = {};
let maps = [], conversationMode = "balanced", mapDraft = { emotions: [] }, activeMapEmotion = null, mapDeepStep = "body";
let cycleProfile = null, bodyObservations = [], placeContext = null, selectedEnergy = 0, selectedSymptoms = [];

const emotionCatalog = {
  Raiva: { color: "#b75b58", nuances: ["Irritada", "Frustrada", "Impaciente", "Ressentida", "Indignada", "Magoada"], behind: ["Meu limite foi ultrapassado", "Não me senti respeitada", "Estou sobrecarregada", "Minha expectativa se quebrou", "Senti injustiça"] },
  Alegria: { color: "#d6a83d", nuances: ["Contente", "Animada", "Realizada", "Orgulhosa", "Grata", "Esperançosa"], behind: ["Algo deu certo", "Me senti conectada", "Reconheci meu progresso", "Tive espaço para mim", "Recebi algo de que precisava"] },
  Tristeza: { color: "#586f86", nuances: ["Chateada", "Desanimada", "Decepcionada", "Solitária", "Saudosa", "Desamparada"], behind: ["Perdi algo importante", "Me senti sozinha", "Minha expectativa se quebrou", "Estou exausta", "Preciso elaborar o que aconteceu"] },
  Medo: { color: "#745c86", nuances: ["Insegura", "Preocupada", "Ansiosa", "Apreensiva", "Nervosa", "Assustada"], behind: ["Não sei o que vai acontecer", "Tenho medo de errar", "Não me sinto preparada", "Algo parece ameaçador", "Estou sem controle"] },
  Afeto: { color: "#c66f8e", nuances: ["Carinhosa", "Conectada", "Amada", "Acolhida", "Pertencente", "Apaixonada"], behind: ["Me senti vista", "Pude oferecer cuidado", "Recebi presença", "Senti confiança", "Estive perto de quem amo"] },
  Calma: { color: "#788f79", nuances: ["Tranquila", "Aliviada", "Segura", "Presente", "Serena", "Descansada"], behind: ["Consegui desacelerar", "Me senti segura", "Organizei o que precisava", "Aceitei o que não controlo", "Meu corpo descansou"] },
  Sobrecarga: { color: "#b06d4f", nuances: ["Cansada", "Sem energia", "Pressionada", "Agitada", "Exausta", "No limite"], behind: ["Há coisas demais sobre mim", "Estou cuidando de todos", "Não consegui descansar", "Preciso pedir ajuda", "Estou tentando dar conta sozinha"] },
  Rejeição: { color: "#8b6d68", nuances: ["Incomodada", "Ofendida", "Excluída", "Desprezada", "Enojada", "Desconectada"], behind: ["Algo feriu meus valores", "Não me senti incluída", "Meu espaço foi invadido", "Não quero proximidade agora", "Preciso me proteger"] }
};
const bodyOptions = ["Peito", "Garganta", "Cabeça", "Barriga", "Corpo tenso", "Respiração", "Cansaço", "Não percebo no corpo"];
const needOptions = ["Descansar", "Colocar um limite", "Conversar", "Ficar sozinha", "Pedir ajuda", "Organizar pensamentos", "Chorar", "Respirar", "Tomar uma decisão", "Não fazer nada agora"];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
function migrateLegacyStorage() {
  if (!localStorage.getItem(LOCAL_MESSAGES_KEY) && localStorage.getItem(LEGACY_MESSAGES_KEY)) localStorage.setItem(LOCAL_MESSAGES_KEY, localStorage.getItem(LEGACY_MESSAGES_KEY));
  if (!localStorage.getItem(CONSENT_KEY) && localStorage.getItem(LEGACY_CONSENT_KEY)) localStorage.setItem(CONSENT_KEY, localStorage.getItem(LEGACY_CONSENT_KEY));
}
const localMessages = () => JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || "[]");
const saveLocalMessages = () => localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages.slice(-120)));

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function formatTime(iso) { return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso)); }
function toast(message) { const element = $("#toast"); element.textContent = message; element.classList.add("show"); setTimeout(() => element.classList.remove("show"), 2600); }
function showSafety(level) {
  const high=level==="high";$("#safetyEyebrow").textContent=high?"Segurança imediata":"Um cuidado importante";$("#safetyTitle").textContent=high?"Sua segurança vem primeiro":"Você merece apoio e escolha";$("#safetyText").textContent=high?"Se houver perigo agora, use o 190. Para orientação sobre violência contra a mulher, use o 180. Se o risco for de se machucar, use 192 ou CVV 188.":"Se for seguro usar este aparelho, o Ligue 180 oferece orientação 24 horas. Em perigo imediato, use o 190. A Casa Mora não aciona terceiros nem envia alertas.";$("#safetyDialog").dataset.level=level;$("#safetyDialog").showModal();
}

function go(view) {
  $$(".view").forEach((item) => item.classList.toggle("active", item.id === view));
  $$(".bottom-nav button").forEach((item) => item.classList.toggle("active", item.dataset.go === view));
  if (view === "journey") renderJourney(); if (view === "week") renderWeek(); if (view === "reports") renderReports(); if (view === "map") renderMap(); if (view === "rhythm") renderRhythm();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderMessages() {
  const container = $("#chatMessages");
  if (!messages.length) { container.innerHTML = `<article class="message assistant">Estou aqui para te ouvir. O que está pedindo espaço hoje?<span class="message-time">Júlia · Casa Mora</span></article>`; return; }
  container.innerHTML = messages.map((message) => `<article class="message ${message.role} ${message.crisis || (message.risk && message.risk !== "low") ? "crisis" : ""}">${escapeHtml(message.content)}<span class="message-time">${message.role === "assistant" ? "Júlia · Casa Mora · " : ""}${formatTime(message.createdAt)}</span></article>`).join("");
  container.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
}

function showTyping() { const container = $("#chatMessages"); container.insertAdjacentHTML("beforeend", `<article id="typingMessage" class="message assistant"><span class="typing"><i></i><i></i><i></i></span></article>`); container.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" }); }

async function persistMessage(message) {
  saveLocalMessages();
  if (databaseConfigured && getUser()) {
    try { const saved = await saveMessage(message); if (saved) { message.id = saved.id; message.createdAt = saved.created_at; saveLocalMessages(); } }
    catch (error) { console.error("Could not sync message", error); toast("Mensagem salva neste aparelho; sincronização pendente."); }
  }
}

async function sendChat(text) {
  const content = text.trim(); if (!content || sending) return;
  if (databaseConfigured && !getUser()) { showAuth(); return; }
  sending = true; $("#sendButton").disabled = true;
  const userMessage = { id: crypto.randomUUID(), role: "user", content, createdAt: new Date().toISOString(), crisis: false };
  const history = messages.slice(-16).map(({ role, content: value }) => ({ role, content: value }));
  messages.push(userMessage); await persistMessage(userMessage); renderMessages(); showTyping();
  try {
    const token = getAccessToken();
    const profile = getProfile();
    const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ message: content, history, mode: conversationMode, name: profile?.name || "" }) });
    const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Não foi possível conversar agora.");
    const assistantMessage = { id: crypto.randomUUID(), role: "assistant", content: payload.reply, risk: payload.risk || "low", crisis: Boolean(payload.crisis), createdAt: new Date().toISOString() };
    messages.push(assistantMessage); await persistMessage(assistantMessage); if (payload.risk && payload.risk !== "low") showSafety(payload.risk);
  } catch (error) { messages.push({ id: crypto.randomUUID(), role: "assistant", content: error.message, createdAt: new Date().toISOString(), crisis: false }); }
  finally { sending = false; $("#sendButton").disabled = false; renderMessages(); }
}

function renderJourney() {
  const items = [...bodyObservations.map(item=>({type:"Corpo e contexto",text:`Energia ${["muito baixa","baixa","estável","disponível","alta"][item.energy-1]}${item.symptoms?.length?` · ${item.symptoms.join(", ")}`:""}`,date:item.createdAt,detail:item.cyclePhase?`${item.cyclePhase} · ${item.moon||"contexto registrado"}`:item.moon})), ...maps.map(item=>({type:"Mapa de Mim",text:item.emotions.map(e=>`${e.nuance||e.name} (${e.intensity}/10)`).join(" · "),date:item.createdAt,detail:`Precisei de: ${item.need}`})), ...messages.filter(i=>i.role==="user").map(i=>({type:"Conversa",text:i.content,date:i.createdAt})), ...entries.map(i=>({type:"Registro · "+i.emotion,text:i.situation,date:i.created_at,detail:i.thought}))].sort((a,b)=>new Date(b.date)-new Date(a.date));
  $("#emptyJourney").hidden = items.length > 0;
  $("#entryList").innerHTML = items.map((item) => `<article class="card entry-item"><div class="meta"><span>${item.type}</span><span>${new Intl.DateTimeFormat("pt-BR", { dateStyle:"medium",timeStyle:"short" }).format(new Date(item.date))}</span></div><h2>${escapeHtml(item.text)}</h2>${item.detail?`<p>“${escapeHtml(item.detail)}”</p>`:""}</article>`).join("");
}

function inferTheme() {
  const text = [...messages.filter((item) => item.role === "user").map(i=>i.content),...entries.map(i=>`${i.situation} ${i.thought}`)].join(" ").toLocaleLowerCase("pt-BR");
  const themes = [
    { words: ["chefe", "trabalho", "relatório", "crítica", "competente"], title: "Questões de trabalho podem estar ocupando bastante espaço", experiment: "Em uma situação de trabalho, separe em duas frases: o fato observável e a interpretação que apareceu." },
    { words: ["mensagem", "namorado", "namorada", "abandono", "rejeição"], title: "Distância nas relações pode estar sendo interpretada como rejeição", experiment: "Antes de buscar confirmação, escreva duas explicações alternativas para o comportamento da outra pessoa." },
    { words: ["família", "mãe", "pai", "discordou"], title: "Discordâncias familiares podem estar parecendo sinais de desvalorização", experiment: "Observe se discordar de uma ideia necessariamente significa desvalorizar você como pessoa." }
  ];
  return themes.map((theme) => ({ ...theme, score: theme.words.filter((word) => text.includes(word)).length })).sort((a, b) => b.score - a.score)[0];
}

function renderWeek() {
  const userMessages = messages.filter((item) => item.role === "user"), evidenceCount=userMessages.length+entries.length;
  if (evidenceCount < 3) { $("#weekContent").innerHTML = `<div class="card empty-state"><span>◇</span><h2>Ainda estamos conhecendo você</h2><p>Converse ou faça registros. Um episódio isolado não deve virar um padrão.</p><button class="primary" data-go="chat">Continuar conversa</button></div>`; return; }
  const theme = inferTheme();
  $("#weekContent").innerHTML = `<article class="card pattern"><p class="eyebrow">Padrão possível</p><h2>${escapeHtml(theme.title)}</h2><div class="evidence">Essa hipótese considera ${evidenceCount} momentos da sua jornada. Ela pode estar incompleta ou errada.</div><div class="experiment"><strong>Experimento desta semana</strong>${escapeHtml(theme.experiment)}</div><p><strong>Isso faz sentido?</strong></p><div class="feedback"><button data-feedback="sim">Sim</button><button data-feedback="parcialmente">Parcialmente</button><button data-feedback="não">Não</button></div></article>`;
  $("#homeInsight").textContent=theme.title;
}

const onboardingSteps = [
  { key: "name", type: "text", label: "Antes de começar", question: "Como você gostaria de ser chamada?", help: "Usaremos seu nome apenas para deixar este espaço mais humano.", placeholder: "Seu primeiro nome" },
  { key: "cycleStatus", label: "Seu corpo, suas escolhas", question: "Como está seu ciclo", help: "Perguntamos apenas para personalizar o contexto corporal. Você controla o que deseja compartilhar.", options: ["Regular", "Irregular", "Estou na perimenopausa", "Estou na menopausa", "Já passei pela menopausa", "Não menstruo atualmente por outro motivo"] },
  { key: "lastPeriod", type: "date", label: "Seu ciclo", question: "Qual foi o primeiro dia da sua última menstruação?", help: "Use o calendário. Essa data fica neste aparelho nesta versão e não será usada para prever fertilidade.", showIf: draft => ["Regular","Irregular"].includes(draft.cycleStatus) },
  { key: "moment", label: "Seu momento", question: "Como você sente que está chegando aqui?", help: "Não existe resposta certa. Isso só nos ajuda a começar pelo lugar mais útil.", options: ["Quero me reencontrar", "Estou sobrecarregada", "Quero sair do automático", "Estou vivendo uma mudança", "Quero crescer com mais intenção"] },
  { key: "focus", label: "Sua prioridade", question: "Qual área merece mais cuidado agora?", help: "Você poderá mudar essa escolha quando quiser.", options: ["Autoconfiança", "Carreira e propósito", "Relacionamentos", "Equilíbrio emocional", "Hábitos e rotina", "Limites e autocuidado"] },
  { key: "goal", label: "Sua intenção", question: "O que você gostaria de compreender melhor em si?", help: "Não é uma meta. É apenas uma direção que pode mudar quando você quiser.", options: ["Como tomo decisões", "Meus padrões emocionais", "O que meu corpo comunica", "Como me relaciono", "Meu ritmo e meus limites", "Como ser mais gentil comigo"] },
  { key: "rhythm", label: "Seu ritmo", question: "Quando este espaço seria mais útil?", help: "Sem sequência obrigatória e sem cobrança.", options: ["Em pausas curtas", "No fim do dia", "Algumas vezes por semana", "Somente quando eu precisar"] },
  { key: "support", label: "Seu jeito", question: "Como você prefere ser acompanhada?", help: "A Casa Mora ajustará o tom das sugestões, sem fazer diagnósticos.", options: ["Acolhedora e gentil", "Direta e prática", "Reflexiva e profunda", "Uma mistura equilibrada"] }
];
function activeOnboardingSteps(){return onboardingSteps.filter(step=>!step.showIf||step.showIf(onboardingDraft));}

function getProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch { return null; } }
function applyProfile() {
  const profile = getProfile();
  if (!profile) return;
  if (profile.name) $("#homeTitle").textContent = `Como você está, ${profile.name}?`;
  $("#personalWelcome").textContent = profile.focus?`Seu foco agora é ${profile.focus.toLocaleLowerCase("pt-BR")}. Este espaço acompanha seu ritmo, sem cobrança.`:"Este espaço acompanha seu ritmo, sem cobrança.";
  const banner = $("#focusBanner"); banner.hidden = false;
  banner.innerHTML = `<span>O que você quer compreender</span><strong>${escapeHtml(profile.goal||"Seu momento")}</strong><small>${escapeHtml(profile.rhythm||"Quando precisar")} · apoio ${escapeHtml((profile.support||"equilibrado").toLocaleLowerCase("pt-BR"))}</small>`;
}
function openOnboarding(reset = false) {
  onboardingStep = 0; onboardingDraft = reset ? {} : (getProfile() || {});
  renderOnboarding();
  if ($("#privacyDialog").open) $("#privacyDialog").close();
  $("#onboardingDialog").showModal();
}
function renderOnboarding() {
  const steps=activeOnboardingSteps(),step=steps[onboardingStep];
  $("#onboardingStepLabel").textContent = step.label;
  $("#onboardingQuestion").textContent = step.question;
  $("#onboardingHelp").textContent = step.help;
  $("#onboardingProgress").style.width = `${((onboardingStep + 1) / steps.length) * 100}%`;
  $("#onboardingOptions").innerHTML = step.type === "text" ? `<input id="onboardingTextInput" type="text" maxlength="40" autocomplete="given-name" placeholder="${step.placeholder}" value="${escapeHtml(onboardingDraft[step.key] || "")}">` : step.type === "date" ? `<input id="onboardingDateInput" type="date" value="${escapeHtml(onboardingDraft[step.key] || "")}"><p class="data-purpose">Finalidade: estimar o dia do ciclo e relacioná-lo somente aos seus próprios registros. Não é contraceptivo nem diagnóstico.</p>` : step.options.map((option) => `<button type="button" class="${onboardingDraft[step.key] === option ? "selected" : ""}" data-onboarding-option="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("");
  $("#onboardingBack").hidden = onboardingStep === 0;
  $("#onboardingNext").disabled = !String(onboardingDraft[step.key] || "").trim();
  $("#onboardingNext").textContent = onboardingStep === steps.length - 1 ? "Entrar na Casa Mora" : "Continuar";
}

function loadMaps() { try { return JSON.parse(localStorage.getItem(MAPS_KEY) || "[]"); } catch { return []; } }
function persistMaps() { localStorage.setItem(MAPS_KEY, JSON.stringify(maps.slice(0, 90))); }
function renderMap() {
  const orbit = $("#emotionOrbit"), inner = $("#innerMap");
  orbit.innerHTML = Object.entries(emotionCatalog).map(([name,data]) => `<button style="--emotion:${data.color}" class="${mapDraft.emotions.some(e=>e.name===name)?"selected":""}" data-map-emotion="${name}"><i></i>${name}</button>`).join("");
  const positions = [[31,31],[60,27],[46,57]];
  inner.innerHTML = `<span>Eu,<br>hoje</span>` + mapDraft.emotions.map((emotion,index)=>{const size=34+emotion.intensity*5;const pos=positions[index]||positions[0];return `<button class="inside-emotion ${activeMapEmotion===emotion.name?"active":""}" data-inside-emotion="${emotion.name}" title="${emotion.name}: ${emotion.intensity}/10" style="--emotion:${emotionCatalog[emotion.name].color};width:${size}px;height:${size}px;left:${pos[0]}%;top:${pos[1]}%"><b>${emotion.intensity}</b></button>`}).join("");
  const current = mapDraft.emotions.find(e=>e.name===activeMapEmotion);
  $("#mapDetails").hidden = !current;
  $("#mapContinue").disabled = !mapDraft.emotions.length;
  $("#mapInstruction").textContent = mapDraft.emotions.length ? `${mapDraft.emotions.length} emoção${mapDraft.emotions.length>1?"ões":""} no seu mapa. Você pode escolher até três.` : "Toque em uma emoção para colocá-la no seu mapa.";
  if(current){$("#mapIntensity").value=current.intensity;$("#mapIntensityValue").textContent=current.intensity;$("#mapNuances").innerHTML=emotionCatalog[current.name].nuances.map(n=>`<button type="button" class="${current.nuance===n?"selected":""}" data-map-nuance="${n}">${n}</button>`).join("");}
}
function chooseMapEmotion(name) {
  let current=mapDraft.emotions.find(e=>e.name===name);
  if(!current){if(mapDraft.emotions.length>=3)return toast("Escolha até três emoções");current={name,intensity:5,nuance:""};mapDraft.emotions.push(current);}
  activeMapEmotion=name;renderMap();
}
function startMapDeepDive() {
  activeMapEmotion = [...mapDraft.emotions].sort((a,b)=>b.intensity-a.intensity)[0]?.name;
  if(!activeMapEmotion)return;
  mapDeepStep="body"; $("#mapEditor").hidden=true; $("#mapDeepDive").hidden=false; $("#mapResult").hidden=true;
  $$(".map-deep-step").forEach(el=>el.hidden=el.dataset.mapStep!=="body");
  $("#bodyChoices").innerHTML=bodyOptions.map(value=>`<button type="button" data-map-body="${value}">${value}</button>`).join("");
  $("#behindChoices").innerHTML=emotionCatalog[activeMapEmotion].behind.map(value=>`<button type="button" data-map-behind="${value}">${value}</button>`).join("");
  $("#needChoices").innerHTML=needOptions.map(value=>`<button type="button" data-map-need="${value}">${value}</button>`).join("");
  $("#saveMap").disabled=true;
}
function advanceMapDeep(step,value) {
  mapDraft[step]=value;
  const selector=step==="body"?"[data-map-body]":step==="behind"?"[data-map-behind]":"[data-map-need]";
  $$(selector).forEach(button=>button.classList.toggle("selected",button.textContent===value));
  if(step==="body"){mapDeepStep="behind";$("[data-map-step='body']").hidden=true;$("[data-map-step='behind']").hidden=false;}
  else if(step==="behind"){mapDeepStep="need";$("[data-map-step='behind']").hidden=true;$("[data-map-step='need']").hidden=false;}
  else $("#saveMap").disabled=false;
}
function saveCurrentMap() {
  const item={id:crypto.randomUUID(),createdAt:new Date().toISOString(),emotions:mapDraft.emotions.map(e=>({...e})),body:mapDraft.body,behind:mapDraft.behind,need:mapDraft.need};
  maps.unshift(item);persistMaps();
  const strongest=[...item.emotions].sort((a,b)=>b.intensity-a.intensity)[0];
  $("#mapDeepDive").hidden=true;$("#mapResult").hidden=false;
  $("#mapResult").innerHTML=`<p class="eyebrow">Hoje, dentro de você</p><h2>${escapeHtml(strongest.nuance||strongest.name)} está ocupando mais espaço.</h2><p>Talvez você não precise resolver tudo agora. Você percebeu que <strong>${escapeHtml(item.behind.toLocaleLowerCase("pt-BR"))}</strong> e escolheu <strong>${escapeHtml(item.need.toLocaleLowerCase("pt-BR"))}</strong>.</p><blockquote>Você não precisa estar bem o tempo todo para estar inteira.</blockquote><div class="actions"><button class="secondary" data-go="journey">Ver na jornada</button><button class="primary" data-start-path="action">Transformar em um passo</button></div>`;
  mapDraft={emotions:[]};activeMapEmotion=null;renderJourney();renderReports();
}

function readLocal(key, fallback=null){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}}
function daysBetween(a,b=new Date()){const start=new Date(`${a}T12:00:00`),end=new Date(b);end.setHours(12,0,0,0);return Math.round((end-start)/86400000);}
function getMoon(date=new Date()){
  const synodic=29.53058867, knownNew=Date.UTC(2000,0,6,18,14), age=((date.getTime()-knownNew)/86400000%synodic+synodic)%synodic;
  const phases=[{to:1.845,name:"Lua nova",symbol:"●"},{to:5.536,name:"Crescente",symbol:"◔"},{to:9.228,name:"Quarto crescente",symbol:"◐"},{to:12.919,name:"Gibosa crescente",symbol:"◕"},{to:16.61,name:"Lua cheia",symbol:"○"},{to:20.302,name:"Gibosa minguante",symbol:"◕"},{to:23.993,name:"Quarto minguante",symbol:"◑"},{to:27.684,name:"Minguante",symbol:"◒"},{to:30,name:"Lua nova",symbol:"●"}];
  return {...phases.find(item=>age<item.to),age};
}
function getSeason(latitude){
  const month=new Date().getMonth()+1, south=latitude==null?true:latitude<0;
  const seasons=south?[[12,1,2,"Verão"],[3,4,5,"Outono"],[6,7,8,"Inverno"],[9,10,11,"Primavera"]]:[[12,1,2,"Inverno"],[3,4,5,"Primavera"],[6,7,8,"Verão"],[9,10,11,"Outono"]];
  return seasons.find(item=>item.slice(0,3).includes(month))[3];
}
function getCycleState(date=new Date()){
  if(!cycleProfile?.lastPeriod||cycleProfile.disabled)return null;
  const elapsed=daysBetween(cycleProfile.lastPeriod,date); if(elapsed<0)return null;
  const length=Number(cycleProfile.length)||28, day=(elapsed%length)+1, bleed=Number(cycleProfile.bleed)||5;
  if(cycleProfile.irregular)return {day,phase:"Ciclo irregular",note:`Dia ${day} desde o início informado. Sem estimar fases.`};
  let phase="Fase folicular"; if(day<=bleed)phase="Menstruação";else if(day>=length-13&&day<=length-11)phase="Janela ovulatória estimada";else if(day>length-11)phase="Fase lútea";
  return {day,phase,note:`Dia ${day} de um ciclo médio informado de ${length} dias.`};
}
const weatherLabels={0:"céu limpo",1:"predominantemente limpo",2:"parcialmente nublado",3:"nublado",45:"neblina",48:"neblina",51:"garoa leve",53:"garoa",55:"garoa forte",61:"chuva leve",63:"chuva",65:"chuva forte",80:"pancadas de chuva",81:"pancadas de chuva",82:"pancadas fortes",95:"trovoadas"};
async function requestPlaceContext(){
  if(!navigator.geolocation)return toast("Localização não disponível neste navegador.");
  navigator.geolocation.getCurrentPosition(async position=>{
    try{const {latitude,longitude}=position.coords;const weather=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`).then(r=>r.json());
      placeContext={latitude:Number(latitude.toFixed(2)),longitude:Number(longitude.toFixed(2)),city:"Sua região",temperature:weather.current?.temperature_2m,weatherCode:weather.current?.weather_code,timezone:weather.timezone,updatedAt:new Date().toISOString()};localStorage.setItem(LOCATION_KEY,JSON.stringify(placeContext));renderRhythm();toast("Contexto local atualizado");
    }catch{toast("Não foi possível consultar o clima agora.");}
  },()=>toast("Localização não autorizada. Você pode continuar sem ela."),{enableHighAccuracy:false,timeout:10000,maximumAge:3600000});
}
function lifeThemeCounts(){
  const text=[...messages.filter(item=>item.role==="user").map(item=>item.content),...entries.map(item=>`${item.situation} ${item.thought} ${item.reaction}`)].join(" ").toLocaleLowerCase("pt-BR");
  const themes={Família:["família","mãe","pai","filho","filha","marido","casa"],Exercícios:["exercício","academia","treino","correr","caminhada"],Alimentação:["comida","alimentação","almoço","jantar","fome"],Espiritualidade:["fé","oração","espiritual","igreja","meditação"],Amigos:["amiga","amigo","amizade"],Trabalho:["trabalho","chefe","cliente","reunião","projeto"],Estudo:["estudo","curso","faculdade","prova","aprender"],Aventura:["viagem","aventura","passeio","novidade","explorar"]};
  return Object.entries(themes).map(([name,words])=>({name,count:words.reduce((sum,word)=>sum+(text.match(new RegExp(`\\b${word}`,"g"))||[]).length,0)}));
}
function renderLifePie(){
  const colors=["#b75b78","#cf8c77","#d4ad5c","#8a9b76","#668b91","#79688e","#a56f9b","#9b7967"],counts=lifeThemeCounts(),max=Math.max(1,...counts.map(item=>item.count)),hasData=counts.some(item=>item.count);
  $("#lifePie").innerHTML=counts.map((item,index)=>{const size=hasData?52+(item.count/max)*72:62;return `<span style="--life:${colors[index]};width:${size}px;height:${size}px" title="${item.name}: presença relativa"><b>${item.name}</b></span>`}).join("");
  $("#lifePieNote").textContent=hasData?"Tamanho relativo à presença dos temas nas suas conversas e registros.":"Ainda não há relatos suficientes. Os círculos começarão do mesmo tamanho.";
}
function renderCycleInsights(){
  if(bodyObservations.length<6){$("#cycleInsights").innerHTML=`<p>Ainda estamos conhecendo você. Depois de pelo menos 6 observações — idealmente ao longo de 2 ciclos — poderemos comparar energia, corpo e contexto.</p>`;return;}
  const groups={};bodyObservations.forEach(item=>{const key=item.cyclePhase||"Sem fase estimada";(groups[key]||=[]).push(item);});
  $("#cycleInsights").innerHTML=Object.entries(groups).filter(([,items])=>items.length>=2).map(([phase,items])=>{const avg=items.reduce((s,i)=>s+i.energy,0)/items.length;const words=["muito baixa","mais baixa","estável","mais disponível","alta"];return `<p><strong>${escapeHtml(phase)}:</strong> em ${items.length} registros, sua energia apareceu ${words[Math.max(0,Math.round(avg)-1)]}. Veja isso como uma pista revisável.</p>`}).join("")||"<p>Há observações, mas ainda não repetições suficientes por fase. Continue apenas quando tiver vontade.</p>";
}
function renderRhythm(){
  const moon=getMoon(),season=getSeason(placeContext?.latitude),month=new Intl.DateTimeFormat("pt-BR",{month:"long"}).format(new Date()),cycle=getCycleState();
  $("#natureContext").innerHTML=`<article class="nature-tile moon"><span>${moon.symbol}</span><small>Lua hoje</small><strong>${moon.name}</strong><em>Contexto simbólico, sem efeito presumido sobre o humor.</em></article><article class="nature-tile"><span>⌁</span><small>${month}</small><strong>${season}</strong><em>${placeContext?`Hemisfério da sua localização`:"Estimativa para o hemisfério sul"}</em></article><article class="nature-tile weather"><span>≈</span><small>${placeContext?.city||"Clima local"}</small><strong>${placeContext?.temperature!=null?`${Math.round(placeContext.temperature)}°C · ${weatherLabels[placeContext.weatherCode]||"condição atual"}`:"Você escolhe se quer compartilhar"}</strong>${placeContext?`<div class="city-label"><input id="cityName" maxlength="50" placeholder="Nome da sua cidade" value="${placeContext.city==="Sua região"?"":escapeHtml(placeContext.city)}"><button id="saveCity" class="secondary">Nomear</button></div>`:""}<button id="useLocation" class="text-button">${placeContext?"Atualizar localização":"Usar minha localização"}</button></article>`;
  $("#cycleCard").innerHTML=cycle?`<p class="eyebrow">Seu ciclo hoje</p><h2>${escapeHtml(cycle.phase)}</h2><p>${escapeHtml(cycle.note)}</p><p class="cycle-caution">Uma estimativa de contexto baseada no que você informou. Não prevê fertilidade e não substitui acompanhamento de saúde.</p><button id="editCycle" class="secondary">Rever dados do ciclo</button>`:`<p class="eyebrow">Seu corpo, no seu tempo</p><h2>${cycleProfile?.disabled?"Ciclo não acompanhado":"Quer acompanhar seu ciclo?"}</h2><p>Opcional. A Casa Mora observará seus próprios registros, sem dizer como você deveria se sentir.</p><button id="editCycle" class="secondary">${cycleProfile?.disabled?"Mudar minha escolha":"Configurar com cuidado"}</button>`;
  $("#homeMoon").textContent=moon.symbol;$("#homeCycle").textContent=cycle?`${cycle.phase} · dia ${cycle.day}`:"Conheça seu ritmo";$("#homeWeather").textContent=placeContext?`${placeContext.city} · ${Math.round(placeContext.temperature)}°C · ${moon.name}`:`${moon.name} · ${season} · clima opcional`;renderCycleInsights();renderLifePie();
}

function renderReports() {
  const profile = getProfile();
  const ordered = [...checkins].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)).slice(-7);
  const moodAvg = ordered.length ? ordered.reduce((sum,item)=>sum+Number(item.mood),0)/ordered.length : 0;
  const emotionCounts = entries.reduce((acc,item)=>{acc[item.emotion]=(acc[item.emotion]||0)+1;return acc;},{});
  maps.forEach(map=>map.emotions.forEach(emotion=>{const name=emotion.nuance||emotion.name;emotionCounts[name]=(emotionCounts[name]||0)+1;}));
  const maxEmotion = Math.max(1,...Object.values(emotionCounts));
  const moodBars = ordered.length ? ordered.map(item=>`<div class="mood-column"><span style="height:${Math.max(12,Number(item.mood)*18)}%"></span><small>${new Intl.DateTimeFormat("pt-BR",{weekday:"narrow"}).format(new Date(item.created_at))}</small></div>`).join("") : `<p class="chart-empty">Faça check-ins para visualizar sua evolução.</p>`;
  const emotionBars = Object.entries(emotionCounts).length ? Object.entries(emotionCounts).sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<div class="horizontal-bar"><label>${escapeHtml(name)}</label><span><i style="width:${(count/maxEmotion)*100}%"></i></span><b>${count}</b></div>`).join("") : `<p class="chart-empty">Seus registros formarão este mapa emocional.</p>`;
  $("#reportContent").innerHTML = `<div class="report-summary"><article class="metric"><span>${ordered.length}</span><small>check-ins recentes</small></article><article class="metric"><span>${moodAvg?moodAvg.toFixed(1):"—"}</span><small>humor médio / 5</small></article><article class="metric"><span>${maps.length}</span><small>Mapas de Mim</small></article><article class="metric"><span>${bodyObservations.length}</span><small>observações do corpo</small></article></div>
  ${profile?`<article class="card intention-card"><p class="eyebrow">Seu plano de início</p><h2>${escapeHtml(profile.goal)}</h2><div class="intention-tags"><span>${escapeHtml(profile.focus)}</span><span>${escapeHtml(profile.rhythm)}</span></div><p>Você chegou querendo: ${escapeHtml(profile.moment.toLocaleLowerCase("pt-BR"))}.</p></article>`:""}
  <article class="card report-card"><div class="report-heading"><div><p class="eyebrow">Últimos check-ins</p><h2>Ritmo do seu humor</h2></div><strong>${moodAvg ? (moodAvg>=4?"fase mais leve":moodAvg>=3?"fase oscilante":"fase delicada") : "comece hoje"}</strong></div><div class="mood-chart">${moodBars}</div><p class="report-note">Isto mostra tendência de registros, não avaliação clínica.</p></article>
  <article class="card report-card"><p class="eyebrow">O que mais apareceu</p><h2>Mapa de emoções</h2><div class="emotion-chart">${emotionBars}</div></article>
  <article class="card report-card"><p class="eyebrow">Próxima leitura</p><h2>Conexões da sua semana</h2><p>Veja uma hipótese revisável baseada nos momentos que você registrou.</p><button class="secondary" data-go="week">Abrir análise semanal</button></article>`;
}

function setupVoice() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!Recognition) { $("#voiceButton").hidden = true; return; }
  recognition = new Recognition(); recognition.lang = "pt-BR"; recognition.interimResults = true; recognition.continuous = false; let finalText = "";
  recognition.onstart = () => { listening = true; finalText = ""; $("#voiceButton").classList.add("listening"); $("#voiceStatus").hidden = false; };
  recognition.onresult = (event) => { let interim = ""; for (let index = event.resultIndex; index < event.results.length; index += 1) { if (event.results[index].isFinal) finalText += event.results[index][0].transcript; else interim += event.results[index][0].transcript; } $("#chatInput").value = `${finalText}${interim}`.trim(); };
  recognition.onerror = (event) => { if (event.error !== "no-speech") toast("Não consegui ouvir. Verifique a permissão do microfone."); };
  recognition.onend = () => { listening = false; $("#voiceButton").classList.remove("listening"); $("#voiceStatus").hidden = true; $("#chatInput").focus(); };
}


function showEntryReview(){ $("#reviewCard").innerHTML=`<dl><div><dt>Situação</dt><dd>${escapeHtml(draft.situation)}</dd></div><div><dt>Pensamento</dt><dd>“${escapeHtml(draft.thought)}”</dd></div><div><dt>Emoção</dt><dd>${escapeHtml(draft.emotion)} · ${draft.intensity}/10</dd></div><div><dt>Reação</dt><dd>${escapeHtml(draft.reaction)}</dd></div></dl>`;go("review");requestEntryReflection(); }
async function requestEntryReflection(){const box=$("#aiReflection");box.hidden=false;box.className="card ai-card loading";box.textContent="Preparando uma reflexão…";try{const response=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(draft)});const data=await response.json();if(!response.ok)throw new Error(data.error);draft.analysis=data;box.className="card ai-card";box.innerHTML=`<p class="eyebrow">Uma reflexão possível</p><h2>${escapeHtml(data.reflection)}</h2><p class="alternative"><strong>Outra explicação:</strong> ${escapeHtml(data.alternative)}</p><p><strong>Para refletir:</strong> ${escapeHtml(data.question)}</p>`;}catch(error){box.className="card ai-card";box.textContent="A reflexão por IA está indisponível, mas você pode guardar o registro.";}}

async function startLive(){if(!getUser()){showAuth();return}try{const response=await fetch("/api/voice-session",{method:"POST",headers:{Authorization:`Bearer ${getAccessToken()}`}});const data=await response.json();if(!response.ok)throw new Error(data.error);liveSession=new LiveConversation({signedUrl:data.signedUrl,onStatus:text=>{$("#liveStatus").textContent=text;$("#liveOrb").classList.toggle("active",text.includes("Ouvindo")||text.includes("falando"));},onTranscript:(text,role)=>{$("#liveTranscript").textContent=`${role==="user"?"Você":"Júlia"}: ${text}`;},onTurn:async(role,content)=>{const risk=role==="user"?classifyRisk(content):{level:"low"};const message={id:crypto.randomUUID(),role,content,createdAt:new Date().toISOString(),risk:risk.level,crisis:risk.level==="high"};messages.push(message);await persistMessage(message);renderMessages();if(risk.level!=="low"){liveSession?.stop();liveSession=null;$("#liveControl").textContent="Iniciar conversa ao vivo";showSafety(risk.level);}}});await liveSession.start();$("#liveControl").textContent="Encerrar conversa";}catch(error){liveSession?.stop();liveSession=null;toast(error.message);$("#liveStatus").textContent="Não foi possível iniciar";}}
function stopLive(){liveSession?.stop();liveSession=null;$("#liveControl").textContent="Iniciar conversa";}

function openPractice(type){const practices={breathing:["Respiração 4–6","Inspire enquanto o círculo cresce. Expire devagar enquanto ele diminui.","Começar"],grounding:["5–4–3–2–1","Observe: 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira e 1 que saboreia.","Começar"],pearl:["A próxima pérola","Pense em uma ação tão pequena que possa existir sem ficar perfeita. Pode ser abrir um arquivo, separar um objeto ou escrever uma frase. Você escolhe se hoje é dia de agir ou descansar.","Guardar para mim"],freepage:["Página livre","Se quiser, escreva à mão por alguns minutos sem corrigir. Esta proposta é privada: a Casa Mora só deve ler uma foto ou texto se você escolher compartilhar de forma específica.","Entendi"],creative:["Encontro comigo","Escolha até 20 minutos nesta semana para algo que desperte curiosidade ou prazer. Não precisa produzir, publicar ou melhorar em nada.","Levar como convite"]};const [title,text,action]=practices[type]||practices.grounding;$("#practiceDialog").showModal();$("#practiceVisual").classList.remove("active");$("#practiceTitle").textContent=title;$("#practiceText").textContent=text;$("#practiceControl").disabled=false;$("#practiceControl").textContent=action;$("#practiceControl").dataset.type=type;}

function showAuth() { if (!databaseConfigured || getUser() || $("#authDialog").open || $("#welcomeDialog").open) return; $("#authDialog").showModal(); }
function updateAuthUi() { const signup = authMode === "signup"; $("#authTitle").textContent = signup ? "Criar conta" : "Entrar na Casa Mora"; $("#authSubmit").textContent = signup ? "Criar minha conta" : "Entrar"; $("#authSwitch").textContent = signup ? "Já tenho uma conta" : "Ainda não tenho conta"; $("#authPassword").autocomplete = signup ? "new-password" : "current-password"; $("#authError").textContent = ""; }

async function refreshForUser() {
  $("#logoutButton").hidden = !getUser();
  if (getUser()) { try { [messages,entries,checkins]=await Promise.all([loadMessages(),loadEntries(),loadCheckins()]); messages=messages||[]; saveLocalMessages(); renderMessages(); renderWeek(); renderRhythm(); if ($("#authDialog").open) $("#authDialog").close(); } catch (error) { toast("Não foi possível carregar sua jornada."); console.error(error); } }
  else if (databaseConfigured) { messages = []; renderMessages(); showAuth(); }
}

$("#chatForm").addEventListener("submit", (event) => { event.preventDefault(); const input = $("#chatInput"); const value = input.value; input.value = ""; sendChat(value); });
$("#chatInput").addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); $("#chatForm").requestSubmit(); } });
$("#voiceButton").addEventListener("click", () => { if (!recognition) return; listening ? recognition.stop() : recognition.start(); });
$("#entryForm").addEventListener("submit",event=>{event.preventDefault();if(!$("#emotion").value)return toast("Escolha uma emoção");draft={situation:$("#situation").value.trim(),thought:$("#thought").value.trim(),emotion:$("#emotion").value,intensity:Number($("#intensity").value),reaction:$("#reaction").value.trim()};showEntryReview();});
$("#emotionGrid").addEventListener("click",event=>{const button=event.target.closest("[data-emotion]");if(!button)return;$$('[data-emotion]').forEach(x=>x.classList.toggle("selected",x===button));$("#emotion").value=button.dataset.emotion;});
$("#intensity").addEventListener("input",event=>$("#intensityValue").textContent=event.target.value);
$("#editEntry").addEventListener("click",()=>go("organize"));
$("#confirmEntry").addEventListener("click",async()=>{try{const saved=await saveEntry(draft);entries.unshift(saved);$("#entryForm").reset();$("#emotion").value="";$$('[data-emotion]').forEach(x=>x.classList.remove("selected"));draft=null;toast("Registro guardado");go("journey");}catch(error){toast("Não foi possível guardar o registro")}});
$("#moodPicker").addEventListener("click",event=>{const button=event.target.closest("[data-mood]");if(!button)return;selectedMood=Number(button.dataset.mood);$$('[data-mood]').forEach(x=>x.classList.toggle("selected",x===button));$("#saveMood").disabled=false;});
$("#saveMood").addEventListener("click",async()=>{try{const item=await saveCheckin(selectedMood,$("#moodNote").value.trim());checkins.unshift(item);toast("Check-in guardado");$("#saveMood").disabled=true;const profile=getProfile();$("#afterCheckinTitle").textContent=profile?.name?`${profile.name}, o que ajudaria neste momento?`:"O que ajudaria neste momento?";$("#afterCheckinDialog").showModal();}catch{toast("Entre para guardar seu check-in");showAuth();}});
$("#startLiveButton").addEventListener("click",()=>$("#liveDialog").showModal());$("#liveControl").addEventListener("click",()=>liveSession?stopLive():startLive());$("#closeLive").addEventListener("click",()=>{stopLive();$("#liveDialog").close();});
document.addEventListener("click",event=>{const practice=event.target.closest("[data-practice]");if(practice)openPractice(practice.dataset.practice);});
$("#practiceControl").addEventListener("click",()=>{const type=$("#practiceControl").dataset.type;if(type==="breathing"){$("#practiceVisual").classList.add("active");$("#practiceControl").textContent="Respirando…";setTimeout(()=>{$("#practiceVisual").classList.remove("active");$("#practiceControl").textContent="Concluído";},60000);}else if(type==="grounding")$("#practiceText").textContent="5 coisas que vê → 4 que toca → 3 que ouve → 2 cheiros → 1 sabor.";else{$("#practiceControl").textContent="Convite guardado";$("#practiceControl").disabled=true;}});
$("#authSwitch").addEventListener("click", () => { authMode = authMode === "signin" ? "signup" : "signin"; updateAuthUi(); });
$("#authForm").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#authError").textContent = ""; $("#authSubmit").disabled = true;
  try {
    const email = $("#authEmail").value.trim(); const password = $("#authPassword").value;
    if (authMode === "signup") { const result = await signUp(email, password); if (!result.session) { authMode = "signin"; updateAuthUi(); $("#authError").textContent = "Conta criada. Confira seu e-mail para confirmar e depois entre."; return; } }
    else await signIn(email, password); await refreshForUser();
  } catch (error) { $("#authError").textContent = error.message || "Não foi possível continuar."; }
  finally { $("#authSubmit").disabled = false; }
});

document.addEventListener("click", (event) => {
  const route = event.target.closest("[data-go]"); if (route) { route.closest("dialog")?.close(); go(route.dataset.go); }
  const path = event.target.closest("[data-start-path]"); if(path){conversationMode=path.dataset.startPath;updateConversationMode();path.closest("dialog")?.close();go("chat");}
  const mode = event.target.closest("[data-mode]"); if(mode){conversationMode=mode.dataset.mode;updateConversationMode();}
  if (event.target.closest("[data-feedback]")) toast("Obrigada. Sua avaliação foi registrada nesta sessão.");
});
function updateConversationMode(){
  const labels={vent:"Só desabafar: vou acolher sem tentar consertar.",understand:"Me entender: vamos nomear e chegar a uma síntese.",unstuck:"Destravar: vamos distinguir bloqueio de cansaço e encontrar um movimento possível.",create:"Criar: vamos dar espaço à curiosidade, sem cobrança de produzir.",action:"Próximo passo: vamos escolher algo pequeno e possível.",balanced:"Modo equilibrado: acolher, sintetizar e ajudar."};
  $$("[data-mode]").forEach(button=>button.classList.toggle("selected",button.dataset.mode===conversationMode));
  $("#modeStatus").textContent=labels[conversationMode];
}
$("#emotionOrbit").addEventListener("click",event=>{const button=event.target.closest("[data-map-emotion]");if(button)chooseMapEmotion(button.dataset.mapEmotion);});
$("#innerMap").addEventListener("click",event=>{const button=event.target.closest("[data-inside-emotion]");if(button){activeMapEmotion=button.dataset.insideEmotion;renderMap();}});
$("#mapIntensity").addEventListener("input",event=>{const current=mapDraft.emotions.find(item=>item.name===activeMapEmotion);if(current){current.intensity=Number(event.target.value);renderMap();}});
$("#mapNuances").addEventListener("click",event=>{const button=event.target.closest("[data-map-nuance]");const current=mapDraft.emotions.find(item=>item.name===activeMapEmotion);if(button&&current){current.nuance=button.dataset.mapNuance;renderMap();}});
$("#mapContinue").addEventListener("click",startMapDeepDive);
$("#bodyChoices").addEventListener("click",event=>{const button=event.target.closest("[data-map-body]");if(button)advanceMapDeep("body",button.dataset.mapBody);});
$("#behindChoices").addEventListener("click",event=>{const button=event.target.closest("[data-map-behind]");if(button)advanceMapDeep("behind",button.dataset.mapBehind);});
$("#needChoices").addEventListener("click",event=>{const button=event.target.closest("[data-map-need]");if(button)advanceMapDeep("need",button.dataset.mapNeed);});
$("#saveMap").addEventListener("click",saveCurrentMap);
document.addEventListener("click",event=>{
  if(event.target.closest("#useLocation"))requestPlaceContext();
  if(event.target.closest("#saveCity")){const value=$("#cityName")?.value.trim();if(value&&placeContext){placeContext.city=value;localStorage.setItem(LOCATION_KEY,JSON.stringify(placeContext));renderRhythm();toast("Cidade guardada neste aparelho");}}
  if(event.target.closest("#editCycle")){const c=cycleProfile||{};$("#lastPeriod").value=c.lastPeriod||"";$("#cycleLength").value=c.length||28;$("#bleedLength").value=c.bleed||5;$("#irregularCycle").checked=Boolean(c.irregular);$("#cycleDialog").showModal();}
  const energy=event.target.closest("[data-scale='energy'] [data-value]");if(energy){selectedEnergy=Number(energy.dataset.value);$$('[data-scale="energy"] [data-value]').forEach(button=>button.classList.toggle("selected",button===energy));}
  const symptom=event.target.closest("[data-symptom]");if(symptom){const value=symptom.dataset.symptom;if(value==="Nenhum"){selectedSymptoms=["Nenhum"];}else{selectedSymptoms=selectedSymptoms.filter(item=>item!=="Nenhum");selectedSymptoms.includes(value)?selectedSymptoms=selectedSymptoms.filter(item=>item!==value):selectedSymptoms.push(value);}$$('[data-symptom]').forEach(button=>button.classList.toggle("selected",selectedSymptoms.includes(button.dataset.symptom)));}
});
$("#cycleForm").addEventListener("submit",event=>{event.preventDefault();if(!$("#lastPeriod").value)return toast("Informe o primeiro dia da última menstruação");cycleProfile={lastPeriod:$("#lastPeriod").value,length:Number($("#cycleLength").value),bleed:Number($("#bleedLength").value),irregular:$("#irregularCycle").checked,disabled:false,updatedAt:new Date().toISOString()};localStorage.setItem(CYCLE_KEY,JSON.stringify(cycleProfile));$("#cycleDialog").close();renderRhythm();toast("Dados do ciclo guardados neste aparelho");});
$("#disableCycle").addEventListener("click",()=>{cycleProfile={disabled:true,updatedAt:new Date().toISOString()};localStorage.setItem(CYCLE_KEY,JSON.stringify(cycleProfile));$("#cycleDialog").close();renderRhythm();});
$("#bodyObservationForm").addEventListener("submit",event=>{event.preventDefault();if(!selectedEnergy)return toast("Escolha como está sua energia hoje");const cycle=getCycleState();bodyObservations.unshift({id:crypto.randomUUID(),createdAt:new Date().toISOString(),energy:selectedEnergy,symptoms:[...selectedSymptoms],note:$("#bodyObservationNote").value.trim(),cycleDay:cycle?.day||null,cyclePhase:cycle?.phase||null,moon:getMoon().name,season:getSeason(placeContext?.latitude),weather:placeContext?{city:placeContext.city,temperature:placeContext.temperature,code:placeContext.weatherCode}:null});localStorage.setItem(OBSERVATIONS_KEY,JSON.stringify(bodyObservations.slice(0,180)));selectedEnergy=0;selectedSymptoms=[];event.target.reset();$$('[data-scale="energy"] [data-value], [data-symptom]').forEach(button=>button.classList.remove("selected"));renderRhythm();renderJourney();renderReports();toast("Observação guardada, sem pontuação");});
$("#consentCheck").addEventListener("change", (event) => $("#startButton").disabled = !event.target.checked);
$("#startButton").addEventListener("click", () => { localStorage.setItem(CONSENT_KEY, "true"); $("#welcomeDialog").close(); openOnboarding(true); });
$("#onboardingOptions").addEventListener("click", (event) => { const button=event.target.closest("[data-onboarding-option]"); if(!button)return; const step=activeOnboardingSteps()[onboardingStep];onboardingDraft[step.key]=button.dataset.onboardingOption;if(step.key==="cycleStatus"&&!["Regular","Irregular"].includes(button.dataset.onboardingOption))delete onboardingDraft.lastPeriod;renderOnboarding(); });
$("#onboardingOptions").addEventListener("input", (event) => { if(!["onboardingTextInput","onboardingDateInput"].includes(event.target.id))return; const step=activeOnboardingSteps()[onboardingStep];onboardingDraft[step.key]=event.target.value.trim(); $("#onboardingNext").disabled=!event.target.value.trim(); });
$("#onboardingBack").addEventListener("click", () => { if(onboardingStep>0){onboardingStep-=1;renderOnboarding();} });
$("#onboardingNext").addEventListener("click", () => { const steps=activeOnboardingSteps(),step=steps[onboardingStep];if(!onboardingDraft[step.key])return;if(onboardingStep<steps.length-1){onboardingStep+=1;renderOnboarding();return;}const menstruates=["Regular","Irregular"].includes(onboardingDraft.cycleStatus);cycleProfile={status:onboardingDraft.cycleStatus,lastPeriod:menstruates?onboardingDraft.lastPeriod:null,length:28,bleed:5,irregular:onboardingDraft.cycleStatus==="Irregular",disabled:!menstruates,updatedAt:new Date().toISOString()};localStorage.setItem(CYCLE_KEY,JSON.stringify(cycleProfile));localStorage.setItem(PROFILE_KEY,JSON.stringify({...onboardingDraft,createdAt:new Date().toISOString()}));$("#onboardingDialog").close();applyProfile();renderRhythm();renderReports();toast("Seu espaço está pronto");showAuth(); });
$("#redoOnboarding").addEventListener("click",()=>openOnboarding(true));
$("#privacyButton").addEventListener("click", () => $("#privacyDialog").showModal());
$$('.dialog-close').forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
$("#logoutButton").addEventListener("click", async () => { await signOut(); $("#privacyDialog").close(); messages = []; renderMessages(); showAuth(); });
$("#deleteAll").addEventListener("click", async () => { if (!confirm("Apagar permanentemente toda a sua jornada? Esta ação não pode ser desfeita.")) return; try { if (databaseConfigured && getUser()) await deleteAllCloudData(); messages=[];entries=[];checkins=[];maps=[];bodyObservations=[];cycleProfile=null;placeContext=null;[LOCAL_MESSAGES_KEY,MAPS_KEY,CYCLE_KEY,OBSERVATIONS_KEY,LOCATION_KEY].forEach(key=>localStorage.removeItem(key));$("#privacyDialog").close();renderMessages();renderMap();renderRhythm();toast("Sua jornada foi apagada"); } catch (error) { toast("Não foi possível apagar os dados."); console.error(error); } });
$("#exportData").addEventListener("click", () => { const blob = new Blob([JSON.stringify({profile:getProfile(),messages,entries,checkins,maps,cycleProfile,bodyObservations,placeContext}, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "casa-mora-minha-jornada.json"; link.click(); URL.revokeObjectURL(link.href); });
window.addEventListener("casa-mora-auth-change", refreshForUser);

function enhanceBenchmarkingUi(){
  const modes=$("#conversationModes");
  if(modes&&!modes.querySelector('[data-mode="unstuck"]')) modes.querySelector('[data-mode="action"]')?.insertAdjacentHTML("beforebegin",'<button data-mode="unstuck">Destravar</button><button data-mode="create">Criar</button>');
  const needs=$(".need-grid");
  if(needs&&!needs.querySelector('[data-start-path="unstuck"]')) needs.querySelector('[data-go="practices"]')?.insertAdjacentHTML("beforebegin",'<button data-start-path="unstuck"><span>↗</span><strong>Quero destravar</strong><small>Encontrar um movimento possível</small></button><button data-start-path="create"><span>✦</span><strong>Quero criar</strong><small>Dar espaço ao que quer nascer</small></button>');
  const grid=$("#practices .practice-grid");
  if(grid&&!grid.querySelector('[data-practice="pearl"]')) grid.insertAdjacentHTML("beforeend",'<article class="card practice"><span>DESTRAVAR</span><h2>A próxima pérola</h2><p>Escolha uma ação pequena que não precisa ser perfeita.</p><button class="secondary" data-practice="pearl">Encontrar um movimento</button></article><article class="card practice"><span>CRIAR</span><h2>Página livre</h2><p>Escreva sem editar. O conteúdo continua privado até você escolher compartilhar.</p><button class="secondary" data-practice="freepage">Abrir proposta</button></article><article class="card practice"><span>CRIAR</span><h2>Encontro comigo</h2><p>Um tempo curto para curiosidade e prazer, sem meta de desempenho.</p><button class="secondary" data-practice="creative">Planejar com leveza</button></article>');
  const practiceHero=$("#practices .hero");if(practiceHero){practiceHero.querySelector(".eyebrow").textContent="Biblioteca da Júlia";practiceHero.querySelector("p:last-child").textContent="Escolha uma ferramenta. Nenhuma prática é obrigação ou substitui cuidado profissional.";}
  $$("main > .view").forEach((view,index)=>{if(!view.querySelector(":scope > .view-closing"))view.insertAdjacentHTML("beforeend",`<footer class="view-closing" aria-hidden="true"><span class="closing-leaf">⌁</span><p>${index%2?"Entre, respire, você importa.":"Você não precisa dar conta de tudo. Só precisa dar o próximo passo."}</p><i></i></footer>`);});
}

async function start() {
  migrateLegacyStorage();
  enhanceBenchmarkingUi();maps = loadMaps(); cycleProfile=readLocal(CYCLE_KEY);bodyObservations=readLocal(OBSERVATIONS_KEY,[]);placeContext=readLocal(LOCATION_KEY);updateConversationMode();renderMap();renderRhythm();
  const hour = new Date().getHours(); $("#greeting").textContent = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  messages = localMessages(); renderMessages(); setupVoice(); updateAuthUi(); applyProfile(); if (!localStorage.getItem(CONSENT_KEY)) $("#welcomeDialog").showModal(); else if (!getProfile()) openOnboarding(true);
  try { const state = await initializeDatabase(); databaseConfigured = state.configured; await refreshForUser(); } catch (error) { databaseConfigured = false; console.error("Supabase initialization failed", error); toast("Modo local ativo: banco ainda não conectado."); }
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("service-worker.js");
}

start();
