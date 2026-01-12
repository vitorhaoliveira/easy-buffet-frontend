# 📋 ESPECIFICAÇÃO TÉCNICA - FEATURE DE ORÇAMENTOS (BACKEND)

## 1. Visão Geral da Feature

Sistema completo de orçamentos com 5 funcionalidades principais:
1. ✅ **Criar Orçamento** - Formulário interno para o buffet
2. ✅ **Link de Proposta Pública** - URL única compartilhável via email (Resend)
3. ✅ **Aceite Digital** - Aceitação com termos e dados do cliente
4. ✅ **Contrato Automático** - Template fixo gerado em PDF
5. ✅ **Dashboard de Status** - Rastreamento do ciclo de vida

---

## 2. Estrutura de Banco de Dados

### 2.1 Tabela: `quotes`

```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados principais
  organizationId UUID NOT NULL REFERENCES organizations(id),
  clientId UUID NOT NULL REFERENCES clients(id),
  eventId UUID REFERENCES events(id),
  packageId UUID NOT NULL REFERENCES packages(id),
  sellerId UUID REFERENCES sellers(id),
  
  -- Valores
  totalAmount DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  
  -- Status e datas
  status VARCHAR(20) NOT NULL DEFAULT 'Rascunho',
    -- Valores: 'Rascunho', 'Enviado', 'Visualizado', 'Aceito', 'Rejeitado', 'Expirado'
  validUntilDate TIMESTAMP NOT NULL,
  sentAt TIMESTAMP,
  viewedAt TIMESTAMP,
  expiresAt TIMESTAMP,
  
  -- Link público
  publicLinkToken VARCHAR(255) UNIQUE,
  publicLinkTokenExpiresAt TIMESTAMP,
  
  -- Timestamps
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP,
  
  -- Auditoria
  createdBy UUID REFERENCES users(id),
  
  CONSTRAINT check_valid_status CHECK (status IN ('Rascunho', 'Enviado', 'Visualizado', 'Aceito', 'Rejeitado', 'Expirado')),
  CONSTRAINT check_valid_until_date CHECK (validUntilDate > createdAt),
  INDEX idx_organization_client (organizationId, clientId),
  INDEX idx_public_token (publicLinkToken),
  INDEX idx_status (status)
);
```

### 2.2 Tabela: `quote_items`

```sql
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  quoteId UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Item details
  description VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unitPrice DECIMAL(12, 2) NOT NULL,
  totalPrice DECIMAL(12, 2) NOT NULL,
  
  -- Timestamps
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_quantity CHECK (quantity > 0),
  CONSTRAINT check_prices CHECK (unitPrice > 0 AND totalPrice > 0),
  INDEX idx_quote_items (quoteId)
);
```

### 2.3 Tabela: `quote_acceptances`

```sql
CREATE TABLE quote_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  quoteId UUID NOT NULL UNIQUE REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Dados do aceite
  clientName VARCHAR(255) NOT NULL,
  clientEmail VARCHAR(255),
  clientPhone VARCHAR(20),
  cpf VARCHAR(14), -- CPF do aceitante
  
  -- Termos
  termsAccepted BOOLEAN NOT NULL DEFAULT false,
  termsAcceptedAt TIMESTAMP NOT NULL,
  
  -- IP and tracking
  ipAddress VARCHAR(45), -- Suporta IPv4 e IPv6
  userAgent TEXT,
  
  -- Timestamps
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Auditoria
  acceptedBy UUID REFERENCES users(id),
  
  INDEX idx_quote_acceptance (quoteId),
  INDEX idx_client_email (clientEmail)
);
```

### 2.4 Tabela: `quote_contracts`

```sql
CREATE TABLE quote_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  quoteId UUID NOT NULL UNIQUE REFERENCES quotes(id) ON DELETE CASCADE,
  contractId UUID UNIQUE REFERENCES contracts(id),
  
  -- Template fixo
  contractTemplateName VARCHAR(255) NOT NULL DEFAULT 'Template Padrão EasyBuffet',
  
  -- HTML salvo (para auditoria/backup)
  contractHtmlContent TEXT,
  
  -- Caminho do PDF gerado
  contractPdfPath VARCHAR(255),
  
  -- Status de geração
  generatedAt TIMESTAMP,
  
  -- Timestamps
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_quote_contract (quoteId),
  INDEX idx_contract_id (contractId)
);
```

---

## 3. DTOs e Tipos

### 3.1 Request DTOs

```typescript
// CREATE QUOTE
export interface CreateQuoteDto {
  clientId: string;                    // UUID obrigatório
  eventId?: string;                    // UUID opcional
  packageId: string;                   // UUID obrigatório
  sellerId?: string;                   // UUID opcional
  
  totalAmount: number;                 // Decimal com 2 casas
  validUntilDate: string;              // ISO 8601: YYYY-MM-DDTHH:mm:ss
  notes?: string;                      // Observações
  
  items: CreateQuoteItemDto[];         // Mínimo 1 item
}

export interface CreateQuoteItemDto {
  description: string;                 // Obrigatório, max 255 chars
  quantity: number;                    // Min: 1
  unitPrice: number;                   // Decimal com 2 casas
  totalPrice: number;                  // quantity * unitPrice
}

// UPDATE QUOTE (Rascunho apenas)
export interface UpdateQuoteDto {
  clientId?: string;
  eventId?: string;
  packageId?: string;
  sellerId?: string;
  totalAmount?: number;
  validUntilDate?: string;
  notes?: string;
  items?: CreateQuoteItemDto[];        // Substitui todos items
}

// SEND QUOTE (Status: Rascunho → Enviado)
export interface SendQuoteDto {
  clientEmail: string;                 // Email para enviar link
  clientName?: string;                 // Nome (para email personalizado)
  customMessage?: string;              // Mensagem adicional
}

// ACCEPT QUOTE (Status: Enviado/Visualizado → Aceito)
export interface AcceptQuoteDto {
  clientName: string;                  // Obrigatório
  clientEmail?: string;
  clientPhone?: string;
  cpf?: string;                        // Opcional: CPF do aceitante
  termsAccepted: boolean;              // Deve ser true
}

// GENERATE CONTRACT FROM QUOTE
export interface GenerateContractDto {
  generatePdf?: boolean;               // Default: true
  downloadImmediately?: boolean;       // Default: false
}

// REJECT QUOTE
export interface RejectQuoteDto {
  reason?: string;                     // Motivo da rejeição
}
```

### 3.2 Response DTOs

```typescript
// QUOTE RESPONSE
export interface QuoteResponseDto {
  id: string;
  organizationId: string;
  
  // References
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  event?: {
    id: string;
    name: string;
    eventDate: string;
    guestCount: number;
  };
  package: {
    id: string;
    name: string;
    type: string;
  };
  seller?: {
    id: string;
    name: string;
  };
  
  // Financial
  totalAmount: number;
  items: QuoteItemResponseDto[];
  notes?: string;
  
  // Status
  status: 'Rascunho' | 'Enviado' | 'Visualizado' | 'Aceito' | 'Rejeitado' | 'Expirado';
  
  // Dates
  validUntilDate: string;              // ISO 8601
  sentAt?: string;
  viewedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Public link (apenas para owner/admin)
  publicLinkUrl?: string;              // URL completa: https://app.com/proposal/TOKEN
  publicLinkToken?: string;
  publicLinkTokenExpiresAt?: string;
}

export interface QuoteItemResponseDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ACCEPTANCE RESPONSE
export interface QuoteAcceptanceResponseDto {
  id: string;
  quoteId: string;
  clientName: string;
  clientEmail?: string;
  cpf?: string;
  termsAccepted: true;
  termsAcceptedAt: string;             // ISO 8601
  createdAt: string;
}

// CONTRACT GENERATION RESPONSE
export interface ContractGenerationResponseDto {
  id: string;
  quoteId: string;
  contractId?: string;
  contractTemplateName: string;
  contractPdfPath?: string;
  generatedAt: string;
  htmlPreview?: string;                // Opcional: HTML do contrato para preview
}

// LIST QUOTES RESPONSE (paginado)
export interface ListQuotesResponseDto {
  data: QuoteResponseDto[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

---

## 4. Endpoints API

### 4.1 CRUD Básico

```
POST   /quotes                    - Criar novo orçamento
GET    /quotes                    - Listar orçamentos (paginado)
GET    /quotes/:id                - Obter detalhes
PUT    /quotes/:id                - Atualizar (Rascunho apenas)
DELETE /quotes/:id                - Deletar (Rascunho apenas)
```

### 4.2 Ações de Status

```
PATCH  /quotes/:id/send           - Enviar orçamento + gerar link público
PATCH  /quotes/:id/accept         - Aceitar orçamento (pública + privada)
PATCH  /quotes/:id/reject         - Rejeitar orçamento
```

### 4.3 Link Público

```
GET    /quotes/public/:token      - Visualizar orçamento via link público
GET    /quotes/public/:token/pdf  - Download PDF do orçamento (público)
```

### 4.4 Contrato

```
POST   /quotes/:id/generate-contract    - Gerar contrato a partir do orçamento
GET    /quotes/:id/contract              - Obter dados do contrato gerado
GET    /quotes/:id/contract/pdf          - Download PDF do contrato
```

---

## 5. Implementação Detalhada dos Endpoints

### 5.1 Criar Orçamento - `POST /quotes`

**Request:**
```json
{
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "660e8400-e29b-41d4-a716-446655440000",
  "packageId": "770e8400-e29b-41d4-a716-446655440000",
  "sellerId": "880e8400-e29b-41d4-a716-446655440000",
  "totalAmount": 5000.00,
  "validUntilDate": "2026-02-12T23:59:59Z",
  "notes": "Desconto de 10% aplicado",
  "items": [
    {
      "description": "Buffet completo - 100 pessoas",
      "quantity": 1,
      "unitPrice": 3500.00,
      "totalPrice": 3500.00
    },
    {
      "description": "Decoração",
      "quantity": 1,
      "unitPrice": 1500.00,
      "totalPrice": 1500.00
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Orçamento criado com sucesso",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "status": "Rascunho",
    "totalAmount": 5000.00,
    "validUntilDate": "2026-02-12T23:59:59Z",
    "createdAt": "2026-01-12T10:30:00Z",
    "items": [...]
  },
  "errors": null
}
```

**Validações:**
- ✅ clientId deve existir e pertencer à organização
- ✅ packageId é obrigatório
- ✅ validUntilDate deve ser > data atual
- ✅ items array deve ter pelo menos 1 item
- ✅ totalAmount deve ser > 0
- ✅ Soma dos item.totalPrice deve = totalAmount

---

### 5.2 Enviar Orçamento - `PATCH /quotes/:id/send`

**Request:**
```json
{
  "clientEmail": "cliente@example.com",
  "clientName": "João Silva",
  "customMessage": "Orçamento especial para seu evento!"
}
```

**Actions:**
1. ✅ Validar quote existe e status = 'Rascunho'
2. ✅ Gerar token público (UUID com expiração 7 dias em DB - Opção B)
3. ✅ Salvar token em `quotes.publicLinkToken` e `quotes.publicLinkTokenExpiresAt`
4. ✅ Atualizar status → 'Enviado' e `sentAt` = now()
5. ✅ Enviar email via **Resend**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orçamento enviado com sucesso",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "status": "Enviado",
    "sentAt": "2026-01-12T10:35:00Z",
    "publicLinkUrl": "https://app.easybuffet.com/proposal/abc123xyz789",
    "publicLinkTokenExpiresAt": "2026-01-19T10:35:00Z"
  },
  "errors": null
}
```

**Email via Resend:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const result = await resend.emails.send({
  from: 'noreply@easybuffet.com',
  to: clientEmail,
  subject: `Seu orçamento de ${buffetName} está pronto!`,
  html: `
    <h1>Olá ${clientName}!</h1>
    <p>Seu orçamento foi preparado com sucesso.</p>
    <p><strong>Resumo do Evento:</strong></p>
    <ul>
      <li>Cliente: ${clientName}</li>
      <li>Evento: ${eventName}</li>
      <li>Data: ${eventDate}</li>
      <li>Pessoas: ${guestCount}</li>
      <li><strong>Valor Total: R$ ${totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
    </ul>
    <p><a href="${publicLinkUrl}" style="background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">Visualizar Orçamento</a></p>
    <p>Este link expira em 7 dias: ${expiresAt}</p>
  `
});

if (result.error) {
  logger.error('Resend email error:', result.error);
  throw new HttpException('Erro ao enviar email', HttpStatus.INTERNAL_SERVER_ERROR);
}
```

---

### 5.3 Visualizar Orçamento Público - `GET /quotes/public/:token`

**Autenticação:** Pública (sem token JWT necessário)

**Validações:**
1. ✅ Token deve existir em `quotes.publicLinkToken`
2. ✅ Token não deve estar expirado (`publicLinkTokenExpiresAt > now()`)
3. ✅ Quote status não deve ser 'Expirado'

**Actions:**
1. ✅ Se viewedAt é null, atualizar status → 'Visualizado' + `viewedAt` = now()
2. ✅ Retornar dados públicos (sem campos sensíveis como seller commission)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orçamento obtido com sucesso",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "buffetName": "Easy Buffet Premium",
    "status": "Visualizado",
    "event": {
      "name": "Casamento - João e Maria",
      "eventDate": "2026-03-15",
      "guestCount": 120
    },
    "totalAmount": 5000.00,
    "items": [
      {
        "description": "Buffet completo - 100 pessoas",
        "quantity": 1,
        "unitPrice": 3500.00,
        "totalPrice": 3500.00
      }
    ],
    "validUntilDate": "2026-02-12T23:59:59Z",
    "publicLinkTokenExpiresAt": "2026-01-19T10:35:00Z"
  },
  "errors": null
}
```

---

### 5.4 Aceitar Orçamento - `PATCH /quotes/public/:token/accept` (Público)

**Autenticação:** Pública, mas validar token

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

**Actions:**
1. ✅ Validar token (mesmo que visualizar)
2. ✅ Validar termsAccepted = true
3. ✅ Validar clientName não vazio
4. ✅ Capturar IP do cliente (req.ip ou x-forwarded-for header)
5. ✅ Criar registro em `quote_acceptances` com dados
6. ✅ Atualizar `quotes.status` → 'Aceito'
7. ✅ Disparar webhook/evento interno para gerar contrato automaticamente

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orçamento aceito com sucesso! Contrato está sendo gerado.",
  "data": {
    "quoteId": "990e8400-e29b-41d4-a716-446655440000",
    "acceptanceId": "aa0e8400-e29b-41d4-a716-446655440000",
    "status": "Aceito",
    "acceptedAt": "2026-01-12T11:00:00Z",
    "clientName": "João Silva"
  },
  "errors": null
}
```

**Email de confirmação ao cliente:**
```
From: noreply@easybuffet.com
To: clientEmail
Subject: Sua proposta foi aceita! ✅

Olá João,

Sua proposta foi aceita com sucesso!

Dados do aceite:
- Nome: João Silva
- Data/Hora: 2026-01-12 às 11:00
- IP: 192.168.1.100

Seu contrato está sendo gerado e será enviado em breve.

Obrigado!
Easy Buffet
```

---

### 5.5 Gerar Contrato Automático - `POST /quotes/:id/generate-contract`

**Autenticação:** Privada (JWT required) OU automático via webhook após aceite

**Request (opcional):**
```json
{
  "generatePdf": true,
  "downloadImmediately": false
}
```

**Template Fixo (HTML):**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; }
    .title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    .signature-block { margin-top: 40px; display: flex; justify-content: space-between; }
    .signature-line { text-align: center; width: 200px; border-top: 1px solid #000; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS - BUFFET</h1>
    <p>Contrato nº: {{quoteId}}</p>
    <p>Data: {{createdDate}}</p>
  </div>

  <div class="section">
    <div class="section-title">1. PARTES CONTRATANTES</div>
    <p><strong>Prestador de Serviços (Buffet):</strong> {{buffetName}}</p>
    <p><strong>Cliente:</strong> {{clientName}}</p>
  </div>

  <div class="section">
    <div class="section-title">2. OBJETO DO CONTRATO</div>
    <p>Prestação de serviços de buffet conforme detalhamento abaixo:</p>
    <table>
      <tr>
        <th>Descrição</th>
        <th>Quantidade</th>
        <th>Valor Unitário</th>
        <th>Valor Total</th>
      </tr>
      {{#items}}
      <tr>
        <td>{{description}}</td>
        <td>{{quantity}}</td>
        <td>R$ {{unitPrice}}</td>
        <td>R$ {{totalPrice}}</td>
      </tr>
      {{/items}}
      <tr style="background-color: #f4f4f4; font-weight: bold;">
        <td colspan="3">VALOR TOTAL:</td>
        <td>R$ {{totalAmount}}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">3. DADOS DO EVENTO</div>
    <p><strong>Nome do Evento:</strong> {{eventName}}</p>
    <p><strong>Data do Evento:</strong> {{eventDate}}</p>
    <p><strong>Número de Convidados:</strong> {{guestCount}}</p>
    <p><strong>Local:</strong> {{eventLocation}}</p>
  </div>

  <div class="section">
    <div class="section-title">4. VALOR E FORMAS DE PAGAMENTO</div>
    <p><strong>Valor Total:</strong> R$ {{totalAmount}}</p>
    <p><strong>Validade da Proposta:</strong> {{validUntilDate}}</p>
    <p>Condições de pagamento conforme acordado entre as partes.</p>
  </div>

  <div class="section">
    <div class="section-title">5. CANCELAMENTO E REEMBOLSO</div>
    <p>Cancelamentos realizados com até 30 dias de antecedência ao evento receberão reembolso de 80% do valor pago. Cancelamentos com menos de 30 dias não receberão reembolso.</p>
  </div>

  <div class="section">
    <div class="section-title">6. RESPONSABILIDADES</div>
    <p>O prestador de serviços é responsável pela qualidade dos alimentos e conformidade com normas de higiene e segurança alimentar.</p>
  </div>

  <div class="section">
    <div class="section-title">7. ASSINATURAS</div>
    <div class="signature-block">
      <div>
        <div class="signature-line"></div>
        <p>{{buffetName}}<br>Prestador de Serviços</p>
      </div>
      <div>
        <div class="signature-line"></div>
        <p>{{clientName}}<br>Cliente</p>
      </div>
    </div>
  </div>

  <p style="text-align: center; font-size: 12px; color: #666; margin-top: 40px;">
    Este contrato foi gerado automaticamente pelo Easy Buffet em {{generatedAt}}
  </p>
</body>
</html>
```

**Actions:**
1. ✅ Validar quote existe e status = 'Aceito'
2. ✅ Substituir placeholders {{}} com dados reais (Handlebars)
3. ✅ Se generatePdf = true, converter HTML → PDF (html2pdf)
4. ✅ Salvar HTML em `quote_contracts.contractHtmlContent`
5. ✅ Salvar caminho PDF em `quote_contracts.contractPdfPath`
6. ✅ Settar `quote_contracts.generatedAt` = now()

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contrato gerado com sucesso",
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440000",
    "quoteId": "990e8400-e29b-41d4-a716-446655440000",
    "contractTemplateName": "Template Padrão EasyBuffet",
    "contractPdfPath": "/contracts/2026-01/quote-990e8400.pdf",
    "generatedAt": "2026-01-12T11:05:00Z",
    "htmlPreview": "<!DOCTYPE html>..."
  },
  "errors": null
}
```

**Conversão HTML → PDF (html2pdf no servidor):**
```typescript
import * as html2pdf from 'html2pdf.js';

async generateContractPdf(htmlContent: string, filename: string): Promise<Buffer> {
  const opt = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  };

  return new Promise((resolve, reject) => {
    html2pdf()
      .set(opt)
      .from.html(htmlContent)
      .toPdf()
      .output('arraybuffer')
      .then((pdf: Buffer) => resolve(pdf))
      .catch((error) => reject(error));
  });
}
```

---

### 5.6 Listar Orçamentos com Filtros - `GET /quotes?status=Aceito&page=1&limit=20`

**Query Parameters:**
```
status: Rascunho|Enviado|Visualizado|Aceito|Rejeitado|Expirado
clientId: UUID
search: string (busca em cliente name ou quote id)
page: number (default: 1)
limit: number (default: 20, max: 100)
sortBy: createdAt|status|totalAmount (default: createdAt)
sortOrder: asc|desc (default: desc)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orçamentos obtidos com sucesso",
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "status": "Aceito",
      "client": { "id": "...", "name": "João Silva" },
      "totalAmount": 5000.00,
      "event": { "name": "Casamento", "eventDate": "2026-03-15" },
      "createdAt": "2026-01-12T10:30:00Z",
      "sentAt": "2026-01-12T10:35:00Z",
      "viewedAt": "2026-01-12T10:40:00Z",
      "validUntilDate": "2026-02-12T23:59:59Z"
    }
  ],
  "errors": null,
  "pagination": {
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

---

### 5.7 Rejeitar Orçamento - `PATCH /quotes/:id/reject`

**Request (Público via token):**
```json
{
  "reason": "Orçamento fora do nosso planejamento"
}
```

**Actions:**
1. ✅ Validar quote status ≠ 'Expirado' ou 'Aceito'
2. ✅ Atualizar status → 'Rejeitado'
3. ✅ Salvar reason
4. ✅ Email ao buffet notificando rejeição

---

## 6. Segurança e Validações

### 6.1 Validações Frontend → Backend

```typescript
export class CreateQuoteDtoValidator {
  @IsNotEmpty() @IsUUID() clientId: string;
  @IsNotEmpty() @IsUUID() packageId: string;
  @IsNotEmpty() @IsPositive() totalAmount: number;
  @IsNotEmpty() @IsISO8601() validUntilDate: string;
  
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items: CreateQuoteItemDto[];
}
```

### 6.2 Controle de Acesso

```typescript
@UseGuards(JwtAuthGuard)
@Patch(':id/send')
sendQuote(@Param('id') id: string) { ... }

// Público (sem guard)
@Get('public/:token')
getPublicQuote(@Param('token') token: string) { ... }

// Verificar posse da quote
@UseGuards(JwtAuthGuard, QuoteOwnershipGuard)
@Put(':id')
updateQuote(@Param('id') id: string) { ... }
```

### 6.3 Rate Limiting

```typescript
@UseInterceptors(new RateLimitInterceptor({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip + ':' + req.params.token
}))
@Get('public/:token')
getPublicQuote(@Param('token') token: string) { ... }
```

### 6.4 Sanitização de Dados

```typescript
getPublicQuoteResponse(quote: Quote) {
  return {
    id: quote.id,
    buffetName: quote.organization.name,
    totalAmount: quote.totalAmount,
    items: quote.items,
    // NÃO incluir: sellerId, commission, createdBy, organizationId
  };
}
```

---

## 7. Integração com Resend (Email)

### 7.1 Configuração

```typescript
// .env
RESEND_API_KEY=re_xxxxxxxxxxxxx
APP_DOMAIN=https://app.easybuffet.com
SENDER_EMAIL=noreply@easybuffet.com
```

### 7.2 Email Service

```typescript
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  
  constructor(private configService: ConfigService) {
    this.resend = new Resend(configService.get('RESEND_API_KEY'));
  }

  async sendQuoteProposal(email: string, quote: Quote) {
    const publicLink = `${this.configService.get('APP_DOMAIN')}/proposal/${quote.publicLinkToken}`;
    
    return this.resend.emails.send({
      from: this.configService.get('SENDER_EMAIL'),
      to: email,
      subject: `Seu orçamento de ${quote.organization.name} está pronto!`,
      html: this.buildQuoteEmail(quote, publicLink)
    });
  }

  async sendAcceptanceConfirmation(email: string, quote: Quote, acceptance: QuoteAcceptance) {
    return this.resend.emails.send({
      from: this.configService.get('SENDER_EMAIL'),
      to: email,
      subject: `Sua proposta foi aceita! ✅`,
      html: this.buildAcceptanceEmail(quote, acceptance)
    });
  }

  private buildQuoteEmail(quote: Quote, publicLink: string): string {
    return `
      <h1>Olá ${quote.client.name}!</h1>
      <p>Seu orçamento foi preparado com sucesso.</p>
      <p><strong>Resumo:</strong></p>
      <ul>
        <li>Evento: ${quote.event?.name || 'Não especificado'}</li>
        <li>Data: ${quote.event?.eventDate || 'A definir'}</li>
        <li><strong>Valor: R$ ${quote.totalAmount.toFixed(2)}</strong></li>
      </ul>
      <a href="${publicLink}" style="background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">Visualizar Orçamento</a>
      <p><small>Link válido até: ${quote.publicLinkTokenExpiresAt}</small></p>
    `;
  }
}
```

---

## 8. Fluxo Completo de Estados

```
┌─────────────────────────────────────────────────────────────────┐
│                      CICLO DE VIDA DO ORÇAMENTO                  │
└─────────────────────────────────────────────────────────────────┘

1️⃣ RASCUNHO (Draft)
   ├─ Criado via formulário interno
   ├─ Pode ser editado/deletado
   ├─ Sem link público ainda
   └─ Ação: "Enviar"

2️⃣ ENVIADO (Sent)
   ├─ Link público gerado + email enviado
   ├─ Cliente recebe link em email
   ├─ Status não pode voltar a Rascunho
   └─ Ação: Aguardar visualização

3️⃣ VISUALIZADO (Viewed)
   ├─ Cliente acessou link público (automático)
   ├─ Timestamp registrado
   └─ Ação: Aceitar ou Rejeitar

4️⃣ ACEITO (Accepted)
   ├─ Cliente aceitou proposta digitalmente
   ├─ Termos assinados eletronicamente
   ├─ Dados de aceite capturados (IP, data, hora)
   ├─ Contrato gerado automaticamente
   └─ Status final (não muda mais)

5️⃣ REJEITADO (Rejected)
   ├─ Cliente recusou proposta
   └─ Status final (não muda mais)

6️⃣ EXPIRADO (Expired)
   ├─ Link público expirou (7 dias)
   ├─ Necessário enviar novo orçamento
   └─ Status final (sem ações)

┌─────────────────────────────────────────────────────────────────┐
│                     FLUXO DE GERAÇÃO CONTRATO                    │
└─────────────────────────────────────────────────────────────────┘

Quote Aceito → Webhook/Event
              ↓
       Gerar Template HTML
              ↓
       Preencher com dados da Quote
              ↓
       Converter para PDF (html2pdf)
              ↓
       Salvar em quote_contracts
              ↓
       Email ao cliente com contrato anexado
```

---

## 9. Campos Importantes para Auditoria

```typescript
interface QuoteAuditLog {
  id: UUID;
  quoteId: UUID;
  action: 'CREATED' | 'UPDATED' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  performedBy: UUID;
  previousStatus?: string;
  newStatus?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp;
}
```

---

## 10. Endpoints Resumo (Rápida Referência)

| Endpoint | Method | Auth | Status Transition | Integração |
|----------|--------|------|-------------------|-----------|
| `/quotes` | POST | JWT | - → Rascunho | - |
| `/quotes` | GET | JWT | - | Paginação |
| `/quotes/:id` | GET | JWT | - | - |
| `/quotes/:id` | PUT | JWT | Rascunho → Rascunho | - |
| `/quotes/:id` | DELETE | JWT | Rascunho → ∅ | - |
| `/quotes/:id/send` | PATCH | JWT | Rascunho → Enviado | **Resend Email** |
| `/quotes/public/:token` | GET | Public | Enviado → Visualizado | - |
| `/quotes/public/:token/accept` | PATCH | Public | Enviado/Visualizado → Aceito | Resend Email, **Contrato PDF** |
| `/quotes/:id/reject` | PATCH | Public | * → Rejeitado | Resend Email |
| `/quotes/:id/generate-contract` | POST | JWT | Aceito → (salva PDF) | **html2pdf** |
| `/quotes/:id/contract/pdf` | GET | JWT | - | PDF Download |

---

## 11. Dependências Recomendadas

```json
{
  "dependencies": {
    "resend": "^3.0.0",
    "html2pdf.js": "^0.10.1",
    "handlebars": "^4.7.0",
    "uuid": "^9.0.0"
  }
}
```

---

## 12. Considerações Finais

✅ **Fluxo claro e documentado** - Rascunho → Enviado → Visualizado → Aceito  
✅ **Segurança** - Tokens públicos com expiração, captura de IP  
✅ **Email integrado** - Resend para notificações  
✅ **Contrato automático** - Template fixo em PDF via html2pdf  
✅ **Status tracking** - 5 estados + auditoria  
✅ **Responsivo** - Rota pública para clientes acessarem via mobile

---

**Este documento fornece especificações técnicas completas para implementação backend.**
