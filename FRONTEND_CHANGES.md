# Mudanças na API - Desacoplamento de Comissão de Vendedoras

## Resumo das Alterações

A comissão de vendedoras foi desacoplada do pagamento do contrato. Agora a comissão é **fixada ao valor inicial do contrato** e nunca mais é alterada, independentemente de:
- Mudanças no valor total do contrato (`totalAmount`)
- Atualizações na porcentagem de comissão (`commissionPercentage`)
- Pagamentos de parcelas
- Pagamentos adicionais

## Comportamento da Comissão

### Criação do Contrato
- A comissão é calculada **apenas na criação**: `commissionAmount = totalAmount * commissionPercentage / 100`
- O valor calculado é armazenado no campo `commissionAmount` do contrato
- Este valor **nunca mais será alterado**

### Atualização do Contrato
- Ao atualizar um contrato via `PUT /contracts/:id`, os campos `commissionPercentage` e `commissionAmount` **não são mais atualizados**
- Mesmo que você envie `commissionPercentage` no body da requisição, ele será ignorado
- O `commissionAmount` permanece com o valor original da criação

### Relatórios
- O relatório de parcelas (`GET /reports/installments`) **não retorna mais informações de comissão**
- A comissão está **apenas no contrato**, não nas parcelas individuais
- Para ver a comissão, consulte o contrato diretamente via `GET /contracts/:id`

## Rotas Afetadas

### 1. PUT /contracts/:id
**Endpoint:** `PUT /api/contracts/:id`

**Mudança:** O campo `commissionPercentage` não atualiza mais a comissão.

**Body (antes):**
```json
{
  "totalAmount": 10000,
  "commissionPercentage": 5
}
```
- ❌ **Antes:** Recalculava `commissionAmount = 10000 * 5 / 100 = 500`
- ✅ **Agora:** Ignora `commissionPercentage` e mantém o `commissionAmount` original

**Body (ainda funciona):**
```json
{
  "totalAmount": 10000,
  "notes": "Atualização de valor"
}
```
- ✅ Atualiza apenas `totalAmount` e `installmentAmount`
- ✅ Mantém `commissionAmount` inalterado

### 2. GET /reports/installments
**Endpoint:** `GET /api/reports/installments?month=1&year=2024&status=paid`

**Mudança:** A comissão foi **removida** do relatório de parcelas. A comissão está apenas no contrato.

**Resposta (antes):**
```json
[
  {
    "id": "...",
    "amount": 1000,
    "commissionAmount": 50,  // Calculado por parcela
    "commissionRate": 5
  }
]
```

**Resposta (agora):**
```json
[
  {
    "id": "...",
    "contractId": "...",
    "clientName": "Cliente ABC",
    "eventName": "Evento XYZ",
    "amount": 1000,
    "dueDate": "2024-01-01",
    "status": "paid",
    "paymentDate": "2024-01-01"
    // commissionAmount e commissionRate foram removidos
  }
]
```

**Para ver a comissão:**
- Consulte o contrato diretamente: `GET /api/contracts/:id`
- A comissão está no campo `commissionAmount` do contrato
- A comissão é um valor único do contrato, não distribuída entre parcelas

## Campos do Contrato

### Campos que NÃO mudam mais após criação:
- `commissionAmount` - Valor fixo calculado na criação
- `commissionPercentage` - Porcentagem original (pode ser atualizado no banco, mas não recalcula a comissão)

### Campos que ainda podem ser atualizados:
- `totalAmount` - Atualiza o valor total e recalcula `installmentAmount`
- `installmentCount` - Número de parcelas (se permitido)
- `firstDueDate` - Data da primeira parcela
- `periodicity` - Periodicidade das parcelas
- `notes` - Observações

## Impacto no Frontend

### 1. Formulário de Edição de Contrato
- **Remover ou desabilitar** o campo `commissionPercentage` no formulário de edição
- Mostrar o `commissionAmount` como **somente leitura** (valor fixo)
- Adicionar tooltip/explicação: "Comissão fixada na criação do contrato e não pode ser alterada"

### 2. Exibição de Comissão
- **A comissão não aparece mais no relatório de parcelas**
- Para exibir comissão, consulte o contrato diretamente (`GET /contracts/:id`)
- A comissão é um valor único do contrato (`commissionAmount`), não distribuída entre parcelas
- Não há mais necessidade de calcular comissão por parcela

### 3. Validações
- Não validar ou enviar `commissionPercentage` em requisições de atualização
- O backend irá ignorar este campo automaticamente

## Exemplo de Uso

### Criar Contrato
```typescript
POST /api/contracts
{
  "eventId": "uuid",
  "clientId": "uuid",
  "totalAmount": 10000,
  "installmentCount": 10,
  "firstDueDate": "2024-01-01",
  "periodicity": "Mensal",
  "commissionPercentage": 5  // ✅ Calcula commissionAmount = 500
}
```

### Atualizar Contrato (comissão não muda)
```typescript
PUT /api/contracts/:id
{
  "totalAmount": 12000,  // ✅ Atualiza totalAmount
  "commissionPercentage": 7  // ❌ Ignorado, commissionAmount continua 500
}
```

### Relatório de Parcelas
```typescript
GET /api/reports/installments?month=1&year=2024
// Retorna parcelas SEM informações de comissão
// Para ver comissão, consulte o contrato: GET /api/contracts/:id
```

## Notas Importantes

1. **Retrocompatibilidade:** Contratos criados antes desta mudança mantêm seus valores de comissão
2. **Consistência:** A comissão agora é sempre baseada no valor inicial, garantindo consistência nos relatórios
3. **Montante:** O montante do contrato (`totalAmount`) não é afetado pela comissão - ela é apenas um campo calculado/armazenado

## Testes Recomendados

1. Criar um contrato com comissão e verificar se `commissionAmount` é calculado corretamente
2. Atualizar o contrato alterando `totalAmount` e verificar que `commissionAmount` não muda
3. Verificar relatório de parcelas e confirmar que a comissão por parcela é consistente
4. Verificar que o montante total do contrato não é afetado pela comissão

