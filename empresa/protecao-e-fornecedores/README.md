# Estrutura de proteção e fornecedores — Casa Mora

**Responsáveis internas:** Mariana e Isadora  
**Status:** planejamento pré-lançamento  
**Última atualização:** 30 de agosto de 2026

## Decisão de estrutura

A Casa Mora não precisa criar três novas pessoas jurídicas. A estrutura proposta é contratar três frentes independentes, mantendo a decisão de produto com as sócias:

| Frente | Papel | Entrega principal | Independência necessária |
|---|---|---|---|
| Privacidade e LGPD | Dizer se o tratamento está adequado | Mapa de dados, documentos, RIPD, retenção e incidentes | Não deve apenas vender documentos prontos |
| Cibersegurança | Tentar encontrar e comprovar falhas | Pentest, relatório priorizado e reteste | Deve ser diferente de quem desenvolve |
| Tecnologia e infraestrutura | Implementar e operar os controles | Código, banco, acessos, backup, logs e recuperação | Trabalha com os achados das outras duas frentes |

As sócias exercem a quarta função: **governança de produto e proteção da mulher**. Decidem quais dados são realmente necessários, aprovam mudanças e interrompem lançamentos inseguros.

## Ordem recomendada

1. Concluir o mapa técnico e o inventário de dados.
2. Contratar diagnóstico de privacidade/LGPD com escopo fechado.
3. Corrigir arquitetura, permissões, retenção e documentos.
4. Contratar pentest independente quando o fluxo de produção estiver estável.
5. Corrigir achados críticos e realizar o reteste.
6. Só então fazer piloto com dados reais sensíveis.
7. Manter DPO/privacidade e monitoramento proporcionais ao uso real.

## Arquivos desta pasta

- [Mapa atual de dados e fornecedores](01-mapa-atual.md)
- [Plano das três contratações](02-plano-de-contratacoes.md)
- [Roteiro para solicitar propostas](03-roteiro-de-cotacao.md)
- [Orçamento e cenários](04-orcamento.md)
- [Matriz de responsabilidades](05-responsabilidades.md)
- [Checklist de liberação](06-checklist-pre-lancamento.md)

## Regra de decisão

Preço sozinho não decide. Cada proposta deve informar escopo, entregáveis, exclusões, responsável técnico, prazo, tratamento dos dados, confidencialidade, suporte à correção e critério de aceite.

> Este material organiza a contratação. Não substitui aconselhamento jurídico, clínico, contábil ou auditoria de segurança.
