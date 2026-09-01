# Casa Mora — Diário de atualizações

**Dia 2 da fase de monetização — 25 de agosto de 2026**  
**Sócias:** Isadora e Mariana

## Objetivo desta atualização

Transformar a Casa Mora de um painel de registros em uma companhia diária de autoconhecimento emocional para mulheres: acolhedora, útil no momento presente e capaz de mostrar evolução sem diagnosticar.

## O que recebemos como direção

As conversas de referência reforçaram quatro decisões: usar a persona “Júlia” como bússola interna, sem impor uma personagem à usuária; criar o **Mapa de Mim** como porta de entrada gratuita; organizar o produto como uma experiência de uma coisa por vez; e fazer relatórios tratarem padrões como hipóteses, nunca rótulos.

A jornada proposta para o mapa é: **emoção ampla → nuance → intensidade → corpo → contexto possível → necessidade → possibilidade de ação**.

## Implementado no aplicativo

### Personalização

- O cadastro inicial agora pergunta como a usuária prefere ser chamada.
- A tela inicial usa o primeiro nome.
- A conversa pode usar o nome ocasionalmente, sem repetição artificial.
- A autenticação por e-mail do Supabase não foi alterada nesta atualização.

### Mapa de Mim

- Oito famílias emocionais com cores próprias.
- Até três emoções no mesmo mapa.
- Tamanho visual proporcional à intensidade.
- Vocabulário de nuances para chegar a um nome mais preciso.
- Identificação de sinais no corpo, causa possível e necessidade atual.
- Síntese final acolhedora, sem diagnóstico.
- Salvamento local, presença na linha do tempo e participação nos gráficos do relatório.

### Conversa que chega a algum lugar

A usuária escolhe entre:

- **Só desabafar:** acolhimento sem conselho e, em regra, sem perguntas.
- **Entender:** até duas rodadas de exploração e então uma síntese.
- **Próximo passo:** síntese direta e uma ação pequena e possível.

A IA recebeu regras explícitas para nunca fazer mais de uma pergunta por resposta, não terminar todas as mensagens com perguntas e interromper a investigação para apresentar: o que percebeu, o que pode estar por trás e um próximo passo possível.

### Depois do check-in

Após registrar como chegou, a usuária não é empurrada para um questionário. Ela pode fechar a tela ou escolher apenas um caminho: colocar para fora, entender o que sente, acalmar-se ou organizar pensamentos.

### Relatório e memória

- Mapas entram na jornada cronológica.
- Relatório contabiliza Mapas de Mim e incorpora suas emoções no gráfico.
- Linguagem de evolução permanece observacional: tendências e hipóteses, não avaliação clínica.
- Exportação de dados agora inclui perfil, conversas, registros, check-ins, metas e mapas.

## Decisões de experiência e marca

A Casa Mora não é apresentada como terapeuta, coach ou professora. O tom combina acolhimento, curiosidade gentil e clareza prática. A metáfora central é “morar em si mesma”; as funções são caminhos de cuidado, não um painel de produtividade.

## Limites e pontos de atenção

1. Os Mapas de Mim estão armazenados localmente nesta versão. Para sincronização entre aparelhos, ainda é necessária uma tabela no Supabase com políticas de acesso por usuária.
2. Conteúdo emocional é dado sensível. Antes de comercializar, política de privacidade, retenção, exclusão e consentimento devem passar por revisão jurídica/LGPD.
3. O produto não pode prometer diagnóstico, tratamento ou resultado clínico.
4. Voz por terceiros tem custo variável e limites de uso; o plano comercial precisa definir franquias e alertas.
5. A publicação em sete dias é uma meta de envio. Apple e Google controlam o prazo de revisão, portanto aprovação nesse intervalo não pode ser garantida.

## Plano de sete dias para envio às lojas

### Dia 2 — hoje

Fechar arquitetura emocional, Mapa de Mim, conversa com síntese, personalização e registro desta atualização.

### Dia 3

Criar sincronização dos mapas no Supabase; revisar segurança das tabelas e políticas RLS; validar exclusão de conta e exportação.

### Dia 4

Empacotar o web app com Capacitor para iOS e Android; configurar identificadores, ícones, splash screens, permissões de microfone e links.

### Dia 5

Testar login, chat, voz, microfone, mapas, relatórios, modo offline, telas pequenas, interrupções e recuperação de erros em aparelhos reais.

### Dia 6

Preparar política de privacidade, termos, página de suporte, declaração de uso de IA, textos das lojas, classificação etária, capturas de tela e vídeo curto.

### Dia 7

Distribuir builds internos pelo TestFlight e Google Play Internal Testing; corrigir bloqueios e realizar teste com Isadora, Mariana e convidadas.

### Dia 8–9

Enviar para revisão quando todos os itens críticos estiverem aprovados. Responder rapidamente a eventuais exigências das lojas.

## Backlog recomendado

- Sincronizar Mapas de Mim no Supabase.
- Gráfico temporal por família emocional e necessidade mais recorrente.
- Revisão semanal que compare padrões sem inferir causalidade.
- Lembretes opt-in e silenciosos.
- Assinaturas com limites transparentes de voz.
- Tela de ajuda e recursos de crise por país.
- Testes de acessibilidade e linguagem com mulheres de perfis diversos.
- Métricas de ativação: primeiro mapa concluído, retorno em sete dias e síntese considerada útil.

## Checklist de manutenção

A cada versão registrar: data, responsável, motivação, telas alteradas, dados novos, migrações, APIs/custos, riscos, testes executados, URL publicada e itens pendentes. Mudanças de IA devem guardar também modelo, versão do prompt, limites e resultado de testes de segurança.

## Critério de sucesso desta fase

A primeira experiência deve fazer a usuária sentir: **“Eu consigo me entender melhor aqui — e não preciso resolver tudo agora.”**
