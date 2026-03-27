# 📊 CRM - MVP (Plataforma SaaS Buffet)

## 🎯 Objetivo
Permitir que o cliente gerencie seus leads, acompanhe vendas e não perca oportunidades, integrando com o sistema atual (clientes, eventos e agendamentos).

---

## 🧩 Módulos do CRM

### 1. 📇 Leads / Contatos

#### Campos:
- id
- name
- phone
- whatsapp
- email (opcional)
- origin (instagram, indicação, site, etc)
- status (ativo, perdido, convertido)
- created_at

---

### 2. 🧱 Funil de Vendas (Pipeline)

#### Etapas padrão:
- Novo Lead
- Contato feito
- Proposta enviada
- Negociação
- Fechado
- Perdido

#### Estrutura:
- pipeline_stage
  - id
  - name
  - order

- deal
  - id
  - lead_id
  - stage_id
  - value (opcional)
  - event_date (opcional)
  - created_at

---

### 3. 📝 Histórico de Interações

#### Estrutura:
- interaction
  - id
  - lead_id
  - type (ligação, whatsapp, reunião, nota)
  - description
  - created_at
  - created_by

#### Exemplos:
- "Ligou para cliente"
- "Enviou orçamento via WhatsApp"
- "Cliente pediu desconto"

---

### 4. 📅 Follow-up (Lembretes)

#### Estrutura:
- follow_up
  - id
  - lead_id
  - date
  - note
  - status (pendente, concluído)
  - created_at

#### Funcionalidades:
- Criar lembrete
- Notificação visual no sistema
- Lista de follow-ups do dia

---

### 5. 📲 Integração com WhatsApp (MVP)

#### Funcionalidade:
Botão para abrir conversa com mensagem pré-definida

#### Template:

https://wa.me/55{phone}?text={encoded_message}


#### Exemplos de mensagens:
- Olá {{nome}}, tudo bem? Sobre seu orçamento...
- Oi {{nome}}, passando para confirmar seu evento...

#### Ações rápidas:
- Botão: "Enviar proposta"
- Botão: "Fazer follow-up"
- Botão: "Reativar lead"

---

### 6. 🔗 Integração com sistema existente

#### Conversão Lead → Cliente
- Ao marcar como "Fechado":
  - Criar registro em `clientes`
  - Vincular dados automaticamente

#### Integração com Eventos
- Campo `event_date` no deal
- Criar evento automaticamente ao fechar

#### Integração com Agendamentos
- Ao fechar:
  - Criar booking
  - Associar ao cliente

---

## 🖥️ Telas (Frontend)

### 1. Kanban de Vendas
- Arrastar leads entre etapas
- Visual rápido do funil

---

### 2. Detalhe do Lead
- Informações principais
- Histórico de interações
- Follow-ups
- Botão WhatsApp

---

### 3. Lista de Leads
- Filtro por status
- Busca por nome/telefone

---

### 4. Dashboard (opcional MVP+)
- Total de leads
- Taxa de conversão
- Leads por origem

---

## ⚙️ Regras de Negócio

- Lead só pode estar em uma etapa por vez
- Ao mover para "Fechado":
  - Criar cliente automaticamente
- Follow-up vencido deve ser destacado
- Toda interação deve ser registrada manualmente ou automaticamente


