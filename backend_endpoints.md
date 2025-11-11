# 📊 Endpoints Financeiros - Backend API

## 🔐 Headers Obrigatórios

Todas as requisições precisam incluir:
```
Authorization: Bearer {access_token}
x-organization-id: {organization_id}
Content-Type: application/json
```

---

## 💳 1. PARCELAS - `/api/installments`

### 1.1 Listar Parcelas
```
GET /api/installments
```

**Permissão:** `financeiro.view`

**Query Parameters:**
| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `page` | number | Número da página | 1 |
| `limit` | number | Itens por página | 20 |
| `status` | string | `pending`, `paid`, `overdue` | - |
| `month` | number | Mês (1-12) | - |
| `year` | number | Ano | - |
| `contractId` | string | UUID do contrato | - |
| `clientId` | string | UUID do cliente | - |

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "contractId": "uuid",
      "organizationId": "uuid",
      "installmentNumber": 1,
      "amount": "1000.00",
      "dueDate": "2024-02-01",
      "status": "paid",
      "paymentDate": "2024-01-31",
      "paymentAmount": "1000.00",
      "notes": "Pago via PIX",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-31T14:00:00.000Z",
      "contract": {
        "deletedAt": null,
        "event": {
          "name": "Casamento João e Maria",
          "eventDate": "2024-06-15"
        },
        "client": {
          "name": "João Silva"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

### 1.2 Buscar Parcela por ID
```
GET /api/installments/:id
```

**Permissão:** `financeiro.view`

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "contractId": "uuid",
    "organizationId": "uuid",
    "installmentNumber": 1,
    "amount": "1000.00",
    "dueDate": "2024-02-01",
    "status": "paid",
    "paymentDate": "2024-01-31",
    "paymentAmount": "1000.00",
    "notes": "Pago via PIX",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-31T14:00:00.000Z",
    "contract": {
      "event": {
        "name": "Casamento João e Maria",
        "eventDate": "2024-06-15"
      },
      "client": {
        "name": "João Silva"
      }
    }
  }
}
```

---

### 1.3 Parcelas Vencidas
```
GET /api/installments/overdue
```

**Permissão:** `financeiro.view`

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "client": {
        "name": "João Silva"
      },
      "event": {
        "name": "Casamento"
      },
      "amount": "1000.00",
      "dueDate": "2024-01-10",
      "daysOverdue": 15,
      "status": "overdue"
    }
  ]
}
```

---

### 1.4 Próximas Parcelas a Vencer
```
GET /api/installments/upcoming?days=30
```

**Permissão:** `financeiro.view`

**Query Parameters:**
| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `days` | number | Dias para frente | 30 |

**Resposta:**
```json
{
  "success": true,
  "data": {
    "next7Days": [
      {
        "id": "uuid",
        "client": {
          "name": "Maria Santos"
        },
        "amount": "500.00",
        "dueDate": "2024-01-20",
        "daysUntilDue": 5
      }
    ],
    "next30Days": [
      {
        "id": "uuid",
        "client": {
          "name": "Pedro Oliveira"
        },
        "amount": "750.00",
        "dueDate": "2024-02-10",
        "daysUntilDue": 25
      }
    ]
  }
}
```

---

## 📄 2. CONTRATOS - `/api/contracts`

### 2.1 Listar Contratos
```
GET /api/contracts
```

**Permissão:** `financeiro.view`

**Query Parameters:**
| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `page` | number | Número da página | 1 |
| `limit` | number | Itens por página | 20 |
| `clientId` | string | UUID do cliente | - |
| `eventId` | string | UUID do evento | - |
| `dateFrom` | string | Data inicial (YYYY-MM-DD) | - |
| `dateTo` | string | Data final (YYYY-MM-DD) | - |

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "eventId": "uuid",
      "clientId": "uuid",
      "totalAmount": "10000.00",
      "installmentCount": 10,
      "installmentAmount": "1000.00",
      "firstDueDate": "2024-02-01",
      "periodicity": "Mensal",
      "commissionPercentage": "15.00",
      "commissionAmount": "1500.00",
      "notes": "Observações",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "deletedAt": null,
      "createdBy": "uuid",
      "event": {
        "id": "uuid",
        "name": "Casamento João e Maria",
        "eventDate": "2024-06-15"
      },
      "client": {
        "id": "uuid",
        "name": "João Silva"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

### 2.2 Buscar Contrato por ID (com parcelas)
```
GET /api/contracts/:id
```

**Permissão:** `financeiro.view`

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "eventId": "uuid",
    "clientId": "uuid",
    "totalAmount": "10000.00",
    "installmentCount": 10,
    "installmentAmount": "1000.00",
    "firstDueDate": "2024-02-01",
    "periodicity": "Mensal",
    "commissionPercentage": "15.00",
    "commissionAmount": "1500.00",
    "notes": "Observações",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "deletedAt": null,
    "createdBy": "uuid",
    "event": {
      "id": "uuid",
      "name": "Casamento João e Maria",
      "eventDate": "2024-06-15"
    },
    "client": {
      "id": "uuid",
      "name": "João Silva"
    },
    "installments": [
      {
        "id": "uuid",
        "contractId": "uuid",
        "organizationId": "uuid",
        "installmentNumber": 1,
        "amount": "1000.00",
        "dueDate": "2024-02-01",
        "status": "paid",
        "paymentDate": "2024-01-31",
        "paymentAmount": "1000.00",
        "notes": null,
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-31T14:00:00.000Z"
      },
      {
        "id": "uuid",
        "contractId": "uuid",
        "organizationId": "uuid",
        "installmentNumber": 2,
        "amount": "1000.00",
        "dueDate": "2024-03-01",
        "status": "pending",
        "paymentDate": null,
        "paymentAmount": null,
        "notes": null,
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2.3 Buscar Parcelas de um Contrato
```
GET /api/contracts/:id/installments
```

**Permissão:** `financeiro.view`

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "contractId": "uuid",
      "organizationId": "uuid",
      "installmentNumber": 1,
      "amount": "1000.00",
      "dueDate": "2024-02-01",
      "status": "paid",
      "paymentDate": "2024-01-31",
      "paymentAmount": "1000.00",
      "notes": null,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-31T14:00:00.000Z"
    }
  ]
}
```

---

## 💸 3. CUSTOS/DESPESAS - `/api/costs`

### 3.1 Listar Custos
```
GET /api/costs
```

**Permissão:** `financeiro.view`

**Query Parameters:**
| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `page` | number | Número da página | 1 |
| `limit` | number | Itens por página | 20 |
| `eventId` | string | UUID do evento | - |
| `category` | string | Categoria do custo | - |
| `dateFrom` | string | Data inicial (YYYY-MM-DD) | - |
| `dateTo` | string | Data final (YYYY-MM-DD) | - |

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "eventId": "uuid",
      "description": "Pagamento garçons",
      "amount": "800.00",
      "category": "staff",
      "notes": "3 garçons x 8 horas",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "deletedAt": null,
      "createdBy": "uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 78
  }
}
```

---

### 3.2 Buscar Custo por ID
```
GET /api/costs/:id
```

**Permissão:** `financeiro.view`

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "eventId": "uuid",
    "description": "Pagamento garçons",
    "amount": "800.00",
    "category": "staff",
    "notes": "3 garçons x 8 horas",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "deletedAt": null,
    "createdBy": "uuid"
  }
}
```

---

## 📊 4. DASHBOARD - `/api/dashboard`

### 4.1 Estatísticas Gerais
```
GET /api/dashboard/stats?month=1&year=2024
```

**Permissão:** `dashboard.view`

**Query Parameters:**
| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `month` | number | Mês (1-12) | Mês atual |
| `year` | number | Ano | Ano atual |

**Resposta:**
```json
{
  "success": true,
  "data": {
    "upcomingInstallments7Days": 5,
    "upcomingInstallments30Days": 15,
    "overdueInstallments": 3,
    "monthlyRevenue": 25000.00,
    "upcomingEvents": 8
  }
}
```

**Campos:**
- `upcomingInstallments7Days`: Número de parcelas a vencer nos próximos 7 dias
- `upcomingInstallments30Days`: Número de parcelas a vencer nos próximos 30 dias
- `overdueInstallments`: Número de parcelas vencidas
- `monthlyRevenue`: Receita do mês (parcelas pagas)
- `upcomingEvents`: Número de eventos próximos

---

### 4.2 Próximas Parcelas (Dashboard)
```
GET /api/dashboard/upcoming-installments?limit=10
```

**Permissão:** `dashboard.view`

**Query Parameters:**
| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `limit` | number | Limite de resultados | 10 |

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "contractId": "uuid",
      "clientName": "João Silva",
      "eventName": "Casamento",
      "amount": "1000.00",
      "dueDate": "2024-01-20",
      "status": "pending",
      "daysUntilDue": 5
    }
  ]
}
```

---

### 4.3 Próximos Eventos (Dashboard)
```
GET /api/dashboard/upcoming-events?limit=10
```

**Permissão:** `dashboard.view`

**Query Parameters:**
| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `limit` | number | Limite de resultados | 10 |

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clientName": "Maria Santos",
      "eventName": "Aniversário 15 anos",
      "eventDate": "2024-02-15",
      "status": "Confirmado",
      "daysUntilEvent": 30
    }
  ]
}
```

---

### 4.4 Evolução Mensal
```
GET /api/dashboard/monthly-evolution?months=12
```

**Permissão:** `dashboard.view`

**Query Parameters:**
| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `months` | number | Número de meses | 12 |

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "month": "Janeiro",
      "year": 2024,
      "revenue": 35000.00,
      "expenses": 15000.00,
      "profit": 20000.00
    },
    {
      "month": "Fevereiro",
      "year": 2024,
      "revenue": 42000.00,
      "expenses": 18000.00,
      "profit": 24000.00
    }
  ]
}
```

**Campos:**
- `revenue`: Receita (parcelas pagas)
- `expenses`: Despesas (custos)
- `profit`: Lucro (receita - despesas)

---

## 📈 5. RELATÓRIOS - `/api/reports`

### 5.1 Relatório Mensal Completo
```
GET /api/reports/monthly?month=1&year=2024
```

**Permissão:** `relatorios.view`

**Query Parameters (obrigatórios):**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `month` | number | Mês (1-12) |
| `year` | number | Ano |

**Resposta:**
```json
{
  "success": true,
  "data": {
    "period": {
      "month": 1,
      "year": 2024,
      "monthName": "Janeiro"
    },
    "summary": {
      "revenue": 35000.00,
      "expenses": 15000.00,
      "commissions": 5250.00,
      "netProfit": 14750.00,
      "paidInstallments": 35,
      "totalInstallments": 50,
      "commissionRate": 15.00
    },
    "kpis": {
      "realizedRevenue": 35000.00,
      "pendingRevenue": 12000.00,
      "overdueRevenue": 3000.00,
      "expectedRevenue": 50000.00,
      "realizationRate": 70.00,
      "overdueRate": 6.00,
      "paidCount": 35,
      "pendingCount": 12,
      "overdueCount": 3,
      "totalCount": 50
    }
  }
}
```

**Campos do summary:**
- `revenue`: Receita realizada (parcelas pagas)
- `expenses`: Total de despesas
- `commissions`: Total de comissões
- `netProfit`: Lucro líquido (receita - despesas - comissões)
- `paidInstallments`: Número de parcelas pagas
- `totalInstallments`: Número total de parcelas do mês
- `commissionRate`: Taxa média de comissão

**Campos dos KPIs:**
- `realizedRevenue`: Receita realizada
- `pendingRevenue`: Receita pendente
- `overdueRevenue`: Receita vencida
- `expectedRevenue`: Receita esperada total
- `realizationRate`: Taxa de realização (%)
- `overdueRate`: Taxa de inadimplência (%)
- `paidCount`: Parcelas pagas
- `pendingCount`: Parcelas pendentes
- `overdueCount`: Parcelas vencidas
- `totalCount`: Total de parcelas

---

### 5.2 Relatório de Parcelas
```
GET /api/reports/installments?month=1&year=2024&status=paid
```

**Permissão:** `relatorios.view`

**Query Parameters:**
| Parâmetro | Tipo | Descrição | Valores |
|-----------|------|-----------|---------|
| `month` | number | Mês (1-12) | - |
| `year` | number | Ano | - |
| `status` | string | Status das parcelas | `paid`, `pending`, `overdue`, `unpaid`, `all` |

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "contractId": "uuid",
      "clientName": "João Silva",
      "eventName": "Casamento",
      "amount": "1000.00",
      "dueDate": "2024-01-15",
      "status": "paid",
      "paymentDate": "2024-01-14",
      "commissionAmount": 150.00,
      "commissionRate": 15.00
    }
  ]
}
```

**Campos:**
- `commissionAmount`: Valor da comissão desta parcela
- `commissionRate`: Taxa de comissão aplicada

---

### 5.3 Relatório de Custos
```
GET /api/reports/costs?month=1&year=2024&category=staff
```

**Permissão:** `relatorios.view`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `month` | number | Mês (1-12) |
| `year` | number | Ano |
| `category` | string | Categoria do custo |

**Resposta:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "eventName": "Casamento João e Maria",
        "description": "Pagamento garçons",
        "amount": "800.00",
        "category": "staff",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "summary": {
      "totalCosts": 15000.00,
      "byCategory": {
        "staff": 5000.00,
        "food": 7000.00,
        "decoration": 2000.00,
        "other": 1000.00
      }
    }
  }
}
```

**Campos do summary:**
- `totalCosts`: Total geral de custos
- `byCategory`: Total por categoria

---

## 🎯 Status das Parcelas

| Status | Descrição |
|--------|-----------|
| `pending` | Parcela pendente (não vencida) |
| `paid` | Parcela paga |
| `overdue` | Parcela vencida (não paga) |

---

## 📋 Categorias de Custos

As categorias disponíveis para custos são:
- `staff` - Pessoal
- `food` - Alimentação
- `decoration` - Decoração
- `other` - Outros

---

## 🔢 Tipos de Dados

### Decimal
Valores monetários são retornados como string no formato:
```
"1000.00"
```

### Date
Datas são retornadas no formato ISO 8601:
```
"2024-01-15"
```

### DateTime
Datas e horas são retornadas no formato ISO 8601:
```
"2024-01-15T10:30:00.000Z"
```

### UUID
Identificadores únicos no formato:
```
"550e8400-e29b-41d4-a716-446655440000"
```

---

## ⚠️ Códigos de Erro

| Código HTTP | Erro | Descrição |
|-------------|------|-----------|
| 400 | `VALIDATION_ERROR` | Erro de validação nos dados |
| 401 | `UNAUTHORIZED` | Token inválido ou ausente |
| 403 | `FORBIDDEN` | Sem permissão para acessar |
| 404 | `NOT_FOUND` | Recurso não encontrado |
| 422 | `CANNOT_DELETE_WITH_DEPENDENCIES` | Não pode deletar (tem dependências) |
| 500 | `INTERNAL_SERVER_ERROR` | Erro interno do servidor |

**Formato de Erro:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erro de validação",
    "details": [
      {
        "field": "body.amount",
        "message": "Valor deve ser positivo"
      }
    ]
  }
}
```

---

## 📌 Notas Importantes

1. **Paginação**: Endpoints com paginação retornam o objeto `pagination` com `page`, `limit` e `total`
2. **Filtros**: Query parameters são opcionais, quando não informados retornam todos os dados
3. **Soft Delete**: Contratos e custos deletados têm `deletedAt` preenchido, mas continuam no banco
4. **Datas**: Aceitar e retornar datas no formato ISO 8601
5. **Valores**: Valores monetários sempre em formato decimal string ("1000.00")
6. **Permissões**: Cada endpoint requer permissões específicas do módulo financeiro

