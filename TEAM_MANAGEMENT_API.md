# Gestão de Equipe por Evento — API Backend

## Visão Geral

API para gerenciamento de equipe por evento, incluindo cadastro de membros, escalas, confirmação de presença e visualização operacional do dia do evento.

---

## Autenticação

### Rotas Autenticadas
Todas as rotas autenticadas requerem:
- Header: `Authorization: Bearer <token>`
- Header: `X-Organization-Id: <organization_id>`
- Permissões: `cadastros` (view, create, edit, delete conforme endpoint)

### Rotas Públicas
As rotas de confirmação pública não requerem autenticação, apenas o token de confirmação.

---

## Endpoints

### Team Members (Membros da Equipe)

#### 1. Listar Membros
```http
GET /team-members
```

**Query Parameters:**
- `page` (number, opcional): Página (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 20)
- `search` (string, opcional): Busca por nome, email ou telefone
- `sortBy` (string, opcional): Campo para ordenação (padrão: "name")
- `sortOrder` (string, opcional): "asc" ou "desc" (padrão: "asc")

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "phone": "11999999999",
      "email": "joao@example.com",
      "notes": "Observações",
      "createdAt": "2026-01-22T10:00:00.000Z",
      "updatedAt": "2026-01-22T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### 2. Criar Membro
```http
POST /team-members
```

**Request Body:**
```json
{
  "name": "João Silva",
  "phone": "11999999999",
  "email": "joao@example.com",  // opcional
  "notes": "Observações"         // opcional
}
```

**Validações:**
- `name`: mínimo 3 caracteres, máximo 255
- `phone`: mínimo 10 caracteres, máximo 20
- `email`: válido se fornecido, máximo 255

**Response 201:**
```json
{
  "success": true,
  "message": "Membro da equipe criado com sucesso",
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "phone": "11999999999",
    "email": "joao@example.com",
    "notes": "Observações",
    "organizationId": "uuid",
    "createdBy": "uuid",
    "createdAt": "2026-01-22T10:00:00.000Z",
    "updatedAt": "2026-01-22T10:00:00.000Z"
  }
}
```

#### 3. Obter Membro
```http
GET /team-members/:id
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "phone": "11999999999",
    "email": "joao@example.com",
    "notes": "Observações",
    "schedules": [
      {
        "id": "uuid",
        "role": "Cozinha",
        "arrivalTime": "2026-01-22T08:00:00.000Z",
        "confirmationStatus": "pendente",
        "event": {
          "id": "uuid",
          "name": "Casamento",
          "eventDate": "2026-02-15T00:00:00.000Z",
          "eventTime": "2026-01-22T18:00:00.000Z",
          "status": "Confirmado"
        }
      }
    ]
  }
}
```

#### 4. Atualizar Membro
```http
PUT /team-members/:id
```

**Request Body:**
```json
{
  "name": "João Silva",        // opcional
  "phone": "11999999999",      // opcional
  "email": "joao@example.com", // opcional (pode ser string vazia para remover)
  "notes": "Observações"       // opcional
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Membro da equipe atualizado com sucesso",
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "phone": "11999999999",
    "email": "joao@example.com",
    "notes": "Observações",
    "updatedAt": "2026-01-22T10:00:00.000Z"
  }
}
```

#### 5. Deletar Membro
```http
DELETE /team-members/:id
```

**Response 200:**
```json
{
  "success": true,
  "message": "Membro da equipe deletado com sucesso",
  "data": null
}
```

**Erro 422:** Se o membro tiver escalas futuras cadastradas.

---

### Event Team Schedules (Escalas por Evento)

#### 1. Listar Escalas do Evento
```http
GET /events/:eventId/team-schedules
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "teamMemberId": "uuid",
      "role": "Cozinha",
      "arrivalTime": "2026-01-22T08:00:00.000Z",
      "notes": "Observações",
      "confirmationStatus": "pendente",
      "confirmationToken": "uuid",
      "confirmationTokenExpiresAt": "2026-01-29T10:00:00.000Z",
      "confirmedAt": null,
      "cancelledAt": null,
      "teamMember": {
        "id": "uuid",
        "name": "João Silva",
        "phone": "11999999999",
        "email": "joao@example.com"
      },
      "event": {
        "id": "uuid",
        "name": "Casamento",
        "eventDate": "2026-02-15T00:00:00.000Z",
        "eventTime": "2026-01-22T18:00:00.000Z",
        "location": "Salão de Festas"
      }
    }
  ]
}
```

**Ordenação:** Por status (pendente primeiro) e depois por horário de chegada.

#### 2. Adicionar Membro à Escala
```http
POST /events/:eventId/team-schedules
```

**Request Body:**
```json
{
  "teamMemberId": "uuid",
  "role": "Cozinha",
  "arrivalTime": "08:00",
  "notes": "Observações"  // opcional
}
```

**Validações:**
- `teamMemberId`: UUID válido, deve existir e pertencer à organização
- `role`: obrigatório, máximo 100 caracteres
- `arrivalTime`: formato HH:MM (ex: "08:00", "14:30")
- Não permite duplicação (mesmo membro no mesmo evento)

**Response 201:**
```json
{
  "success": true,
  "message": "Membro adicionado à escala com sucesso",
  "data": {
    "id": "uuid",
    "eventId": "uuid",
    "teamMemberId": "uuid",
    "role": "Cozinha",
    "arrivalTime": "2026-01-22T08:00:00.000Z",
    "confirmationStatus": "pendente",
    "teamMember": {
      "id": "uuid",
      "name": "João Silva",
      "phone": "11999999999",
      "email": "joao@example.com"
    },
    "event": {
      "id": "uuid",
      "name": "Casamento",
      "eventDate": "2026-02-15T00:00:00.000Z",
      "eventTime": "2026-01-22T18:00:00.000Z"
    }
  }
}
```

**Erro 409:** Se o membro já estiver escalado para o evento.

#### 3. Obter Escala
```http
GET /events/:eventId/team-schedules/:id
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "eventId": "uuid",
    "teamMemberId": "uuid",
    "role": "Cozinha",
    "arrivalTime": "2026-01-22T08:00:00.000Z",
    "notes": "Observações",
    "confirmationStatus": "pendente",
    "teamMember": {
      "id": "uuid",
      "name": "João Silva",
      "phone": "11999999999",
      "email": "joao@example.com",
      "notes": "Observações"
    },
    "event": {
      "id": "uuid",
      "name": "Casamento",
      "eventDate": "2026-02-15T00:00:00.000Z",
      "eventTime": "2026-01-22T18:00:00.000Z",
      "location": "Salão de Festas",
      "client": {
        "id": "uuid",
        "name": "Maria Santos"
      }
    }
  }
}
```

#### 4. Atualizar Escala
```http
PUT /events/:eventId/team-schedules/:id
```

**Request Body:**
```json
{
  "role": "Garçom",        // opcional
  "arrivalTime": "09:00",  // opcional, formato HH:MM
  "notes": "Observações"   // opcional
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Escala atualizada com sucesso",
  "data": {
    "id": "uuid",
    "role": "Garçom",
    "arrivalTime": "2026-01-22T09:00:00.000Z",
    "notes": "Observações",
    "updatedAt": "2026-01-22T10:00:00.000Z"
  }
}
```

#### 5. Remover da Escala
```http
DELETE /events/:eventId/team-schedules/:id
```

**Response 200:**
```json
{
  "success": true,
  "message": "Membro removido da escala com sucesso",
  "data": null
}
```

#### 6. Enviar Link de Confirmação
```http
POST /events/:eventId/team-schedules/:id/send-confirmation
```

**Response 200:**
```json
{
  "success": true,
  "message": "Link de confirmação gerado com sucesso",
  "data": {
    "confirmationUrl": "https://app.easybuffet.com/team-schedules/public/uuid-token",
    "whatsappUrl": "https://wa.me/5511999999999?text=...",
    "emailSent": true
  }
}
```

**Comportamento:**
- Gera token único se não existir ou se expirado
- Token expira em 7 dias
- Envia email automaticamente se o membro tiver email cadastrado
- Retorna URL do WhatsApp formatada

#### 7. Tela "Dia do Evento"
```http
GET /events/:eventId/team-schedules/day-view
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "uuid",
      "name": "Casamento",
      "eventDate": "2026-02-15T00:00:00.000Z",
      "eventTime": "2026-01-22T18:00:00.000Z",
      "location": "Salão de Festas",
      "guestCount": 150,
      "client": {
        "id": "uuid",
        "name": "Maria Santos",
        "phone": "11988888888"
      },
      "unit": {
        "id": "uuid",
        "name": "Unidade Centro",
        "color": "#FF5733"
      }
    },
    "schedules": {
      "Cozinha": [
        {
          "id": "uuid",
          "role": "Cozinha",
          "arrivalTime": "2026-01-22T08:00:00.000Z",
          "confirmationStatus": "confirmado",
          "teamMember": {
            "id": "uuid",
            "name": "João Silva",
            "phone": "11999999999",
            "email": "joao@example.com"
          }
        }
      ],
      "Garçom": [
        {
          "id": "uuid",
          "role": "Garçom",
          "arrivalTime": "2026-01-22T09:00:00.000Z",
          "confirmationStatus": "pendente",
          "teamMember": {
            "id": "uuid",
            "name": "Maria Santos",
            "phone": "11988888888",
            "email": "maria@example.com"
          }
        }
      ]
    },
    "statusCounts": {
      "pendente": 2,
      "confirmado": 5,
      "cancelado": 1
    },
    "total": 8
  }
}
```

**Estrutura:**
- Agrupado por função (role)
- Ordenado por status (pendente primeiro), depois por função e horário
- Contadores de status incluídos

---

### Rotas Públicas (Confirmação)

#### 1. Visualizar Escala (Público)
```http
GET /team-schedules/public/:token
```

**Sem autenticação necessária**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "eventId": "uuid",
    "teamMemberId": "uuid",
    "role": "Cozinha",
    "arrivalTime": "2026-01-22T08:00:00.000Z",
    "notes": "Observações",
    "confirmationStatus": "pendente",
    "teamMember": {
      "id": "uuid",
      "name": "João Silva",
      "phone": "11999999999",
      "email": "joao@example.com"
    },
    "event": {
      "id": "uuid",
      "name": "Casamento",
      "eventDate": "2026-02-15T00:00:00.000Z",
      "eventTime": "2026-01-22T18:00:00.000Z",
      "location": "Salão de Festas",
      "client": {
        "id": "uuid",
        "name": "Maria Santos"
      },
      "organization": {
        "id": "uuid",
        "name": "Buffet Exemplo",
        "fantasyName": "Buffet Exemplo",
        "phone": "11977777777"
      }
    }
  }
}
```

**Erro 410:** Se o token expirou.

#### 2. Confirmar Presença (Público)
```http
PATCH /team-schedules/public/:token/confirm
```

**Sem autenticação necessária**

**Response 200:**
```json
{
  "success": true,
  "message": "Presença confirmada com sucesso",
  "data": {
    "id": "uuid",
    "confirmationStatus": "confirmado",
    "confirmedAt": "2026-01-22T10:00:00.000Z",
    "teamMember": {
      "id": "uuid",
      "name": "João Silva",
      "phone": "11999999999",
      "email": "joao@example.com"
    },
    "event": {
      "id": "uuid",
      "name": "Casamento",
      "eventDate": "2026-02-15T00:00:00.000Z",
      "eventTime": "2026-01-22T18:00:00.000Z",
      "location": "Salão de Festas"
    }
  }
}
```

**Erro 409:** Se já confirmado ou cancelado.

#### 3. Cancelar Presença (Público)
```http
PATCH /team-schedules/public/:token/cancel
```

**Sem autenticação necessária**

**Response 200:**
```json
{
  "success": true,
  "message": "Presença cancelada com sucesso",
  "data": {
    "id": "uuid",
    "confirmationStatus": "cancelado",
    "cancelledAt": "2026-01-22T10:00:00.000Z",
    "teamMember": {
      "id": "uuid",
      "name": "João Silva",
      "phone": "11999999999",
      "email": "joao@example.com"
    },
    "event": {
      "id": "uuid",
      "name": "Casamento",
      "eventDate": "2026-02-15T00:00:00.000Z",
      "eventTime": "2026-01-22T18:00:00.000Z",
      "location": "Salão de Festas"
    }
  }
}
```

**Erro 409:** Se já cancelado ou confirmado.

---

## Códigos de Status HTTP

### Sucesso
- `200 OK`: Operação bem-sucedida
- `201 Created`: Recurso criado com sucesso

### Erros do Cliente
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Token ausente ou inválido
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (ex: duplicação, status inválido)
- `410 Gone`: Link expirado
- `422 Unprocessable Entity`: Erro de validação ou regra de negócio

### Erros do Servidor
- `500 Internal Server Error`: Erro interno

---

## Códigos de Erro da Aplicação

| Código | Mensagem | Status |
|--------|----------|--------|
| `TEAM_MEMBER_NOT_FOUND` | Membro da equipe não encontrado | 404 |
| `TEAM_SCHEDULE_NOT_FOUND` | Escala não encontrada | 404 |
| `TEAM_SCHEDULE_ALREADY_EXISTS` | Este membro já está escalado para este evento | 409 |
| `TEAM_SCHEDULE_ALREADY_CONFIRMED` | Esta escala já foi confirmada | 409 |
| `TEAM_SCHEDULE_ALREADY_CANCELLED` | Esta escala já foi cancelada | 409 |
| `TEAM_SCHEDULE_LINK_EXPIRED` | O link de confirmação expirou | 410 |
| `CANNOT_DELETE_WITH_DEPENDENCIES` | Não é possível deletar membro com escalas futuras | 422 |

---

## Status de Confirmação

Os valores possíveis para `confirmationStatus` são:
- `pendente`: Aguardando confirmação (padrão)
- `confirmado`: Presença confirmada
- `cancelado`: Presença cancelada

---

## Formatos de Data/Hora

### Datas
- **API Request/Response**: ISO 8601 (ex: `2026-02-15T00:00:00.000Z`)
- **arrivalTime Request**: String formato `HH:MM` (ex: `"08:00"`, `"14:30"`)
- **arrivalTime Response**: ISO 8601 com time (ex: `2026-01-22T08:00:00.000Z`)

### Conversão no Frontend
```javascript
// Converter arrivalTime para exibição
const arrivalTime = new Date(schedule.arrivalTime);
const formatted = arrivalTime.toTimeString().slice(0, 5); // "08:00"

// Converter para input
const timeString = "08:00"; // Formato HH:MM
```

---

## Fluxos de Uso

### 1. Cadastrar Membro e Adicionar à Escala
```
1. POST /team-members (criar membro)
2. POST /events/:eventId/team-schedules (adicionar à escala)
3. POST /events/:eventId/team-schedules/:id/send-confirmation (enviar link)
```

### 2. Visualizar Escala do Evento
```
1. GET /events/:eventId/team-schedules (lista completa)
   OU
2. GET /events/:eventId/team-schedules/day-view (visão operacional agrupada)
```

### 3. Confirmação de Presença (Público)
```
1. GET /team-schedules/public/:token (visualizar detalhes)
2. PATCH /team-schedules/public/:token/confirm (confirmar)
   OU
3. PATCH /team-schedules/public/:token/cancel (cancelar)
```

---

## Exemplos de Requisições

### Criar Membro e Adicionar à Escala
```javascript
// 1. Criar membro
const member = await fetch('/team-members', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Organization-Id': orgId,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'João Silva',
    phone: '11999999999',
    email: 'joao@example.com'
  })
});

// 2. Adicionar à escala
const schedule = await fetch(`/events/${eventId}/team-schedules`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Organization-Id': orgId,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    teamMemberId: member.data.id,
    role: 'Cozinha',
    arrivalTime: '08:00'
  })
});

// 3. Enviar link de confirmação
const confirmation = await fetch(
  `/events/${eventId}/team-schedules/${schedule.data.id}/send-confirmation`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-Id': orgId
    }
  }
);

// Usar confirmation.data.whatsappUrl ou confirmation.data.confirmationUrl
```

### Confirmar Presença (Público)
```javascript
// Visualizar
const schedule = await fetch(`/team-schedules/public/${token}`);

// Confirmar
const confirmed = await fetch(`/team-schedules/public/${token}/confirm`, {
  method: 'PATCH'
});
```

---

## Notas Importantes

1. **Email Opcional**: O campo `email` em TeamMember é opcional. Se não fornecido ou string vazia, será `null` no banco.

2. **Token de Confirmação**: 
   - Gerado automaticamente ao chamar `send-confirmation`
   - Expira em 7 dias
   - Único por escala

3. **WhatsApp URL**: 
   - Gerada automaticamente no formato `https://wa.me/5511999999999?text=...`
   - Mensagem pré-formatada com detalhes do evento
   - Telefone limpo (apenas números)

4. **Soft Delete**: 
   - TeamMembers usam soft delete (deletedAt)
   - Não podem ser deletados se tiverem escalas futuras

5. **Validação de Duplicação**: 
   - Não é possível adicionar o mesmo membro duas vezes no mesmo evento
   - Retorna erro 409 se tentar

6. **Ordenação de Escalas**: 
   - Sempre ordena por status (pendente primeiro)
   - Depois por horário de chegada (ascendente)

---

## Variáveis de Ambiente Necessárias

O backend utiliza:
- `APP_DOMAIN`: URL base da aplicação (ex: `https://app.easybuffet.com`)
- `SENDER_EMAIL`: Email remetente para envio de confirmações
- `RESEND_API_KEY`: Chave da API Resend para envio de emails

---

## Permissões Necessárias

Todas as rotas autenticadas requerem permissões no módulo `cadastros`:
- `view`: Listar e visualizar
- `create`: Criar membros e escalas
- `edit`: Atualizar e enviar links
- `delete`: Deletar membros e remover escalas
