const normalize = (value) => String(value || "").toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const HIGH_RISK = [
  "me matar", "vai me matar", "tirar minha vida", "nao quero viver", "nao quero mais viver", "vou me machucar", "suicidio",
  "ele vai me matar", "ameacou me matar", "estou em perigo agora", "agressor esta aqui",
  "tem uma arma", "nao consigo sair", "violencia acontecendo agora"
];

const ATTENTION = [
  "me bateu", "me agrediu", "me ameacou", "tenho medo dele", "tenho medo dela",
  "controla meu celular", "controla meu dinheiro", "nao me deixa sair", "me persegue",
  "violencia domestica", "abuso", "chantagem", "forcou sexo", "sem consentimento"
];

export function classifyRisk(message) {
  const text = normalize(message);
  if (HIGH_RISK.some(term => text.includes(term))) return { level: "high", reason: "immediate_or_self_harm_language" };
  if (ATTENTION.some(term => text.includes(term))) return { level: "attention", reason: "violence_or_control_language" };
  return { level: "low", reason: "no_explicit_signal" };
}

export function safetyReply(risk) {
  if (risk.level === "high") return "O que você contou pode indicar risco imediato. Se for seguro usar este aparelho, ligue 190 agora ou procure um lugar com outras pessoas. Para orientação e apoio sobre violência contra a mulher, ligue 180. Se o risco for de você se machucar, ligue 192 ou CVV 188. Você não precisa explicar mais nada aqui para buscar ajuda.";
  if (risk.level === "attention") return "Obrigada por me contar. O que você descreveu merece cuidado e não precisa ser resolvido sozinha. Sem entrar em detalhes que possam te expor: você está em segurança para continuar usando este aparelho? Para orientação sigilosa sobre violência contra a mulher, o Ligue 180 funciona 24 horas; em risco imediato, ligue 190.";
  return null;
}
