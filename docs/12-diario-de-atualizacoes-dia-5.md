# Casa Mora — Diário de atualizações

**Dia 5 da fase de monetização — 28 de agosto de 2026**  
**Sócias:** Isadora e Mariana

## Direção desta versão

A Casa Mora passa a conectar emoção, corpo, rotina e ambiente sem transformar bem-estar em desempenho. Não há pontos, sequência, medalha, recompensa, competição ou contagem de passos.

## O que foi retirado

- Bloco de meta diária e sua marcação de conclusão.
- Métrica de “passos concluídos” no relatório.
- Linguagem de cumprir metas, constância obrigatória ou plano perfeito.
- A terceira aba deixou de ser uma tarefa e tornou-se **Meu ritmo**.

As tabelas antigas de metas continuam no banco apenas para preservar integridade e permitir exclusão dos dados legados, mas não são lidas nem exibidas pelo aplicativo.

## Corpo, natureza e contexto

### Ciclo menstrual

O acompanhamento é opcional. A usuária pode informar primeiro dia da última menstruação, duração média, duração do sangramento e se o ciclo é irregular. A interface mostra dia e fase estimada; em ciclos irregulares não tenta inferir fase.

A estimativa não é contraceptiva, não prevê fertilidade e não diagnostica. A contagem começa no primeiro dia do sangramento, conforme orientação clínica geral. Ciclos e sintomas variam entre mulheres e entre meses.

### Lua, estação, mês e clima

- Fase lunar calculada localmente e apresentada como contexto simbólico, sem presumir efeito causal sobre humor.
- Mês e estação atual, ajustados ao hemisfério quando a localização é compartilhada.
- Clima atual consultado pela Open-Meteo, sem chave de API.
- Localização solicitada somente após toque explícito da usuária.
- Coordenadas armazenadas com precisão reduzida; o nome da cidade é fornecido pela própria usuária.

### Observação corporal

A usuária registra energia em palavras, sintomas opcionais e uma nota livre. O registro guarda o contexto daquele momento: fase estimada do ciclo, Lua, estação e clima quando disponível. Isso não gera nota ou pontuação.

### Insights personalizados

A Casa Mora não diz “na fase X você é assim”. Ela aguarda pelo menos seis observações e compara repetições dentro dos dados daquela usuária. O texto sempre apresenta uma pista revisável e recomenda, idealmente, observar ao longo de dois ciclos.

## Torta da Vida

Oito áreas são representadas por círculos: família, exercícios, alimentação, espiritualidade, amigos, trabalho, estudo e aventura. O tamanho mostra presença relativa dos temas em conversas e registros; não é nota, equilíbrio ideal ou julgamento.

Nesta versão a identificação usa vocabulário temático local. Evolução recomendada: classificação por IA no servidor com taxonomia versionada, revisão da usuária e salvamento de evidências explicáveis.

## Dados e privacidade

Ciclo, observações corporais e contexto local ficam no aparelho nesta versão e entram na exportação. Antes da publicação nas lojas, será necessário sincronizá-los de forma protegida no Supabase, atualizar política de privacidade e consentimento, definir retenção e realizar revisão LGPD, pois ciclo menstrual e sintomas são dados sensíveis.

## Fontes de referência

- ACOG: o ciclo é contado do primeiro dia de um sangramento ao primeiro dia do seguinte; acompanhar datas ajuda a perceber padrões.
- NHS: sintomas podem variar e um diário por pelo menos dois ciclos ajuda a observar relações temporais.
- MDN: geolocalização exige HTTPS e permissão explícita.
- Open-Meteo: condições atuais por latitude/longitude, sem chave no acesso não comercial padrão.

## Pendências antes das lojas

1. Criar tabelas e políticas RLS para ciclo e observações no Supabase.
2. Adicionar edição e exclusão individual dos registros corporais.
3. Permitir pausar completamente a coleta de contexto e apagar apenas dados do ciclo.
4. Revisar linguagem com ginecologista e especialista em privacidade.
5. Testar anticoncepcionais hormonais, gestação, pós-parto, menopausa, ciclos irregulares e pessoas que não menstruam.
6. Adicionar alertas de procura de cuidado para dor incapacitante, sangramento intenso ou mudança importante, sem triagem diagnóstica automática.
7. Validar licença comercial e limites da API de clima antes de escalar.

## Princípio de produto

**O ambiente pode ser observado; o ciclo pode ser acompanhado; nenhuma dessas informações determina quem a mulher é ou como ela deveria se sentir.**
