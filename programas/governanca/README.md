# Portal interno de governança

Painel local para Mariana e Isadora acompanharem quatro programas necessários à Casa Mora:

1. Radar LGPD e inventário de dados.
2. Auditoria de fornecedores.
3. Resposta a incidentes.
4. Gate de liberação do aplicativo.

## Abrir

Sirva esta pasta em um servidor local e abra `index.html`. Os estados dos checklists ficam apenas no `localStorage` do navegador.

## Segurança

Este painel é deliberadamente separado do aplicativo público. Não registre senhas, chaves, dados reais de usuárias, vulnerabilidades exploráveis ou detalhes de incidentes pessoais. Antes de torná-lo multiusuário ou online, implementar autenticação administrativa, controle de acesso, logs, criptografia, retenção e revisão jurídica.
