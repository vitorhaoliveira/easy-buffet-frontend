# Margem automática por evento – Implementação no backend

Este documento descreve o que o backend precisa implementar ou expor para que a funcionalidade **margem automática por evento** (aba "Resultado" no hub do evento) funcione de forma otimizada. O frontend já está preparado e hoje usa um fallback (busca todos os custos e filtra por `eventId` no cliente); com as alterações abaixo, a experiência fica mais eficiente e escalável.

---

## Visão geral

A margem por evento é calculada assim:

- **Receita** = valor total do contrato vinculado ao evento (`Contract.totalAmount`).
- **Custos totais** = soma dos custos cujo `eventId` é o evento em questão.
- **Equipe** = soma dos custos do evento com `category === 'staff'`.
- **Insumos** = soma dos custos do evento com `category` em `'food'`, `'decoration'`, `'other'`.
- **Lucro** = Receita - Custos totais.
- **Margem %** = (Lucro / Receita) × 100 (receita zero tratada no frontend).

O frontend já obtém evento, contrato e custos e faz esse cálculo. O backend precisa principalmente permitir **filtrar custos por evento**.

---

## 1. Listagem de custos com filtro por evento (obrigatório)

### Endpoint existente: `GET /costs`

Incluir suporte ao query parameter **`eventId`** (opcional).

**Exemplo:**

```
GET /costs?eventId=uuid-do-evento
GET /costs?page=1&limit=10&eventId=uuid-do-evento
GET /costs?category=staff&eventId=uuid-do-evento
```

**Comportamento:**

- Se `eventId` for enviado, retornar apenas custos cujo campo `eventId` seja igual ao informado (e que pertençam à organização do usuário autenticado).
- Paginação e filtro por `category` continuam funcionando; `eventId` atua como filtro adicional.
- Resposta: mesmo formato atual (ex.: `{ success, data: Cost[], pagination }` para listagem paginada, ou `{ success, data: Cost[] }` para lista simples).

**Modelo de custo esperado pelo frontend (Cost):**

| Campo        | Tipo                          | Observação                          |
|-------------|-------------------------------|-------------------------------------|
| `id`        | string (UUID)                 |                                      |
| `description` | string                      |                                      |
| `amount`    | number ou string              | Será convertido para número no front |
| `category`  | `'staff' \| 'food' \| 'decoration' \| 'other'` | |
| `eventId`   | string \| null/undefined      | Opcional; usado para vincular ao evento |
| `notes`     | string \| null               | Opcional                             |
| `organizationId` | string                   |                                      |
| `createdAt` | string (ISO 8601)             |                                      |
| `updatedAt` | string \| null                | Opcional                             |
| `createdBy` | string                        |                                      |

---

## 2. Dados de evento e contrato já utilizados

O frontend já consome estes endpoints para montar a margem:

- **GET /events/:id** – evento com `contractId` (quando o backend expuser esse campo).
- **GET /contracts?eventId=xxx&limit=1** ou **GET /contracts/:id** – para obter o `totalAmount` (receita).

Garantir que:

- O recurso **Event** possa expor `contractId` quando houver contrato vinculado (para evitar uma segunda chamada de listagem de contratos quando possível).
- **GET /contracts** aceite `eventId` e retorne apenas contratos daquele evento (o front já usa `eventId` na listagem).

Nenhuma alteração de contrato é obrigatória além do que já existir; apenas assegurar que `eventId` e `totalAmount` estejam disponíveis conforme o frontend espera.

---

## 3. Endpoint opcional: resumo de margem por evento

Se o backend quiser centralizar o cálculo da margem, pode expor um endpoint que devolve o resumo já agregado. O frontend **não depende** dele hoje (faz o cálculo no cliente); é uma otimização opcional.

### Sugestão: `GET /events/:eventId/margin-summary`

**Resposta sugerida (200):**

```json
{
  "success": true,
  "data": {
    "revenue": 15000.00,
    "totalCosts": 4200.00,
    "costsByCategory": {
      "staff": 2000.00,
      "food": 1500.00,
      "decoration": 500.00,
      "other": 200.00
    },
    "teamCost": 2000.00,
    "suppliesCost": 2200.00,
    "profit": 10800.00,
    "marginPercent": 72.0
  }
}
```

**Regras de negócio sugeridas:**

- **revenue**: `totalAmount` do contrato vinculado ao evento; 0 se não houver contrato.
- **totalCosts**: soma de todos os custos com `eventId = eventId` (considerar apenas custos da organização).
- **costsByCategory**: somas por `category` (`staff`, `food`, `decoration`, `other`).
- **teamCost**: igual a `costsByCategory.staff`.
- **suppliesCost**: `costsByCategory.food + costsByCategory.decoration + costsByCategory.other`.
- **profit**: `revenue - totalCosts`.
- **marginPercent**: `revenue > 0 ? (profit / revenue) * 100 : 0`.

Em caso de evento inexistente ou sem permissão, retornar 404 ou 403 conforme padrão da API.

Se este endpoint for implementado, o frontend pode ser ajustado depois para chamá-lo em vez de montar o resumo a partir de evento + contrato + custos (reduzindo chamadas e lógica no cliente).

---

## 4. Resumo das alterações

| Item | Obrigatório | Descrição |
|------|-------------|-----------|
| **GET /costs?eventId=** | Sim | Filtrar custos por `eventId`. Permite que o frontend (ou um futuro endpoint de margin-summary) busque só os custos do evento. |
| **Event.contractId** | Recomendado | Expor no GET /events/:id quando houver contrato vinculado, para evitar listar contratos só para pegar o primeiro. |
| **GET /contracts?eventId=** | Já esperado | Listagem de contratos por evento; o front já usa. |
| **GET /events/:eventId/margin-summary** | Não | Opcional; centraliza o cálculo da margem no backend. |

---

## 5. Segurança e escopo

- Todas as respostas devem respeitar o **escopo da organização** do usuário autenticado (custos, eventos e contratos apenas da organização permitida).
- O parâmetro `eventId` em **GET /costs** deve ser validado: só retornar custos cujo `eventId` pertença a um evento que o usuário tem permissão de acessar (ou que o custo seja da mesma organização do usuário e o evento também).

Com o filtro **eventId** em **GET /costs** implementado, a funcionalidade de margem automática por evento fica suportada de forma eficiente no backend; o restante é opcional para futuras otimizações.
