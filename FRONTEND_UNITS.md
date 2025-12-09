# Guia de Implementação - Sistema Multi-Unidade (Frontend)

## 📋 Visão Geral

O sistema agora suporta **múltiplas unidades** dentro de uma mesma organização. Isso permite que empresas com filiais/unidades diferentes possam gerenciar tudo em um único lugar, filtrando e organizando eventos, clientes e pacotes por unidade.

---

## 🔑 Campos Principais de Unidade

```typescript
interface Unit {
  id: string;                    // UUID da unidade
  organizationId: string;        // UUID da organização
  name: string;                  // Nome da unidade (obrigatório)
  code?: string;                 // Código/identificador da unidade
  color?: string;                // Cor da unidade (hexadecimal, ex: #FF5733)
  
  // Endereço
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  
  isActive: boolean;             // Se a unidade está ativa
  notes?: string;                // Observações
  
  // Auditoria
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

---

## 🔌 Endpoints da API

### Base URL: `/api/units`

#### 1. **Listar Unidades**
```http
GET /api/units?isActive=true
```

**Query Params:**
- `isActive` (opcional): `true` | `false` - filtrar por status ativo/inativo

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Unidade Centro",
      "code": "CTR",
      "city": "São Paulo",
      "state": "SP",
      "isActive": true,
      "_count": {
        "events": 15,
        "clients": 8
      }
    }
  ]
}
```

---

#### 2. **Criar Unidade**
```http
POST /api/units
```

**Body:**
```json
{
  "name": "Unidade Zona Sul",
  "code": "ZS",
  "color": "#FF5733",
  "zipCode": "04567-000",
  "street": "Rua das Flores",
  "number": "123",
  "city": "São Paulo",
  "state": "SP",
  "notes": "Nova unidade"
}
```

**Nota sobre `color`:**
- Formato: código hexadecimal com ou sem `#` (ex: `#FF5733` ou `FF5733`)
- Opcional: pode ser omitido
- Usado para identificação visual da unidade no frontend

**Resposta:**
```json
{
  "success": true,
  "message": "Unidade criada com sucesso",
  "data": {
    "id": "uuid",
    "name": "Unidade Zona Sul",
    "code": "ZS",
    "isActive": true,
    ...
  }
}
```

---

#### 3. **Buscar Unidade por ID**
```http
GET /api/units/:id
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Unidade Centro",
    "code": "CTR",
    "_count": {
      "events": 15,
      "clients": 8,
      "packages": 5,
      "contracts": 12
    },
    ...
  }
}
```

---

#### 4. **Atualizar Unidade**
```http
PUT /api/units/:id
```

**Body:** (todos os campos são opcionais)
```json
{
  "name": "Unidade Centro - Matriz",
  "color": "#3498DB",
  "isActive": false,
  "notes": "Atualização de dados"
}
```

---

#### 5. **Deletar Unidade**
```http
DELETE /api/units/:id
```

**Importante:** 
- Não é possível deletar unidades com eventos cadastrados
- Utiliza soft delete (mantém no banco com `deletedAt`)

---

## 🎯 Integração com Eventos

### Eventos agora suportam `unitId` (opcional)

#### Criar Evento com Unidade
```http
POST /api/events
```

```json
{
  "unitId": "uuid-da-unidade",  // ← NOVO CAMPO (opcional)
  "clientId": "uuid",
  "packageId": "uuid",
  "name": "Festa de Aniversário",
  "eventDate": "2025-12-15",
  "eventTime": "19:00",
  "location": "Salão de Festas",
  "guestCount": 50,
  "status": "Pendente"
}
```

#### Listar Eventos por Unidade
```http
GET /api/events?unitId=uuid-da-unidade
```

**Query Params:**
- `unitId` (opcional): filtrar eventos de uma unidade específica
- `page`, `limit`, `status`, `dateFrom`, `dateTo`, `clientId` (já existentes)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Festa de Aniversário",
      "eventDate": "2025-12-15",
      "unit": {
        "id": "uuid",
        "name": "Unidade Centro",
        "code": "CTR"
      },
      "client": { ... },
      "package": { ... }
    }
  ],
  "pagination": { ... }
}
```

---

## 🎨 Sugestões de UI/UX

### 1. **Seletor de Unidade**
Adicione um dropdown/select para escolher a unidade:

```tsx
// Exemplo React
<select value={selectedUnitId} onChange={handleUnitChange}>
  <option value="">Todas as unidades</option>
  {units.map(unit => (
    <option key={unit.id} value={unit.id}>
      {unit.name} {unit.code ? `(${unit.code})` : ''}
    </option>
  ))}
</select>
```

### 2. **Badge de Unidade com Cor**
Mostre a unidade em cards/listas de eventos com a cor personalizada:

```tsx
{event.unit && (
  <span 
    className="badge"
    style={{
      backgroundColor: event.unit.color || '#6c757d',
      color: '#fff'
    }}
  >
    {event.unit.code || event.unit.name}
  </span>
)}
```

### 2.1. **Seletor de Cor no Formulário**
Adicione um color picker ao criar/editar unidade:

```tsx
<input
  type="color"
  value={unit.color || '#6c757d'}
  onChange={(e) => setUnit({ ...unit, color: e.target.value })}
/>
```

### 3. **Filtro Global**
Adicione um filtro global no header/sidebar para filtrar todos os dados por unidade.

### 4. **Dashboard por Unidade**
Permita visualizar métricas separadas por unidade:
- Eventos por unidade
- Receita por unidade
- Clientes por unidade

---

## ✅ Checklist de Implementação

### Gestão de Unidades
- [ ] Criar tela de listagem de unidades
- [ ] Criar formulário de cadastro/edição de unidade
- [ ] Adicionar campos de endereço (opcional)
- [ ] Implementar ativação/desativação de unidade
- [ ] Mostrar contadores (eventos, clientes) em cada unidade

### Integração com Eventos
- [ ] Adicionar campo `unitId` no formulário de evento (opcional)
- [ ] Adicionar filtro por unidade na listagem de eventos
- [ ] Mostrar badge/tag da unidade nos cards de evento
- [ ] Permitir filtrar eventos por unidade no dashboard

### Integração com Clientes (futuro)
- [ ] Adicionar campo `unitId` em clientes (opcional)
- [ ] Filtrar clientes por unidade

### Integração com Pacotes (futuro)
- [ ] Adicionar campo `unitId` em pacotes (opcional)
- [ ] `null` = pacote disponível para todas as unidades
- [ ] Filtrar pacotes por unidade

---

## 🔒 Permissões

As rotas de unidades respeitam o sistema de permissões existente:
- **Listar/Visualizar**: permissão `cadastros.view`
- **Criar**: permissão `cadastros.create`
- **Editar**: permissão `cadastros.edit`
- **Deletar**: permissão `cadastros.delete`

---

## 📝 Notas Importantes

1. **Retrocompatibilidade**: O campo `unitId` é **opcional** em eventos, clientes, etc. Isso significa que:
   - Eventos sem unidade = eventos gerais da organização
   - Eventos com unidade = eventos específicos daquela unidade

2. **Validações**:
   - O `code` da unidade deve ser único dentro da mesma organização
   - Não é possível deletar unidades com eventos cadastrados
   - Unidades inativas (`isActive: false`) ainda aparecem nos relacionamentos existentes

3. **Soft Delete**: Unidades deletadas são marcadas com `deletedAt` e não aparecem nas listagens, mas mantêm os relacionamentos históricos.

4. **Organização**: Todas as unidades pertencem a uma organização. Usuários só veem unidades da organização ativa no contexto.

---

## 🚀 Exemplo de Fluxo Completo

```typescript
// 1. Carregar unidades da organização
const units = await fetch('/api/units?isActive=true');

// 2. Criar evento com unidade
const newEvent = await fetch('/api/events', {
  method: 'POST',
  body: JSON.stringify({
    unitId: 'uuid-da-unidade-centro', // Vincula à unidade
    clientId: '...',
    packageId: '...',
    name: 'Casamento João e Maria',
    // ... outros campos
  })
});

// 3. Filtrar eventos por unidade
const events = await fetch('/api/events?unitId=uuid-da-unidade-centro');

// 4. Buscar detalhes do evento (inclui unidade)
const event = await fetch('/api/events/uuid-do-evento');
// event.unit = { id, name, code }
```

---

## 🎓 Resumo Executivo

**O que mudou:**
- ✅ Nova entidade `Unit` (Unidade)
- ✅ Eventos podem ser vinculados a uma unidade (`unitId` opcional)
- ✅ Filtro de eventos por unidade
- ✅ CRUD completo de unidades

**O que NÃO mudou:**
- ✅ Sistema de organizações (cada organização pode ter N unidades)
- ✅ Sistema de permissões
- ✅ Eventos sem unidade continuam funcionando normalmente

**Próximos passos sugeridos:**
1. Implementar tela de gestão de unidades
2. Adicionar seletor de unidade no formulário de eventos
3. Adicionar filtro por unidade na listagem de eventos
4. Considerar adicionar dashboards por unidade

