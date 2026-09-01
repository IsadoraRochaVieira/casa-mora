# MVP online da Casa Mora

Protótipo com histórico local e uma função de servidor que usa Gemini para gerar a reflexão de cada registro.

## Produção

https://app-pi-murex-25.vercel.app

## Executar

Na pasta `app`, rode um servidor estático. Exemplos:

```powershell
npx serve .
```

ou, se houver Python:

```powershell
python -m http.server 4173
```

Depois abra `http://localhost:4173` (ou a URL informada pelo servidor).

## O que funciona

- Consentimento inicial e limites do produto.
- Registro guiado de situação, pensamento, emoção, intensidade e reação.
- Revisão antes de salvar.
- Histórico, exclusão e exportação de dados.
- Reflexão por IA usando `gemini-3.5-flash-lite`.
- Conversa contínua com contexto recente.
- Ditado por voz usando Web Speech API quando suportado pelo navegador.
- Login por e-mail e senha com Supabase Auth.
- Sincronização das mensagens no Postgres com isolamento por usuário (RLS).
- Hipótese semanal simples após dois registros.
- Aviso de crise por palavras-chave.
- Instalação como PWA e cache offline quando servido por HTTP/HTTPS.

## Limites desta versão

As hipóteses semanais usam regras locais demonstrativas; não há autenticação, sincronização, criptografia de banco ou protocolo de crise validado. No nível gratuito da API, dados podem ser usados pelo Google para melhorar seus produtos. Não usar este protótipo como produto de saúde em produção nem inserir dados reais sensíveis sem revisar os termos e a privacidade.

## Integração de IA futura

A chave existe somente na variável de ambiente `GEMINI_API_KEY` da Vercel. O navegador chama `/api/analyze`, e essa rota valida a entrada, chama o modelo e valida a resposta estruturada. Nunca colocar uma chave secreta em `app.js`.

## Supabase

1. Crie ou conecte um projeto Supabase.
2. Aplique `supabase/migrations/202608240001_initial_schema.sql`.
3. Cadastre `SUPABASE_URL` e `SUPABASE_ANON_KEY` na Vercel para produção.
4. Configure a URL do site e os redirects permitidos no Supabase Auth.

A chave `anon`/publishable pode aparecer no cliente porque a autorização real é feita pelas políticas RLS. Nunca exponha a `service_role`.
