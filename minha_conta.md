# 👤 Minha Conta - Documentação de API

## Visão Geral

A seção "Minha Conta" permite que o usuário visualize e gerencie seus dados pessoais, informações da organização e histórico de atividades.

---

## 🔐 Autenticação e Permissões

Todas as rotas requerem:

1. **Autenticação**: Token JWT no header `Authorization`
2. **Organização**: Header `x-organization-id` com o ID da organização (exceto `/api/auth/me`)

### Headers Obrigatórios

```
Authorization: Bearer <token>
x-organization-id: <organization-id>  (quando aplicável)
```

### Códigos de Erro

- `401 Unauthorized`: Token ausente ou inválido
- `403 Forbidden`: Sem permissão para acessar o recurso
- `404 Not Found`: Recurso não encontrado
- `400 Bad Request`: Dados inválidos

---

## 📍 Endpoints

### 1. Obter Dados do Usuário Logado

Retorna os dados do usuário autenticado, incluindo informações da organização atual.

**Endpoint:**
```
GET /api/auth/me
```

**Observação:** Este endpoint não requer o header `x-organization-id`, mas se fornecido, retorna informações específicas da organização.

**Exemplo de Requisição:**
```bash
curl -X GET "https://api.example.com/api/auth/me" \
  -H "Authorization: Bearer <token>" \
  -H "x-organization-id: <organization-id>"  # Opcional
```

**Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "(11) 99999-9999",
    "status": "Ativo",
    "currentOrganization": {
      "id": "uuid-da-organizacao",
      "name": "Buffet Exemplo",
      "role": "Administrador",
      "permissions": {
        "dashboard": { "view": true },
        "cadastros": {
          "create": true,
          "edit": true,
          "delete": true,
          "view": true
        },
        "financeiro": {
          "create": true,
          "edit": true,
          "delete": true,
          "view": true
        },
        "relatorios": {
          "view": true,
          "export": true
        }
      }
    }
  }
}
```

**Estrutura da Resposta:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único do usuário |
| `name` | string | Nome completo do usuário |
| `email` | string | Email do usuário |
| `avatar` | string \| null | URL do avatar (pode ser null) |
| `phone` | string \| null | Telefone do usuário (pode ser null) |
| `status` | string | Status do usuário: `"Ativo"` ou `"Inativo"` |
| `currentOrganization` | object \| null | Informações da organização atual (null se não fornecido `x-organization-id`) |

**Estrutura de `currentOrganization`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID da organização |
| `name` | string | Nome da organização |
| `role` | string | Papel do usuário: `"Administrador"` ou `"Auxiliar"` |
| `permissions` | object | Objeto com permissões do usuário na organização |

**Observações:**
- Se `x-organization-id` não for fornecido, `currentOrganization` será `null`
- O campo `avatar` pode ser `null` se o usuário não tiver avatar configurado
- O campo `phone` pode ser `null` se não estiver cadastrado

---

### 2. Atualizar Dados do Usuário

Atualiza os dados do usuário. Pode ser usado para atualizar o próprio perfil ou de outros usuários (dependendo das permissões).

**Endpoint:**
```
PUT /api/users/:id
```

**Parâmetros de Rota:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do usuário a ser atualizado |

**Body (todos os campos são opcionais):**

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "(11) 99999-9999",
  "status": "Ativo"
}
```

**Validações:**
- `name`: String, mínimo 3 caracteres, máximo 255 caracteres
- `email`: String, formato de email válido, máximo 255 caracteres
- `phone`: String, máximo 20 caracteres (opcional)
- `status`: Enum, valores aceitos: `"Ativo"` ou `"Inativo"`

**Exemplo de Requisição:**
```bash
curl -X PUT "https://api.example.com/api/users/uuid-do-usuario" \
  -H "Authorization: Bearer <token>" \
  -H "x-organization-id: <organization-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Santos",
    "phone": "(11) 88888-8888"
  }'
```

**Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-usuario",
    "name": "João Silva Santos",
    "email": "joao@example.com",
    "phone": "(11) 88888-8888",
    "status": "Ativo",
    "avatarUrl": "https://example.com/avatar.jpg",
    "passwordHash": "...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "lastLoginAt": "2024-01-14T15:20:00.000Z",
    "deletedAt": null
  },
  "message": "Usuário atualizado com sucesso"
}
```

**Observações:**
- Apenas os campos enviados no body serão atualizados
- O usuário deve pertencer à organização especificada no header
- Administradores podem atualizar qualquer usuário da organização
- Usuários podem atualizar seus próprios dados (passando seu próprio ID)

**Resposta de Erro (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Usuário não encontrado"
  }
}
```

---

### 3. Obter Dados da Empresa

Retorna todas as informações cadastradas da organização/empresa.

**Endpoint:**
```
GET /api/settings/company
```

**Permissão:** Requer autenticação e organização válida

**Exemplo de Requisição:**
```bash
curl -X GET "https://api.example.com/api/settings/company" \
  -H "Authorization: Bearer <token>" \
  -H "x-organization-id: <organization-id>"
```

**Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "name": "Buffet Exemplo Ltda",
    "fantasyName": "Buffet Exemplo",
    "cnpj": "12.345.678/0001-90",
    "stateRegistration": "123.456.789.012",
    "address": {
      "zipCode": "01234-567",
      "street": "Rua Exemplo",
      "number": "123",
      "complement": "Sala 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP"
    },
    "contact": {
      "phone": "(11) 3333-3333",
      "mobile": "(11) 99999-9999",
      "email": "contato@buffetexemplo.com.br",
      "website": "https://www.buffetexemplo.com.br"
    },
    "socialMedia": {
      "instagram": "@buffetexemplo",
      "facebook": "buffetexemplo",
      "twitter": "@buffetexemplo"
    },
    "logo": "https://example.com/logo.png",
    "bankInfo": {
      "bank": "Banco do Brasil",
      "agency": "1234-5",
      "account": "12345-6",
      "accountType": "Corrente",
      "pixKey": "contato@buffetexemplo.com.br"
    }
  }
}
```

**Estrutura da Resposta:**

#### Dados Básicos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Razão social |
| `fantasyName` | string | Nome fantasia |
| `cnpj` | string \| null | CNPJ da empresa |
| `stateRegistration` | string \| null | Inscrição estadual |

#### Endereço (`address`)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `zipCode` | string \| null | CEP |
| `street` | string \| null | Rua |
| `number` | string \| null | Número |
| `complement` | string \| null | Complemento |
| `neighborhood` | string \| null | Bairro |
| `city` | string \| null | Cidade |
| `state` | string \| null | Estado (UF) |

#### Contato (`contact`)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `phone` | string \| null | Telefone fixo |
| `mobile` | string \| null | Telefone celular |
| `email` | string \| null | Email |
| `website` | string \| null | Website |

#### Redes Sociais (`socialMedia`)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `instagram` | string \| null | Instagram |
| `facebook` | string \| null | Facebook |
| `twitter` | string \| null | Twitter |

#### Informações Bancárias (`bankInfo`)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `bank` | string \| null | Nome do banco |
| `agency` | string \| null | Agência |
| `account` | string \| null | Conta |
| `accountType` | string \| null | Tipo de conta (ex: "Corrente", "Poupança") |
| `pixKey` | string \| null | Chave PIX |

**Observações:**
- Todos os campos podem ser `null` se não estiverem cadastrados
- O campo `logo` é uma URL para a imagem do logo

---

### 4. Atualizar Dados da Empresa

Atualiza as informações da organização/empresa.

**Endpoint:**
```
PUT /api/settings/company
```

**Permissão:** Requer autenticação e organização válida

**Body (todos os campos são opcionais):**

```json
{
  "name": "Buffet Exemplo Ltda",
  "fantasyName": "Buffet Exemplo",
  "cnpj": "12.345.678/0001-90",
  "stateRegistration": "123.456.789.012",
  "address": {
    "zipCode": "01234-567",
    "street": "Rua Exemplo",
    "number": "123",
    "complement": "Sala 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP"
  },
  "contact": {
    "phone": "(11) 3333-3333",
    "mobile": "(11) 99999-9999",
    "email": "contato@buffetexemplo.com.br",
    "website": "https://www.buffetexemplo.com.br"
  },
  "socialMedia": {
    "instagram": "@buffetexemplo",
    "facebook": "buffetexemplo",
    "twitter": "@buffetexemplo"
  },
  "logo": "https://example.com/logo.png",
  "bankInfo": {
    "bank": "Banco do Brasil",
    "agency": "1234-5",
    "account": "12345-6",
    "accountType": "Corrente",
    "pixKey": "contato@buffetexemplo.com.br"
  }
}
```

**Exemplo de Requisição:**
```bash
curl -X PUT "https://api.example.com/api/settings/company" \
  -H "Authorization: Bearer <token>" \
  -H "x-organization-id: <organization-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buffet Exemplo Ltda",
    "fantasyName": "Buffet Exemplo",
    "address": {
      "city": "São Paulo",
      "state": "SP"
    }
  }'
```

**Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-da-organizacao",
    "name": "Buffet Exemplo Ltda",
    "fantasyName": "Buffet Exemplo",
    "cnpj": "12.345.678/0001-90",
    ...
  },
  "message": "Dados da empresa atualizados com sucesso"
}
```

**Observações:**
- Apenas os campos enviados serão atualizados
- Campos aninhados (como `address`, `contact`) podem ser atualizados parcialmente
- A ação é registrada no log de atividades

---

### 5. Listar Logs de Atividade

Retorna o histórico de atividades da organização com paginação e filtros.

**Endpoint:**
```
GET /api/settings/activity-logs
```

**Permissão:** Requer autenticação e organização válida

**Query Parameters (todos opcionais):**

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `page` | number | Número da página | `1` |
| `limit` | number | Itens por página | `20` |
| `userId` | string (UUID) | Filtrar por usuário | `uuid-do-usuario` |
| `module` | string | Filtrar por módulo | `"Usuários"`, `"Configurações"` |
| `action` | string | Filtrar por ação | `"CREATE_USER"`, `"UPDATE_COMPANY"` |
| `dateFrom` | string (ISO 8601) | Data inicial | `"2024-01-01"` |
| `dateTo` | string (ISO 8601) | Data final | `"2024-01-31"` |

**Exemplo de Requisição:**
```bash
curl -X GET "https://api.example.com/api/settings/activity-logs?page=1&limit=20&module=Usuários" \
  -H "Authorization: Bearer <token>" \
  -H "x-organization-id: <organization-id>"
```

**Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-do-log",
      "user": "João Silva",
      "action": "CREATE_USER",
      "module": "Usuários",
      "description": "Criou o usuário Maria Santos",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "ip": "192.168.1.1"
    },
    {
      "id": "uuid-do-log-2",
      "user": "Maria Santos",
      "action": "UPDATE_COMPANY",
      "module": "Configurações",
      "description": "Atualizou dados da empresa",
      "timestamp": "2024-01-14T15:20:00.000Z",
      "ip": "192.168.1.2"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Estrutura do Item:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único do log |
| `user` | string | Nome do usuário que realizou a ação |
| `action` | string | Código da ação (ex: `"CREATE_USER"`, `"UPDATE_COMPANY"`) |
| `module` | string | Módulo onde a ação ocorreu |
| `description` | string | Descrição legível da ação |
| `timestamp` | string (ISO 8601) | Data e hora da ação |
| `ip` | string | Endereço IP de onde a ação foi realizada |

**Observações:**
- Padrão de paginação: `page=1`, `limit=20`
- Ordenação: mais recentes primeiro
- Filtros podem ser combinados
- Datas devem estar no formato ISO 8601 (YYYY-MM-DD)

---

## 🔄 Fluxo de Integração

### Exemplo de Uso no Frontend

```typescript
// 1. Obter dados do usuário logado
const getMyProfile = async () => {
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-organization-id': organizationId,
    },
  });
  
  const result = await response.json();
  return result.data;
};

// 2. Atualizar perfil do usuário
const updateMyProfile = async (userId: string, data: {
  name?: string;
  email?: string;
  phone?: string;
}) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-organization-id': organizationId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  return result.data;
};

// 3. Obter dados da empresa
const getCompanyData = async () => {
  const response = await fetch('/api/settings/company', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-organization-id': organizationId,
    },
  });
  
  const result = await response.json();
  return result.data;
};

// 4. Atualizar dados da empresa
const updateCompanyData = async (data: any) => {
  const response = await fetch('/api/settings/company', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-organization-id': organizationId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  return result.data;
};

// 5. Listar logs de atividade
const getActivityLogs = async (filters?: {
  page?: number;
  limit?: number;
  userId?: string;
  module?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await fetch(
    `/api/settings/activity-logs?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-organization-id': organizationId,
      },
    }
  );
  
  const result = await response.json();
  return result;
};
```

---

## 📝 Notas Técnicas

### Formato de Datas
- Todas as datas são retornadas no formato ISO 8601 (UTC)
- Exemplo: `2024-01-15T10:30:00.000Z`

### Validações
- **Email**: Deve ser um formato de email válido
- **Nome**: Mínimo 3 caracteres, máximo 255 caracteres
- **Telefone**: Máximo 20 caracteres
- **Status**: Apenas `"Ativo"` ou `"Inativo"`

### Permissões
- Usuários podem atualizar seus próprios dados
- Administradores podem atualizar qualquer usuário da organização
- Todos os usuários autenticados podem visualizar dados da empresa
- Logs de atividade são visíveis para todos os usuários autenticados

### Logs de Atividade
As seguintes ações são registradas automaticamente:
- `CREATE_USER`: Criação de usuário
- `UPDATE_USER`: Atualização de usuário
- `UPDATE_USER_PERMISSIONS`: Atualização de permissões
- `DELETE_USER`: Exclusão de usuário
- `UPDATE_COMPANY`: Atualização de dados da empresa

---

## ⚠️ Limitações e Considerações

1. **Avatar**: O campo `avatar` é apenas leitura na resposta. Não há endpoint específico para upload de avatar (pode ser implementado separadamente).

2. **Senha**: Não há endpoint para alteração de senha. Isso pode ser implementado como funcionalidade futura.

3. **Email**: Ao atualizar o email, verifique se o novo email não está em uso por outro usuário.

4. **Status**: Apenas administradores devem poder alterar o status de outros usuários.

5. **Logs**: Os logs são paginados e ordenados por data (mais recentes primeiro).

---

## 🧪 Exemplos de Teste

### Teste com cURL

```bash
# 1. Obter dados do usuário logado
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "x-organization-id: seu-org-id-aqui"

# 2. Atualizar perfil
curl -X PUT "http://localhost:3000/api/users/seu-user-id" \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "x-organization-id: seu-org-id-aqui" \
  -H "Content-Type: application/json" \
  -d '{"name": "Novo Nome", "phone": "(11) 99999-9999"}'

# 3. Obter dados da empresa
curl -X GET "http://localhost:3000/api/settings/company" \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "x-organization-id: seu-org-id-aqui"

# 4. Atualizar dados da empresa
curl -X PUT "http://localhost:3000/api/settings/company" \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "x-organization-id: seu-org-id-aqui" \
  -H "Content-Type: application/json" \
  -d '{"name": "Nova Razão Social", "fantasyName": "Novo Nome Fantasia"}'

# 5. Listar logs de atividade
curl -X GET "http://localhost:3000/api/settings/activity-logs?page=1&limit=20" \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "x-organization-id: seu-org-id-aqui"
```

---

## 📊 Casos de Uso

### 1. Perfil do Usuário
Use `/api/auth/me` para:
- Exibir nome, email, avatar e telefone do usuário
- Mostrar informações da organização atual
- Exibir permissões e papel do usuário

### 2. Edição de Perfil
Use `PUT /api/users/:id` para:
- Atualizar nome do usuário
- Atualizar telefone
- Atualizar email (com validação)

### 3. Configurações da Empresa
Use `/api/settings/company` para:
- Visualizar dados completos da empresa
- Editar informações cadastrais
- Atualizar endereço e contatos
- Gerenciar informações bancárias

### 4. Histórico de Atividades
Use `/api/settings/activity-logs` para:
- Exibir timeline de ações
- Filtrar por usuário, módulo ou ação
- Ver histórico de mudanças
- Auditoria de ações

---

## 🔗 Relacionamento com Outros Endpoints

A seção "Minha Conta" utiliza dados de:
- **Autenticação**: Para obter dados do usuário logado
- **Usuários**: Para atualizar dados do perfil
- **Organizações**: Para dados da empresa
- **Logs de Atividade**: Para histórico de ações

