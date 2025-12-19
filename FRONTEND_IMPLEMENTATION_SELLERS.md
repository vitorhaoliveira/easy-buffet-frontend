# Documentação de Implementação - Vendedoras (Sellers)

## Visão Geral

Este documento contém todas as informações necessárias para implementar a funcionalidade de vendedoras no frontend, incluindo endpoints, schemas, exemplos e integração com contratos.

---

## Endpoints de Vendedoras

### Base URL
```
/api/sellers
```

Todos os endpoints requerem:
- Autenticação (Bearer Token)
- Header `x-organization-id`
- Permissão no módulo `cadastros`

---

## 1. Listar Vendedoras

### GET `/api/sellers`

Lista todas as vendedoras da organização com paginação e busca.

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)
- `search` (opcional): Busca por nome, email ou telefone
- `sortBy` (opcional): Campo para ordenação (padrão: "name")
- `sortOrder` (opcional): "asc" ou "desc" (padrão: "asc")

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "name": "Maria Silva",
      "email": "maria@example.com",
      "phone": "11999999999",
      "notes": "Observações sobre a vendedora",
      "createdAt": "2024-12-18T20:00:00.000Z",
      "updatedAt": "2024-12-18T20:00:00.000Z",
      "deletedAt": null,
      "createdBy": "uuid"
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

**Exemplo de Requisição:**
```javascript
const response = await fetch('/api/sellers?page=1&limit=20&search=Maria', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-organization-id': organizationId
  }
});
```

---

## 2. Criar Vendedora

### POST `/api/sellers`

Cria uma nova vendedora.

**Request Body:**
```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "phone": "11999999999",
  "notes": "Observações opcionais"
}
```

**Validações:**
- `name`: obrigatório, mínimo 3 caracteres, máximo 255
- `email`: obrigatório, formato de email válido, máximo 255
- `phone`: obrigatório, mínimo 10 caracteres, máximo 20
- `notes`: opcional

**Response 201:**
```json
{
  "success": true,
  "message": "Vendedora criada com sucesso",
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "name": "Maria Silva",
    "email": "maria@example.com",
    "phone": "11999999999",
    "notes": "Observações opcionais",
    "createdAt": "2024-12-18T20:00:00.000Z",
    "updatedAt": "2024-12-18T20:00:00.000Z",
    "deletedAt": null,
    "createdBy": "uuid"
  }
}
```

**Exemplo de Requisição:**
```javascript
const response = await fetch('/api/sellers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-organization-id': organizationId,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Maria Silva',
    email: 'maria@example.com',
    phone: '11999999999',
    notes: 'Observações opcionais'
  })
});
```

---

## 3. Buscar Vendedora por ID

### GET `/api/sellers/:id`

Busca uma vendedora específica com seus contratos relacionados.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "name": "Maria Silva",
    "email": "maria@example.com",
    "phone": "11999999999",
    "notes": "Observações opcionais",
    "createdAt": "2024-12-18T20:00:00.000Z",
    "updatedAt": "2024-12-18T20:00:00.000Z",
    "deletedAt": null,
    "createdBy": "uuid",
    "contracts": [
      {
        "id": "uuid",
        "totalAmount": "10000.00",
        "createdAt": "2024-12-18T20:00:00.000Z",
        "event": {
          "id": "uuid",
          "name": "Casamento João e Maria",
          "eventDate": "2024-12-25T00:00:00.000Z"
        }
      }
    ]
  }
}
```

**Exemplo de Requisição:**
```javascript
const response = await fetch(`/api/sellers/${sellerId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-organization-id': organizationId
  }
});
```

---

## 4. Atualizar Vendedora

### PUT `/api/sellers/:id`

Atualiza uma vendedora existente.

**Request Body:**
```json
{
  "name": "Maria Silva Santos",
  "email": "maria.santos@example.com",
  "phone": "11988888888",
  "notes": "Observações atualizadas"
}
```

**Validações:**
- Todos os campos são opcionais
- Mesmas regras de validação da criação

**Response 200:**
```json
{
  "success": true,
  "message": "Vendedora atualizada com sucesso",
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "name": "Maria Silva Santos",
    "email": "maria.santos@example.com",
    "phone": "11988888888",
    "notes": "Observações atualizadas",
    "createdAt": "2024-12-18T20:00:00.000Z",
    "updatedAt": "2024-12-18T21:00:00.000Z",
    "deletedAt": null,
    "createdBy": "uuid"
  }
}
```

**Exemplo de Requisição:**
```javascript
const response = await fetch(`/api/sellers/${sellerId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-organization-id': organizationId,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Maria Silva Santos',
    email: 'maria.santos@example.com',
    phone: '11988888888'
  })
});
```

---

## 5. Deletar Vendedora

### DELETE `/api/sellers/:id`

Deleta uma vendedora (soft delete).

**Validação:**
- Não é possível deletar vendedora que possui contratos cadastrados

**Response 200:**
```json
{
  "success": true,
  "message": "Vendedora deletada com sucesso",
  "data": null
}
```

**Erro 422 (se houver contratos):**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_WITH_DEPENDENCIES",
    "message": "Não é possível deletar vendedora com contratos cadastrados"
  }
}
```

**Exemplo de Requisição:**
```javascript
const response = await fetch(`/api/sellers/${sellerId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-organization-id': organizationId
  }
});
```

---

## Integração com Contratos

### Associar Vendedora ao Criar Contrato

Ao criar um contrato, você pode opcionalmente associar uma vendedora.

**POST `/api/contracts`**

**Request Body (atualizado):**
```json
{
  "eventId": "uuid",
  "clientId": "uuid",
  "totalAmount": 10000,
  "installmentCount": 12,
  "firstDueDate": "2024-01-15",
  "periodicity": "Mensal",
  "commissionPercentage": 5,
  "sellerId": "uuid",  // NOVO: opcional
  "notes": "Observações do contrato"
}
```

**Response 200 (inclui seller):**
```json
{
  "success": true,
  "message": "Contrato criado com sucesso",
  "data": {
    "contract": {
      "id": "uuid",
      "organizationId": "uuid",
      "eventId": "uuid",
      "clientId": "uuid",
      "sellerId": "uuid",  // NOVO
      "totalAmount": "10000.00",
      "installmentCount": 12,
      "installmentAmount": "833.33",
      "firstDueDate": "2024-01-15T00:00:00.000Z",
      "periodicity": "Mensal",
      "commissionPercentage": "5.00",
      "commissionAmount": "500.00",
      "notes": "Observações do contrato",
      "createdAt": "2024-12-18T20:00:00.000Z",
      "updatedAt": "2024-12-18T20:00:00.000Z"
    },
    "installments": [...]
  }
}
```

### Atualizar Vendedora de um Contrato

**PUT `/api/contracts/:id`**

**Request Body:**
```json
{
  "sellerId": "uuid"  // Pode ser null para remover a associação
}
```

**Exemplo para remover vendedora:**
```json
{
  "sellerId": null
}
```

### Listar Contratos (inclui seller)

**GET `/api/contracts`**

**Response 200 (atualizado):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "eventId": "uuid",
      "clientId": "uuid",
      "sellerId": "uuid",  // NOVO
      "totalAmount": "10000.00",
      "event": {
        "id": "uuid",
        "name": "Casamento",
        "eventDate": "2024-12-25T00:00:00.000Z"
      },
      "client": {
        "id": "uuid",
        "name": "João Silva"
      },
      "seller": {  // NOVO
        "id": "uuid",
        "name": "Maria Silva",
        "email": "maria@example.com"
      },
      "totalPaid": 5000,
      "remainingBalance": 5000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Buscar Contrato por ID (inclui seller)

**GET `/api/contracts/:id`**

**Response 200 (atualizado):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "eventId": "uuid",
    "clientId": "uuid",
    "sellerId": "uuid",  // NOVO
    "totalAmount": "10000.00",
    "event": {
      "id": "uuid",
      "name": "Casamento",
      "eventDate": "2024-12-25T00:00:00.000Z"
    },
    "client": {
      "id": "uuid",
      "name": "João Silva"
    },
    "seller": {  // NOVO (pode ser null)
      "id": "uuid",
      "name": "Maria Silva",
      "email": "maria@example.com"
    },
    "installments": [...],
    "additionalPayments": [...],
    "totalPaid": 5000,
    "remainingBalance": 5000
  }
}
```

---

## Códigos de Erro

### Erros Comuns

**404 - Vendedora não encontrada:**
```json
{
  "success": false,
  "error": {
    "code": "SELLER_NOT_FOUND",
    "message": "Vendedora não encontrada"
  }
}
```

**422 - Não é possível deletar com dependências:**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_WITH_DEPENDENCIES",
    "message": "Não é possível deletar vendedora com contratos cadastrados"
  }
}
```

**400 - Erro de validação:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erro de validação",
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      }
    ]
  }
}
```

**403 - Sem permissão:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Você não tem permissão para realizar esta ação"
  }
}
```

---

## Permissões Necessárias

Para acessar os endpoints de vendedoras, o usuário precisa ter permissões no módulo `cadastros`:

- **Listar/Buscar**: `cadastros.view`
- **Criar**: `cadastros.create`
- **Atualizar**: `cadastros.edit`
- **Deletar**: `cadastros.delete`

---

## Exemplos de Implementação

### React/TypeScript - Hook para Vendedoras

```typescript
import { useState, useEffect } from 'react';

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseSellersReturn {
  sellers: Seller[];
  loading: boolean;
  error: string | null;
  createSeller: (data: Omit<Seller, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSeller: (id: string, data: Partial<Seller>) => Promise<void>;
  deleteSeller: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useSellers(organizationId: string): UseSellersReturn {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sellers', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'x-organization-id': organizationId
        }
      });
      
      if (!response.ok) throw new Error('Erro ao buscar vendedoras');
      
      const data = await response.json();
      setSellers(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSeller = async (data: Omit<Seller, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch('/api/sellers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'x-organization-id': organizationId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Erro ao criar vendedora');
    await fetchSellers();
  };

  const updateSeller = async (id: string, data: Partial<Seller>) => {
    const response = await fetch(`/api/sellers/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'x-organization-id': organizationId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Erro ao atualizar vendedora');
    await fetchSellers();
  };

  const deleteSeller = async (id: string) => {
    const response = await fetch(`/api/sellers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'x-organization-id': organizationId
      }
    });
    
    if (!response.ok) throw new Error('Erro ao deletar vendedora');
    await fetchSellers();
  };

  useEffect(() => {
    fetchSellers();
  }, [organizationId]);

  return {
    sellers,
    loading,
    error,
    createSeller,
    updateSeller,
    deleteSeller,
    refetch: fetchSellers
  };
}
```

### Componente de Seleção de Vendedora

```typescript
interface SellerSelectProps {
  value?: string | null;
  onChange: (sellerId: string | null) => void;
  organizationId: string;
}

export function SellerSelect({ value, onChange, organizationId }: SellerSelectProps) {
  const { sellers, loading } = useSellers(organizationId);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={loading}
    >
      <option value="">Nenhuma vendedora</option>
      {sellers.map(seller => (
        <option key={seller.id} value={seller.id}>
          {seller.name} - {seller.email}
        </option>
      ))}
    </select>
  );
}
```

### Formulário de Contrato (com vendedora)

```typescript
interface ContractFormData {
  eventId: string;
  clientId: string;
  totalAmount: number;
  installmentCount: number;
  firstDueDate: string;
  periodicity: 'Mensal' | 'Bimestral' | 'Trimestral';
  commissionPercentage: number;
  sellerId?: string | null;  // NOVO
  notes?: string;
}

export function ContractForm() {
  const [formData, setFormData] = useState<ContractFormData>({
    eventId: '',
    clientId: '',
    totalAmount: 0,
    installmentCount: 1,
    firstDueDate: '',
    periodicity: 'Mensal',
    commissionPercentage: 0,
    sellerId: null,  // NOVO
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/contracts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'x-organization-id': organizationId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      // Sucesso
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Outros campos do formulário */}
      
      <div>
        <label>Vendedora</label>
        <SellerSelect
          value={formData.sellerId}
          onChange={(sellerId) => setFormData({ ...formData, sellerId })}
          organizationId={organizationId}
        />
      </div>
      
      <button type="submit">Criar Contrato</button>
    </form>
  );
}
```

---

## Notas Importantes

1. **Soft Delete**: A exclusão de vendedoras é um soft delete (não remove fisicamente do banco)
2. **Validação de Dependências**: Não é possível deletar vendedora que possui contratos
3. **Associação Opcional**: A associação de vendedora aos contratos é opcional
4. **Remoção de Associação**: Para remover a vendedora de um contrato, envie `sellerId: null` no update
5. **Permissões**: Todos os endpoints requerem autenticação e permissões adequadas

---

## Checklist de Implementação Frontend

- [ ] Criar interface/tipo para Seller
- [ ] Implementar serviço/API client para vendedoras
- [ ] Criar componente de listagem de vendedoras
- [ ] Criar formulário de criação/edição de vendedora
- [ ] Adicionar campo de seleção de vendedora no formulário de contrato
- [ ] Atualizar interface de contrato para incluir seller
- [ ] Exibir vendedora na listagem de contratos
- [ ] Exibir vendedora no detalhe do contrato
- [ ] Implementar validações de formulário
- [ ] Tratar erros e exibir mensagens apropriadas
- [ ] Implementar permissões (verificar antes de exibir ações)

---

**Última atualização**: 18/12/2024

