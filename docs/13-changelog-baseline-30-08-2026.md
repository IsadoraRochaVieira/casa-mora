# Casa Mora — Changelog do baseline

**Data:** 30 de agosto de 2026  
**Baseline:** Casa Mora — Plano de Ação Executável + Relatório de Decisões

## Inventário anterior

O aplicativo já possuía: acolhimento inicial, perfil pelo nome, chat escrito, voz ao vivo, registro guiado, Mapa de Mim, jornada, relatórios, práticas, autenticação Supabase, exportação/exclusão e um alerta simples para linguagem suicida. O ciclo existia como configuração opcional dentro de Meu ritmo, mas não obedecia ao onboarding fechado do documento. A camada de risco estava misturada à rota de conversa e não contemplava sinais de violência e controle.

## Divergências encontradas

1. Onboarding não perguntava “Como está seu ciclo” com as seis categorias fechadas.
2. Calendário não aparecia condicionalmente no onboarding.
3. A presença conversacional era identificada apenas como Casa Mora, sem Júlia.
4. O prompt preservava autonomia, mas não explicitava a sequência acolher, ouvir, perguntar, devolver e favorecer escolha.
5. Risco era apenas uma lista curta de termos de autoagressão dentro do chat.
6. Não havia estado separado de atenção para violência, ameaça ou controle.
7. Privacidade não distinguia dados sincronizados, dados locais, localização e finalidade da análise de risco.
8. Canais 180 e o limite de não acionamento automático não apareciam no fluxo próprio de proteção.

## Alterações implementadas

### Onboarding e ciclo

- Pergunta preservada: **Como está seu ciclo**.
- Opções exatas: Regular; Irregular; Estou na perimenopausa; Estou na menopausa; Já passei pela menopausa; Não menstruo atualmente por outro motivo.
- Nenhuma pergunta sobre DIU.
- Calendário condicional para Regular e Irregular.
- Finalidade do dado explicada na própria tela.
- Data salva localmente nesta versão; uso limitado à estimativa do ciclo e comparação com registros pessoais.

### Júlia e autonomia

- Júlia identificada no chat e na transcrição de voz.
- Prompt revisto para acolher, escutar, fazer no máximo uma pergunta útil, devolver o que apareceu e preservar a decisão da mulher.
- Proibidas ordens, “você deve”, “você tem que”, diagnósticos e soluções universais.
- Camada de reflexão também recebeu regra explícita de autonomia.

### Segurança

- Criado módulo independente `lib/safety.js`.
- Estados internos: baixo risco, atenção e risco elevado.
- Risco elevado interrompe o fluxo conversacional comum e prioriza orientação curta.
- Atenção oferece pergunta discreta de segurança e canais de orientação.
- Interface própria de proteção com 190, 180 e 188.
- A mesma classificação é aplicada às falas transcritas; um sinal de atenção ou risco encerra a sessão de voz e abre a orientação de segurança.
- Texto explica que nenhum contato, polícia ou instituição é acionado automaticamente.
- Nenhuma notificação ostensiva foi adicionada.

### Privacidade e LGPD

- Tela de dados agora separa finalidade de conta/memória, corpo/contexto e segurança.
- Localização continua opt-in e aproximada.
- Exportação e exclusão continuam disponíveis.
- Não foram ativados contato de confiança ou integração institucional.

## Testes executados

- Sintaxe de todos os módulos JavaScript.
- Classificador de risco para baixo, atenção e elevado.
- Onboarding no navegador: Regular abre o calendário; menopausa segue sem pedir data.
- Classificador automatizado: quatro cenários (baixo, atenção e dois de risco elevado), todos aprovados.
- Interface de segurança confirmada com três canais (190, 180 e 188).
- Revisão de textos para “a Casa Mora” e ausência de DIU.
- Verificação do navegador concluída sem erros de console nos dois ramos testados.

## Pendências / decisão necessária

1. **Contato de confiança:** definir consentimento explícito, identidade, canal, confirmação, falsos positivos, abuso e revogação.
2. **Rede institucional:** mapear parceiros e responsabilidades; nenhuma parceria é apresentada como existente.
3. **Matriz clínica/jurídica de risco:** validar termos, respostas e testes com especialistas antes do lançamento.
4. **LGPD:** revisão jurídica de base legal, retenção, incidentes, operadores e transferência internacional.
5. **Voz ao vivo:** o agente da ElevenLabs precisa ser auditado/publicado com o mesmo prompt de autonomia; a interface já usa Júlia, mas o prompt remoto depende da configuração do provedor.
6. **Perimenopausa:** decidir se deve haver uma segunda pergunta opcional sobre menstruação atual; o baseline não fecha essa regra e, por isso, nenhum calendário é imposto.
7. **Dados de ciclo na nuvem:** definir arquitetura e consentimento antes de sincronizar no Supabase.

## Critérios de aceite

- A marca é tratada no feminino.
- Júlia não ordena nem decide pela mulher.
- Seis opções exatas, sem DIU.
- Calendário condicional funciona.
- Saúde corporal usa linguagem adulta, opcional e não diagnóstica.
- Segurança é uma camada própria.
- Contato de confiança e parcerias continuam como pendências.
- Finalidades dos dados estão visíveis e dados são minimizados.
- Não há promessa clínica nem de proteção automática.
