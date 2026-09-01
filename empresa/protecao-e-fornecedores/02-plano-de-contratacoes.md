# Plano das três contratações

## 1. Privacidade e LGPD

### Contratar para

- inventário e fluxo de dados;
- definição de controlador, operadores e bases legais;
- Política de Privacidade, Termos e consentimentos por finalidade;
- política de retenção, descarte, acesso e atendimento às titulares;
- RIPD e análise de alto risco;
- contratos e anexos de tratamento com fornecedores;
- plano de resposta a incidentes;
- análise sobre encarregado/DPO e canal de privacidade.

### Critérios mínimos

- experiência comprovada com aplicativo, IA e dados sensíveis;
- entrega personalizada, não somente modelos genéricos;
- profissional responsável identificado;
- oficina com as sócias e desenvolvedores;
- suporte durante a implementação das recomendações.

### Momento

Contratar primeiro, antes de sincronizar dados de ciclo ou ampliar o piloto.

## 2. Cibersegurança e pentest

### Contratar para

- teste do aplicativo web/PWA e APIs;
- autenticação, autorização e isolamento entre usuárias;
- políticas RLS do Supabase;
- exposição de chaves e segredos;
- abuso de APIs, rate limiting e validação de entrada;
- configuração da Vercel e integrações;
- teste de exclusão/exportação e vazamento por logs;
- relatório executivo e técnico, evidências, severidade e reteste.

### Critérios mínimos

- metodologia declarada e autorização formal;
- proteção dos dados usados no teste;
- pentesters identificados e experiência verificável;
- nenhuma alteração destrutiva em produção sem autorização;
- reteste incluído e prazo para dúvidas;
- declaração clara do que ficou fora do escopo.

### Momento

Depois das correções básicas e antes do piloto público. Repetir após mudanças relevantes.

## 3. Tecnologia e infraestrutura

### Responsabilidades

- manter ambientes separados;
- gestão de segredos e acessos administrativos;
- isolamento por usuária e testes automatizados;
- backup e restauração comprovada;
- observabilidade sem registrar conteúdo íntimo desnecessário;
- atualização de dependências e correção de vulnerabilidades;
- procedimentos de deploy, rollback e incidente;
- execução dos achados da LGPD e do pentest.

### Decisão atual

Esta frente já existe parcialmente no desenvolvimento do MVP. Antes de contratar outra empresa, documentar arquitetura, propriedade do código, acessos e responsabilidade operacional.

## Apoios especializados adicionais

Não são uma “quarta empresa de segurança”, mas devem entrar por projeto:

- psicóloga/consultora clínica para limites e testes da Júlia;
- contabilidade para estrutura societária, tributação e contratos;
- jurídico regulatório/consumidor, se o escopo se aproximar de saúde;
- responsável de produto: Mariana e Isadora.
