# CRM Backend MVP Specification

## Goal
Define the minimum backend contract required by the Angular CRM MVP with maximum reuse of current flows.

## Core Entities

### `crm_leads`
- `id` (uuid, pk)
- `organization_id` (uuid, not null, indexed)
- `client_id` (uuid, nullable, fk `clients.id`)
- `owner_id` (uuid, nullable, fk `users.id`)
- `current_stage_id` (uuid, nullable, fk `crm_pipeline_stages.id`)
- `name` (varchar 150, not null)
- `phone` (varchar 30, nullable)
- `whatsapp` (varchar 30, nullable)
- `email` (varchar 150, nullable)
- `origin` (varchar 50, not null)
- `status` (enum: `ativo`, `perdido`, `convertido`, default `ativo`)
- `notes` (text, nullable)
- `created_at` (timestamp, not null)
- `updated_at` (timestamp, not null)

### `crm_pipeline_stages`
- `id` (uuid, pk)
- `organization_id` (uuid, not null, indexed)
- `name` (varchar 60, not null)
- `order_index` (int, not null)
- `is_default` (boolean, default false)
- `created_at` (timestamp, not null)
- `updated_at` (timestamp, not null)

### `crm_deals`
- `id` (uuid, pk)
- `organization_id` (uuid, not null, indexed)
- `lead_id` (uuid, not null, fk `crm_leads.id`)
- `stage_id` (uuid, not null, fk `crm_pipeline_stages.id`)
- `value` (decimal(12,2), nullable)
- `event_date` (date, nullable)
- `created_at` (timestamp, not null)
- `updated_at` (timestamp, not null)

### `crm_interactions`
- `id` (uuid, pk)
- `organization_id` (uuid, not null, indexed)
- `lead_id` (uuid, not null, fk `crm_leads.id`)
- `type` (enum: `ligacao`, `whatsapp`, `reuniao`, `nota`, `sistema`)
- `description` (text, not null)
- `created_by` (uuid, not null, fk `users.id`)
- `created_at` (timestamp, not null)

### `crm_follow_ups`
- `id` (uuid, pk)
- `organization_id` (uuid, not null, indexed)
- `lead_id` (uuid, not null, fk `crm_leads.id`)
- `due_date` (timestamp, not null)
- `note` (text, not null)
- `status` (enum: `pending`, `done`, default `pending`)
- `created_by` (uuid, not null, fk `users.id`)
- `created_at` (timestamp, not null)
- `updated_at` (timestamp, not null)

## Recommended Indexes
- `crm_leads (organization_id, current_stage_id, owner_id, created_at desc)`
- `crm_follow_ups (organization_id, status, due_date)`
- `crm_interactions (organization_id, lead_id, created_at desc)`
- unique stage order: `unique (organization_id, order_index)` in `crm_pipeline_stages`

## Required Endpoints

### Leads
- `GET /crm/leads?page&limit&search&status&stageId&ownerId&origin`
- `POST /crm/leads`
- `GET /crm/leads/:id`
- `PATCH /crm/leads/:id`
- `DELETE /crm/leads/:id`
- `PATCH /crm/leads/:id/stage`
- `POST /crm/leads/:id/convert`

### Pipeline
- `GET /crm/pipeline/stages`
- `PATCH /crm/pipeline/stages/reorder`

### Interactions
- `GET /crm/leads/:id/interactions`
- `POST /crm/leads/:id/interactions`

### Follow-ups
- `GET /crm/leads/:id/follow-ups`
- `POST /crm/leads/:id/follow-ups`
- `PATCH /crm/follow-ups/:id`

### Dashboard
- `GET /crm/dashboard/summary`

## Request/Response Contract

### Shared envelope
All endpoints should keep the current API shape:

```json
{
  "success": true,
  "message": "optional",
  "data": {},
  "errors": null
}
```

### `PATCH /crm/leads/:id/stage`
Request:

```json
{
  "stageId": "uuid"
}
```

Response `data`: full `crm_leads` record with `currentStage`.

### `POST /crm/leads/:id/convert`
Request:

```json
{
  "createQuoteDraft": true
}
```

Response:

```json
{
  "leadId": "uuid",
  "clientId": "uuid",
  "quoteId": "uuid-or-null",
  "contractId": "uuid-or-null"
}
```

## Business Rules
- A lead can only have one current stage at a time.
- Stage transition to `Fechado` must create or link a `client`.
- Every stage transition must create one automatic `crm_interactions` record with `type=sistema`.
- Overdue follow-up = `status='pending'` and `due_date < now()`.
- All queries must be strictly filtered by `organization_id`.
- `origin` should be validated against controlled options (`instagram`, `indicacao`, `site`, `whatsapp`, `outros`).

## Seed Data
- Default stages per organization:
  1. `Novo Lead`
  2. `Contato feito`
  3. `Proposta enviada`
  4. `Negociação`
  5. `Fechado`
  6. `Perdido`

## Integration Events
- On conversion, return enough IDs to route frontend to:
  - linked client
  - optional quote draft
- Keep conversion idempotent when lead is already `convertido`.
