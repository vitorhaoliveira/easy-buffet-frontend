# 🔧 GUIA PARA BACKEND DEVELOPER

## Bem-vindo ao Projeto Easy Buffet - Feature de Orçamentos

Este documento é um guia rápido para o desenvolvedor de backend sobre o que foi implementado no frontend e o que o backend precisa fazer.

---

## 📦 O que o Frontend Implementou

### 1. Nova Página Pública (sem autenticação)

**URL:** `https://app.com/proposal/{token}`

O cliente recebe um email com este link e pode:

- Ver detalhes da proposta
- Baixar PDF
- Aceitar com formulário simples
- Rejeitar

### 2. Novos Endpoints Chamados

**O Frontend espera esses endpoints do Backend:**

```
# CRUD Básico
POST   /quotes                    - Criar novo orçamento
GET    /quotes                    - Listar com paginação
GET    /quotes/:id                - Detalhes de um orçamento
PUT    /quotes/:id                - Editar (apenas Rascunho)
DELETE /quotes/:id                - Deletar (apenas Rascunho)

# Ações de Status
PATCH  /quotes/:id/send           - Enviar orçamento + gerar token + email
PATCH  /quotes/:id/accept         - Aceitar (privado, com JWT)
PATCH  /quotes/:id/reject         - Rejeitar

# Link Público (sem autenticação)
GET    /quotes/public/:token      - Visualizar orçamento público
PATCH  /quotes/public/:token/accept - Aceitar via link público
PATCH  /quotes/public/:token/reject - Rejeitar via link público
GET    /quotes/public/:token/pdf  - Download PDF público

# Contrato
POST   /quotes/:id/generate-contract - Gerar contrato automático
GET    /quotes/:id/contract          - Obter dados do contrato
GET    /quotes/:id/contract/pdf      - Download PDF contrato
```

---

## 💡 O que o Backend Precisa Fazer

### 1. Estender Modelo Quote

```sql
ALTER TABLE quotes ADD COLUMN publicLinkToken VARCHAR(255) UNIQUE;
ALTER TABLE quotes ADD COLUMN publicLinkTokenExpiresAt TIMESTAMP;
ALTER TABLE quotes ADD COLUMN viewedAt TIMESTAMP;
ALTER TABLE quotes ADD CONSTRAINT check_valid_status
  CHECK (status IN ('Rascunho', 'Enviado', 'Visualizado', 'Aceito', 'Rejeitado', 'Expirado'));
```

### 2. Criar Tabela de Aceites

```sql
CREATE TABLE quote_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quoteId UUID NOT NULL UNIQUE REFERENCES quotes(id) ON DELETE CASCADE,
  clientName VARCHAR(255) NOT NULL,
  clientEmail VARCHAR(255),
  clientPhone VARCHAR(20),
  cpf VARCHAR(14),
  termsAccepted BOOLEAN NOT NULL DEFAULT false,
  termsAcceptedAt TIMESTAMP NOT NULL,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Criar Tabela de Contratos

```sql
CREATE TABLE quote_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quoteId UUID NOT NULL UNIQUE REFERENCES quotes(id) ON DELETE CASCADE,
  contractId UUID UNIQUE REFERENCES contracts(id),
  contractTemplateName VARCHAR(255) NOT NULL DEFAULT 'Template Padrão EasyBuffet',
  contractHtmlContent TEXT,
  contractPdfPath VARCHAR(255),
  generatedAt TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Implementar Endpoint PATCH /quotes/:id/send

**O que fazer:**

1. Validar que quote existe e status = 'Rascunho'
2. Gerar UUID token público
3. Salvar em `quotes.publicLinkToken`
4. Salvar expiração (7 dias) em `quotes.publicLinkTokenExpiresAt`
5. Atualizar status → 'Enviado'
6. Salvar `sentAt` = now()
7. **Enviar email com link via Resend:**

```
To: cliente@example.com
Subject: Seu orçamento de {buffetName} está pronto!
Link: https://app.easybuffet.com/proposal/{token}
```

**Request:**

```json
{
  "clientEmail": "cliente@example.com",
  "clientName": "João Silva",
  "customMessage": ""
}
```

**Response:**

```json
{
  "success": true,
  "message": "Orçamento enviado com sucesso",
  "data": {
    "id": "123...",
    "status": "Enviado",
    "sentAt": "2026-01-12T10:35:00Z",
    "publicLinkUrl": "https://app.easybuffet.com/proposal/abc123xyz",
    "publicLinkTokenExpiresAt": "2026-01-19T10:35:00Z"
  }
}
```

### 5. Implementar Endpoint GET /quotes/public/:token

**O que fazer:**

1. Buscar quote pelo token: `WHERE publicLinkToken = :token`
2. Validar token não expirou: `publicLinkTokenExpiresAt > now()`
3. Validar quote não expirou: `validUntilDate > now()`
4. **Se viewedAt é null, atualizar:**
   - `viewedAt = now()`
   - `status = 'Visualizado'` (se estava 'Enviado')
5. Retornar dados (sem campos sensíveis)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123...",
    "buffetName": "Easy Buffet",
    "status": "Visualizado",
    "totalAmount": 5000.00,
    "validUntilDate": "2026-02-12T23:59:59Z",
    "event": { ... },
    "items": [ ... ]
  }
}
```

### 6. Implementar Endpoint PATCH /quotes/public/:token/accept

**Request:**

```json
{
  "clientName": "João Silva",
  "clientEmail": "joao@example.com",
  "clientPhone": "+55 11 99999-9999",
  "cpf": "123.456.789-00",
  "termsAccepted": true
}
```

**O que fazer:**

1. Validar token (mesmo que GET)
2. Validar termsAccepted = true
3. Validar clientName não vazio
4. Capturar IP do cliente (req.ip ou x-forwarded-for)
5. Criar registro em `quote_acceptances` com todos os dados
6. Atualizar `quotes.status` → 'Aceito'
7. **Disparar webhook/evento para gerar contrato:**
   - Chamar `POST /quotes/{id}/generate-contract`
8. Enviar email de confirmação ao cliente

**Response:**

```json
{
  "success": true,
  "message": "Orçamento aceito com sucesso!",
  "data": {
    "quoteId": "123...",
    "acceptanceId": "456...",
    "status": "Aceito",
    "acceptedAt": "2026-01-12T11:00:00Z"
  }
}
```

### 7. Implementar Endpoint POST /quotes/:id/generate-contract

**O que fazer:**

1. Validar quote existe e status = 'Aceito'
2. Usar template HTML fixo (veja em BACKEND_QUOTES_SPEC.md)
3. Substituir placeholders {{}} com dados reais:
   - {{buffetName}} → organization.name
   - {{clientName}} → quote.client.name
   - {{eventName}} → quote.event.name
   - {{eventDate}} → quote.event.eventDate (formatado)
   - {{guestCount}} → quote.event.guestCount
   - {{totalAmount}} → quote.totalAmount (formatado)
   - {{items}} → Renderizar lista de items
4. **Converter HTML → PDF:**
   - Opção A: Usar html2pdf.js (Node.js)
   - Opção B: Usar Puppeteer (headless Chrome)
5. Salvar em `quote_contracts`:
   - `contractHtmlContent` = HTML
   - `contractPdfPath` = caminho do arquivo
   - `generatedAt` = now()
6. Enviar email com contrato em anexo

**Response:**

```json
{
  "success": true,
  "message": "Contrato gerado com sucesso",
  "data": {
    "id": "789...",
    "quoteId": "123...",
    "contractTemplateName": "Template Padrão EasyBuffet",
    "contractPdfPath": "/contracts/2026-01/quote-123.pdf",
    "generatedAt": "2026-01-12T11:05:00Z"
  }
}
```

---

## 📧 Integração Resend (Email)

### Configuração

```typescript
// .env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
APP_DOMAIN=https://app.easybuffet.com
SENDER_EMAIL=noreply@easybuffet.com
```

### Instalação

```bash
npm install resend
```

### Uso

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Enviar email com link de proposta
await resend.emails.send({
  from: 'noreply@easybuffet.com',
  to: clientEmail,
  subject: `Seu orçamento de ${buffetName} está pronto!`,
  html: `
    <h1>Olá ${clientName}!</h1>
    <p>Seu orçamento foi preparado com sucesso.</p>
    <p><strong>Resumo:</strong></p>
    <ul>
      <li>Valor: R$ ${totalAmount.toLocaleString('pt-BR')}</li>
      <li>Válido até: ${validUntilDate}</li>
    </ul>
    <a href="${APP_DOMAIN}/proposal/${token}">Ver Proposta</a>
    <p>Este link expira em 7 dias.</p>
  `,
})
```

---

## 🔐 Segurança

### Token Público

- Usar UUID v4 (aleatório)
- Expiração: 7 dias
- Validar em cada request
- Rate limiting na rota pública

### Aceite Digital

- Capturar IP do cliente
- Salvar User-Agent
- Timestamp de aceite
- Checkbox de termos obrigatório

### Validações

- Cliente deve ter email para enviar
- validUntilDate > agora
- Transições de status permitidas apenas nas direções corretas

---

## 📝 Exemplo de Request/Response Completo

### Criar Orçamento

```bash
POST /quotes HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json

{
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "660e8400-e29b-41d4-a716-446655440000",
  "packageId": "770e8400-e29b-41d4-a716-446655440000",
  "totalAmount": 5000.00,
  "validUntilDate": "2026-02-12T23:59:59Z",
  "items": [
    {
      "description": "Buffet completo",
      "quantity": 1,
      "unitPrice": 3500.00,
      "totalPrice": 3500.00
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "message": "Orçamento criado com sucesso",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "status": "Rascunho",
    "totalAmount": 5000.0,
    "createdAt": "2026-01-12T10:30:00Z"
  },
  "errors": null
}
```

### Enviar Orçamento

```bash
PATCH /quotes/990e8400-e29b-41d4-a716-446655440000/send HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json

{
  "clientEmail": "cliente@example.com",
  "clientName": "João Silva"
}
```

Response:

```json
{
  "success": true,
  "message": "Orçamento enviado com sucesso",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "status": "Enviado",
    "publicLinkUrl": "https://app.easybuffet.com/proposal/abc123xyz789",
    "publicLinkTokenExpiresAt": "2026-01-19T10:35:00Z"
  }
}
```

---

## ✅ Checklist de Implementação

### Tabelas

- [ ] Adicionar colunas em `quotes`
- [ ] Criar `quote_acceptances`
- [ ] Criar `quote_contracts`

### Endpoints

- [ ] `POST /quotes` - Criar (já existe?)
- [ ] `GET /quotes` - Listar (já existe?)
- [ ] `PATCH /quotes/:id/send` - NOVO
- [ ] `GET /quotes/public/:token` - NOVO
- [ ] `PATCH /quotes/public/:token/accept` - NOVO
- [ ] `POST /quotes/:id/generate-contract` - NOVO

### Email

- [ ] Instalar Resend
- [ ] Configurar API key
- [ ] Implementar envio no `/send`
- [ ] Template HTML bonito

### PDF

- [ ] Instalar html2pdf ou Puppeteer
- [ ] Template HTML de contrato
- [ ] Gerar PDF em `/generate-contract`
- [ ] Salvar em storage

### Testes

- [ ] Testar fluxo completo
- [ ] Email chega
- [ ] PDF gerado
- [ ] Status atualiza
- [ ] Token expira após 7 dias

---

## 🆘 Dúvidas Frequentes

**P: Como gero o PDF do contrato?**
R: Use html2pdf (Node.js) ou Puppeteer (mais robusto). Veja exemplos em BACKEND_QUOTES_SPEC.md.

**P: Quanto tempo o token fica válido?**
R: 7 dias. Pode alterar em env var se necessário.

**P: O IP do cliente é crítico?**
R: Não, mas é rastreado para auditoria legal. Capture via `req.ip` ou header `x-forwarded-for`.

**P: Preciso criar contrato na tabela `contracts`?**
R: Opcionalmente. Pode ser apenas em `quote_contracts` por enquanto.

**P: E se o cliente rejeitar?**
R: Status muda para 'Rejeitado'. Você pode enviar novo orçamento depois.

---

## 📞 Referências

- **Backend Specs:** `docs/BACKEND_QUOTES_SPEC.md`
- **Frontend Implementation:** `docs/FRONTEND_QUOTES_IMPLEMENTATION.md`
- **Summary:** `docs/QUOTES_SUMMARY.md`

---

**Pronto para implementar? Bora! 🚀**
