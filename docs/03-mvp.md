# Especificação do MVP

## Plataforma

Construir primeiro como aplicação web responsiva, com experiência pensada para celular. Torná-la instalável na tela inicial como PWA quando isso não atrasar a validação. O mesmo backend e as mesmas regras de segurança devem poder atender um aplicativo nativo no futuro.

Não publicar na App Store durante a descoberta. Considerar um app iOS após validar quatro semanas de uso, utilidade do relatório e disposição a pagar. Antes da publicação, preparar conta empresarial, política de privacidade, exclusão de conta, classificação etária, revisão das alegações de saúde e materiais da loja.

## Objetivo

Validar se histórico estruturado + conexão entre episódios + experimento semanal oferece valor superior a uma conversa isolada.

## Fluxo principal

1. Consentimento claro e explicação de limites.
2. Usuário descreve uma situação atual.
3. Sistema ajuda a separar fato observável, pensamento, emoção, intensidade, ação e consequência.
4. Usuário revisa e confirma o registro estruturado.
5. Sistema responde com uma reflexão curta, sem diagnóstico.
6. A partir de histórico suficiente, apresenta semelhança com episódios anteriores.
7. Semanalmente, propõe uma hipótese de padrão, mostra evidências e oferece um experimento.
8. Usuário aceita, corrige ou rejeita a hipótese e avalia o experimento.

## Funcionalidades P0

- Cadastro, consentimento, aviso de limites e exclusão de conta.
- Conversa guiada e registro estruturado.
- Emoção e intensidade em escala simples.
- Revisão/edição antes de salvar memória.
- Lista e detalhe de registros anteriores.
- Relatório semanal com no máximo um padrão central.
- Experimento semanal opcional e acompanhamento.
- Controles de memória: editar, excluir, pausar e exportar.
- Detecção de linguagem de crise e fluxo de segurança.
- Telemetria mínima, separada do conteúdo sensível quando possível.

## As cinco telas do MVP

1. **Entrada e consentimento:** o que a Casa Mora faz, limites, privacidade e criação da conta.
2. **Hoje:** conversa/registro guiado com fato, pensamento, emoção, ação e consequência.
3. **Revisar registro:** usuário corrige o resumo antes de alimentar a memória.
4. **Minha jornada:** episódios anteriores e comparações simples.
5. **Semana:** uma hipótese de padrão, evidências, evolução, experimento e feedback.

## Fora do MVP

- Diagnóstico ou triagem clínica automatizada.
- Integração com wearables, sono, localização ou mensagens.
- Voz, avatar, rede social, marketplace de terapeutas.
- Relatório premium complexo de 60/90 dias.
- Notificações comportamentais personalizadas por IA.

## Formato do relatório semanal

1. **Hipótese:** “Críticas podem estar sendo interpretadas como desaprovação.”
2. **Evidência:** episódios e trechos resumidos que sustentam a hipótese.
3. **Incerteza:** explicar por que pode não se aplicar.
4. **Efeito observado:** emoção e comportamento associados.
5. **Evolução:** mudança concreta, quando houver.
6. **Experimento:** uma ação pequena, opcional e mensurável.
7. **Feedback:** faz sentido / parcialmente / não faz sentido + correção.

## Regras para inferir um padrão

- Nunca inferir de um único episódio.
- Exigir repetição em contextos suficientes e indicar a base usada.
- Preferir linguagem probabilística.
- Não inferir trauma, transtorno, intenção de terceiros ou traço de personalidade.
- Não apresentar correlação como causalidade.
- Expirar ou reduzir confiança de padrões rejeitados.

## Critérios de sucesso do piloto

- 70% conseguem concluir e confirmar um registro sem ajuda.
- 60% dizem que a comparação entre episódios acrescentou algo novo.
- 50% testam ao menos um experimento em quatro semanas.
- Menos de 10% das hipóteses são consideradas invasivas ou claramente erradas.
- Zero falha crítica conhecida no fluxo de exclusão ou segurança.

