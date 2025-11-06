# 📚 Guia de Implementação - Detalhes do Contrato (Frontend)

## 🎯 Visão Geral

Este documento descreve como implementar a página de detalhes/visualização de um contrato no frontend, incluindo todas as informações do contrato, evento, cliente e parcelas.

---

## 📡 Endpoint Principal

### Base URL
```
http://localhost:3000/api/contracts
```

### Headers Obrigatórios
Todas as requisições precisam incluir:
```javascript
{
  'Authorization': 'Bearer {access_token}',
  'x-organization-id': '{organization_id}',
  'Content-Type': 'application/json'
}
```

---

## 🔍 Buscar Detalhes Completos do Contrato

### Endpoint
```
GET /api/contracts/:id
```

Este é o endpoint principal que retorna **TUDO** que você precisa para a página de detalhes:
- ✅ Dados completos do contrato
- ✅ Informações do evento relacionado
- ✅ Informações do cliente relacionado
- ✅ **Todas as parcelas** com status, datas e valores

### Exemplo de Request (JavaScript/Fetch)
```javascript
const getContractDetails = async (contractId) => {
  const response = await fetch(`http://localhost:3000/api/contracts/${contractId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'x-organization-id': organizationId
    }
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar contrato');
  }
  
  const data = await response.json();
  return data.data; // Contrato completo
};
```

---

## 📊 Estrutura Completa da Resposta

### Resposta (200 OK)
```json
{
  "success": true,
  "data": {
    // === DADOS DO CONTRATO ===
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "eventId": "660e8400-e29b-41d4-a716-446655440001",
    "clientId": "770e8400-e29b-41d4-a716-446655440002",
    
    // Valores
    "totalAmount": "10000.00",
    "installmentCount": 10,
    "installmentAmount": "1000.00",
    
    // Datas e periodicidade
    "firstDueDate": "2024-02-01",
    "periodicity": "Mensal",
    
    // Comissão
    "commissionPercentage": "15.00",
    "commissionAmount": "1500.00",
    
    // Observações
    "notes": "Cliente preferencial - desconto aplicado",
    
    // Auditoria
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deletedAt": null,
    "createdBy": "880e8400-e29b-41d4-a716-446655440003",
    
    // === DADOS DO EVENTO ===
    "event": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Casamento João e Maria",
      "eventDate": "2024-06-15"
    },
    
    // === DADOS DO CLIENTE ===
    "client": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "João Silva"
    },
    
    // === TODAS AS PARCELAS ===
    "installments": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440010",
        "contractId": "550e8400-e29b-41d4-a716-446655440000",
        "organizationId": "00000000-0000-0000-0000-000000000001",
        "installmentNumber": 1,
        "amount": "1000.00",
        "dueDate": "2024-02-01",
        "status": "paid",
        "paymentDate": "2024-01-31",
        "paymentAmount": "1000.00",
        "notes": "Pago via PIX",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-31T14:20:00.000Z"
      },
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440011",
        "contractId": "550e8400-e29b-41d4-a716-446655440000",
        "organizationId": "00000000-0000-0000-0000-000000000001",
        "installmentNumber": 2,
        "amount": "1000.00",
        "dueDate": "2024-03-01",
        "status": "pending",
        "paymentDate": null,
        "paymentAmount": null,
        "notes": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "cc0e8400-e29b-41d4-a716-446655440012",
        "contractId": "550e8400-e29b-41d4-a716-446655440000",
        "organizationId": "00000000-0000-0000-0000-000000000001",
        "installmentNumber": 3,
        "amount": "1000.00",
        "dueDate": "2024-01-15",
        "status": "overdue",
        "paymentDate": null,
        "paymentAmount": null,
        "notes": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
      // ... demais parcelas (4 a 10)
    ]
  }
}
```

---

## 📋 Campos Disponíveis

### Dados do Contrato
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do contrato |
| `totalAmount` | Decimal | Valor total do contrato |
| `installmentCount` | Int | Número total de parcelas |
| `installmentAmount` | Decimal | Valor de cada parcela |
| `firstDueDate` | Date | Data do primeiro vencimento |
| `periodicity` | String | Periodicidade: "Mensal", "Semanal", "Quinzenal", etc |
| `commissionPercentage` | Decimal | Percentual de comissão |
| `commissionAmount` | Decimal | Valor da comissão em reais |
| `notes` | String | Observações sobre o contrato |
| `createdAt` | DateTime | Data/hora de criação |
| `updatedAt` | DateTime | Data/hora da última atualização |

### Dados do Evento
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `event.id` | UUID | Identificador do evento |
| `event.name` | String | Nome do evento |
| `event.eventDate` | Date | Data do evento |

### Dados do Cliente
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `client.id` | UUID | Identificador do cliente |
| `client.name` | String | Nome do cliente |

### Dados das Parcelas (Array)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `installmentNumber` | Int | Número da parcela (1, 2, 3...) |
| `amount` | Decimal | Valor da parcela |
| `dueDate` | Date | Data de vencimento |
| `status` | String | Status: "pending", "paid", "overdue" |
| `paymentDate` | Date | Data do pagamento (null se não pago) |
| `paymentAmount` | Decimal | Valor pago (null se não pago) |
| `notes` | String | Observações da parcela |


## 📞 Suporte

Se encontrar algum problema:
1. Verifique se os headers (Authorization e x-organization-id) estão corretos
2. Confirme que o contractId é válido
3. Verifique permissões do usuário (módulo "financeiro" - view)
4. Console do navegador para erros
5. Network tab para ver resposta da API

**Servidor Backend:** http://localhost:3000  
**Endpoint:** `GET /api/contracts/:id`

