# Mapa atual de dados e fornecedores

## Fluxo resumido do MVP

```text
Usuária no navegador
  ├─ conta e sessão ───────────────> Supabase Auth
  ├─ mensagens e registros ───────> Supabase/Postgres
  ├─ conversa escrita ────────────> API Vercel ──> Google Gemini
  ├─ conversa por voz ────────────> API Vercel ──> ElevenLabs
  ├─ localização, se autorizada ──> navegador ───> serviço de clima
  └─ perfil/ciclo/contexto atual ─> armazenamento local do aparelho
```

## Inventário inicial

| Dado | Finalidade atual | Onde fica | Quem pode receber | Sensibilidade | Decisão pendente |
|---|---|---|---|---|---|
| E-mail e identificador | Cadastro e login | Supabase | Supabase, Casa Mora | Pessoal | Retenção após exclusão |
| Senha | Autenticação | Supabase Auth | Supabase | Credencial | Exigir controles administrativos fortes |
| Nome de preferência | Personalização | Armazenamento local | Navegador | Pessoal | Se será sincronizado |
| Conversas escritas | Resposta e memória | Supabase e APIs | Vercel, Gemini, Supabase | Potencialmente sensível | Retenção, treinamento e transferência internacional |
| Transcrições de voz | Continuidade e histórico | ElevenLabs e Supabase, conforme fluxo | ElevenLabs, Vercel, Supabase | Potencialmente sensível | Retenção exata no provedor de voz |
| Registros emocionais | Jornada e relatórios | Supabase | Supabase, Casa Mora | Potencialmente sensível | Política de acesso interno |
| Estado/ciclo menstrual | Contexto corporal | Armazenamento local nesta versão | Navegador | Saúde/sensível | Não sincronizar antes de consentimento e RIPD |
| Localização aproximada | Clima local | Uso sob autorização | Navegador e serviço meteorológico | Pessoal | Confirmar precisão e logs do fornecedor |
| Sinais de segurança | Interromper fluxo e orientar | Processamento local/API | Casa Mora e infraestrutura | Altamente delicado | Retenção mínima e protocolo validado |

## Fornecedores identificados no código atual

| Fornecedor | Função | Situação |
|---|---|---|
| Vercel | Hospedagem e funções de API | Ativo em produção |
| Supabase | Autenticação e banco de dados | Ativo/configurado |
| Google Gemini | IA da conversa escrita e reflexões | Ativo via variável secreta |
| ElevenLabs | Conversa de voz | Ativo via sessão assinada |
| jsDelivr | Entrega do cliente Supabase no navegador | Ativo no frontend |
| Open-Meteo | Clima por localização opcional | Ativo; recebe latitude/longitude arredondadas pelo app |

## Lacunas que a consultoria deve validar

- Controlador, operadores e eventuais suboperadores.
- Regiões de armazenamento e transferências internacionais.
- Uso de conteúdo para treinamento por cada plano contratado.
- Prazos reais de retenção, inclusive backups e logs.
- Exclusão propagada entre Casa Mora e fornecedores.
- Quem, internamente, pode acessar conteúdo e em qual situação.
- Base legal e consentimentos separados por finalidade.
- Processo para exportação, correção, revogação e exclusão.
- Necessidade e conteúdo do RIPD.
