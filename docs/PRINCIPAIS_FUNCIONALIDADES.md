# Principais funcionalidades – EasyBuffet Angular

Documento que consolida as principais funcionalidades do sistema EasyBuffet (frontend Angular), organizadas por área.

---

## 1. Autenticação e acesso

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| **Login** | `/entrar` | Autenticação (e-mail/senha). |
| **Cadastro** | `/cadastrar` | Registro de novo usuário. |
| **Esqueci a senha** | `/esqueci-senha` | Solicitação de redefinição de senha. |
| **Redefinir senha** | `/reset-password/:token`, `/redefinir-senha` | Redefinição de senha com token. |
| **Troca de organização** | (sidebar) | Seletor de organização no layout; suporte a múltiplas organizações. |
| **Nova organização** | (modal) | Criação de organização (admin; regras de trial aplicadas). |
| **Proteção por assinatura** | (guard) | `subscriptionGuard`: bloqueia acesso quando trial/assinatura expirados. |
| **Trial 7 dias** | (banner + lógica) | Banner “Acesso trial até DD/MM/AAAA” e liberação de uso sem cartão durante o trial. |

---

## 2. Pagamentos e assinatura (Stripe)

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| **Sucesso no pagamento** | `/payment-success` | Página após pagamento concluído. |
| **Pagamento cancelado** | `/payment-cancel` | Página quando o usuário cancela no checkout. |
| **Pagamento falhou** | `/payment-failed` | Página quando o pagamento falha. |
| **Assinatura obrigatória** | `/payment-required` | Tela para cadastrar cartão quando trial expirou ou API retorna 402. |
| **Assinatura / Billing** | `/assinatura` | Gestão da assinatura (acesso pelo menu do perfil). |

---

## 3. Início (Dashboard)

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| **Dashboard** | `/` | Visão geral: resumos, atalhos e link para relatórios (`/financeiro?tab=relatorio`). |

---

## 4. Eventos

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| **Listagem de eventos** | `/cadastros/eventos` | Lista de eventos. |
| **Novo evento** | `/cadastros/eventos/novo` | Criação de evento. |
| **Visualizar evento** | `/cadastros/eventos/visualizar/:eventId` | Hub do evento com abas. |
| **Dados do evento** | `.../visualizar/:eventId/dados` | Edição dos dados do evento. |
| **Pagamentos do evento** | `.../visualizar/:eventId/pagamentos` | Aba de pagamentos do evento (pagamentos são por evento; não há módulo separado de contratos). |
| **Equipe do evento** | `.../visualizar/:eventId/equipe` | Listagem de escalas da equipe no evento. |
| **Adicionar escala** | `.../equipe/adicionar` | Formulário para adicionar escala. |
| **Editar escala** | `.../equipe/editar/:scheduleId` | Edição de escala. |
| **Visão do dia** | `.../equipe/dia` | Visualização da equipe por dia. |
| **Resultado do evento** | `.../visualizar/:eventId/resultado` | Aba de resultado do evento. |
| **Checklist do evento** | `.../visualizar/:eventId/checklist` | Checklist vinculado ao evento. |
| **Redirecionamento** | `/cadastros/eventos/editar/:id` | Redireciona para `visualizar/:id/dados`. |

---

## 5. Cadastros gerais

### 5.1 Clientes

| Funcionalidade | Rota |
|----------------|------|
| Listar | `/cadastros/clientes` |
| Novo | `/cadastros/clientes/novo` |
| Editar | `/cadastros/clientes/editar/:id` |

### 5.2 Pacotes / Serviços

| Funcionalidade | Rota |
|----------------|------|
| Listar | `/cadastros/pacotes` |
| Novo | `/cadastros/pacotes/novo` |
| Editar | `/cadastros/pacotes/editar/:id` |

### 5.3 Orçamentos

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| Listar | `/cadastros/orcamentos` | Lista de orçamentos. |
| Novo | `/cadastros/orcamentos/novo` | Criação de orçamento. |
| Visualizar | `/cadastros/orcamentos/visualizar/:id` | Visualização do orçamento. |
| Editar | `/cadastros/orcamentos/editar/:id` | Edição do orçamento. |
| **Proposta pública** | `/proposal/:token` | Página pública da proposta (sem login). |

### 5.4 Unidades

| Funcionalidade | Rota |
|----------------|------|
| Listar | `/cadastros/unidades` |
| Nova | `/cadastros/unidades/novo` |
| Editar | `/cadastros/unidades/editar/:id` |

### 5.5 Usuários

| Funcionalidade | Rota |
|----------------|------|
| Listar | `/cadastros/usuarios` |
| Novo | `/cadastros/usuarios/novo` |
| Editar | `/cadastros/usuarios/editar/:id` |

Permissões por módulo (dashboard, cadastros, financeiro, relatórios) com ações view/create/edit/export.

### 5.6 Vendedoras

| Funcionalidade | Rota |
|----------------|------|
| Listar | `/cadastros/vendedoras` |
| Nova | `/cadastros/vendedoras/novo` |
| Editar | `/cadastros/vendedoras/editar/:id` |

### 5.7 Equipe (membros)

| Funcionalidade | Rota |
|----------------|------|
| Listar | `/cadastros/equipe` |
| Novo | `/cadastros/equipe/novo` |
| Editar | `/cadastros/equipe/editar/:id` |

Cadastro global de membros da equipe (reutilizados nos eventos).

---

## 6. Checklists

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| **Modelos de checklist** | `/cadastros/checklists/templates` | Lista de templates. |
| Novo modelo | `/cadastros/checklists/templates/novo` | Criação de template. |
| Editar modelo | `/cadastros/checklists/templates/editar/:id` | Edição de template. |
| **Checklist do evento** | `/cadastros/eventos/visualizar/:eventId/checklist` | Checklist preenchido por evento (ou via redirect `eventos/:eventId/checklist`). |

---

## 7. Escalas (team schedules) – páginas públicas

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| **Confirmação pública** | `/team-schedules/public/:token` | Página pública para confirmação de escala (sem login). |

---

## 8. Financeiro

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| **Carteira / Financeiro** | `/financeiro` | Página principal com abas (ex.: resumo, relatório). |
| **Relatório do mês** | `/financeiro?tab=relatorio` | Relatório mensal (também acessível via `/relatorios/mensal`). |
| **Parcelas (pagamentos)** | `/financeiro/parcelas` | Listagem de parcelas. |
| Nova parcela | `/financeiro/parcelas/nova` | Cadastro de parcela. |
| **Custos e despesas** | `/financeiro/custos` | Listagem de custos. |
| Novo custo | `/financeiro/custos/novo` | Cadastro de custo. |
| Editar custo | `/financeiro/custos/editar/:id` | Edição de custo. |

---

## 9. Conta e configurações

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| **Minha conta** | `/conta` | Dados da conta e alteração de senha (account-settings, change-password). |
| **Assinatura** | `/assinatura` | Gestão da assinatura (billing). |
| **Configurações** | `/configuracoes/contrato` | Configurações gerais (ex.: dados padrão de documentos). |
| **Permissões** | (comentado nas rotas) | `configuracoes/permissoes` – preparado para uso futuro. |

---

## 10. Segurança e permissões

- **authGuard**: exige usuário autenticado.
- **subscriptionGuard**: exige trial ativo ou assinatura ativa.
- **permissionGuard**: exige permissão por módulo/ação (`data: { module, action }`).
- **Interceptors**: auth (token), refresh de token, tratamento de 402 (assinatura).
- **Módulos de permissão**: `dashboard`, `cadastros`, `financeiro`, `relatorios` (view, create, edit, export conforme módulo).

---

## 11. Resumo por menu (sidebar)

- **Início**: Dashboard (`/`).
- **EVENTOS**: Eventos (`/cadastros/eventos`), Modelos (`/cadastros/checklists/templates`).
- **CADASTROS**: Clientes, Pacotes/Serviços, Orçamentos, Unidades, Usuários, Vendedor(a)s, Equipe.
- **FINANCEIRO**: Carteira (`/financeiro`), Pagamentos (`/financeiro/parcelas`), Custos e Despesas (`/financeiro/custos`).
- **Perfil (dropdown)**: Minha conta (`/conta`), Assinatura (`/assinatura`), Sair.

---

*Documento gerado com base em `app.routes.ts`, `main-layout` e estrutura de features. Atualizado em março de 2025.*
