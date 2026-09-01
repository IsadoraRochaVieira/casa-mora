# Dados, privacidade e arquitetura

## Premissa

Relatos emocionais, relações, trabalho e saúde podem revelar dados pessoais sensíveis. Privacidade deve ser parte da proposta de valor, não apenas um documento legal.

## Modelo de dados conceitual

- **Usuário:** conta, consentimentos, preferências e região.
- **Episódio:** data, contexto, fato, pensamento, emoções/intensidade, comportamento, consequência.
- **Hipótese de padrão:** descrição, evidências vinculadas, confiança, status e feedback.
- **Experimento:** objetivo, instrução, período, adesão e avaliação.
- **Relatório:** janela temporal, conteúdo exibido e fontes utilizadas.
- **Evento de segurança:** categoria mínima, ação tomada e auditoria restrita.

## Regras de memória

- Mostrar o que será lembrado antes ou logo após salvar.
- Permitir editar, rejeitar, excluir, pausar e limpar toda a memória.
- Cada inferência deve apontar para episódios que a sustentam.
- Separar relato original, estrutura confirmada e inferência da IA.
- Não reutilizar conteúdo para treinamento sem consentimento específico e destacado.

## Arquitetura inicial

Aplicativo cliente → API autenticada → orquestrador de conversa → modelo de IA.

O orquestrador grava estruturas confirmadas no banco transacional. Um processo separado gera candidatos a padrões usando dados do próprio usuário; regras de segurança filtram os candidatos antes da apresentação. Relatórios guardam referências, versão de prompt/modelo e feedback para auditoria.

## Controles mínimos

- Criptografia em trânsito e repouso; segredos fora do código.
- Autenticação forte e sessões revogáveis.
- Isolamento por usuário e testes contra acesso indevido.
- Acesso interno por menor privilégio, logs e revisão periódica.
- Ambientes de produção e desenvolvimento separados; sem dados reais em testes.
- Backups criptografados com exclusão propagada e restauração testada.
- Política de retenção por tipo de dado.
- Avaliação de fornecedores de IA e contratos de tratamento de dados.

## LGPD — trabalho obrigatório

Mapear controlador/operadores, bases legais, finalidades, direitos do titular, transferências internacionais, relatório de impacto, encarregado/canal e resposta a incidentes. A classificação de dados e o enquadramento do produto devem ser validados por advogado; este arquivo não é aconselhamento jurídico.

## Decisões antes do piloto

- País e idade mínima.
- Provedor de identidade, banco e modelo de IA.
- Retenção de conversas, estruturas, relatórios e logs.
- Se haverá acesso humano a conteúdo e em quais condições.
- Processo verificável de exportação e exclusão.
- Política de uso de dados para melhoria e treinamento.

