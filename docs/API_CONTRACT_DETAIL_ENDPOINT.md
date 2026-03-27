# Specification: `GET /api/contracts/:contractId/detail`

Aggregated payload for the contract detail screen (standalone route and event hub **Pagamentos** tab). Replaces multiple sequential calls (`getContractById`, installments, items, additional payments, commission, sellers) with **one** round-trip.

**Audience:** backend implementers.  
**Frontend consumer:** `ContractService.getContractDetail()` → `ContractDetailComponent` (falls back to legacy multi-request load if this route returns 404).

---

## 1. Endpoint

| Item | Value |
|------|--------|
| Method | `GET` |
| Path | `/api/contracts/:contractId/detail` |
| Path param | `contractId` — UUID, required |

**Base URL:** `{API_BASE}/api` (same as existing contract routes).

---

## 2. Authentication & authorization

- **Headers:** Same as `GET /api/contracts/:id`
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json` (optional for GET)
  - Organization header(s) if the API uses them for multi-tenant scoping (e.g. `x-organization-id`), **identical** to other contract routes.
- **Permissions:** Same as viewing a contract (e.g. cadastros + view, or whatever guards `GET /contracts/:id` today).
- **404:** Contract does not exist or does not belong to the current organization.
- **403:** User not allowed to read the contract.

---

## 3. Query parameters (optional)

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `includeSellers` | string | `"true"` | When `"true"`, include `sellers` in `data`. When `"false"`, omit `sellers` or return empty array `[]` (frontend treats missing as `[]`). Use `false` if the client will load sellers elsewhere or for lighter payloads. |

Boolean values are passed as **strings** (`"true"` / `"false"`), consistent with other query flags in the project.

---

## 4. Success response

### 4.1 Envelope

Aligned with the project’s `successResponse` helper:

- `success: true`
- `message: string` (e.g. `"Contrato carregado"`)
- `data: ContractDetailPayload`

Do **not** include `errors: null` on success if the standard helper omits it.

### 4.2 `data` — `ContractDetailPayload`

The body must contain **all** information the contract detail UI needs for first paint, in **one** object.

```typescript
interface ContractDetailPayload {
  contract: Contract
  installments: Installment[]
  contractItems: ContractItem[]
  additionalPayments: AdditionalPayment[]
  commission: CommissionDetails | null
  sellers: Seller[]
  meta?: {
    generatedAt: string  // ISO 8601
  }
}
```

#### 4.2.1 `contract`

- **Same shape and semantics** as `GET /api/contracts/:contractId` today.
- Include nested **`event`**, **`client`**, **`seller`** when the single-contract endpoint already returns them.
- Do **not** rely on `contract.installments` / `contract.additionalPayments` / `contract.contractItems` for the main arrays; the UI reads the **top-level** arrays below. (You may still populate nested fields for backward compatibility.)

#### 4.2.2 `installments`

- **Same array** as `GET /api/contracts/:contractId/installments` (success body `data`).
- Ordered consistently with the existing installments list endpoint (e.g. by `installmentNumber` or `dueDate`).

#### 4.2.3 `contractItems`

- **Same array** as `GET /api/contracts/:contractId/items`.

#### 4.2.4 `additionalPayments`

- **Same array** as `GET /api/contracts/:contractId/additional-payments`.

#### 4.2.5 `commission`

- **Same object** as the commission-by-contract endpoint used today (e.g. `GET .../contracts/:contractId/commission` or equivalent).
- **`null`** when there is no commission record yet (UI handles “no commission” state).

#### 4.2.6 `sellers`

- **Same list** as `GET /api/sellers` (or the endpoint used for the commission form dropdown), scoped to the **current organization**.
- When `includeSellers=false`, return `[]` or omit; frontend normalizes to `[]`.

#### 4.2.7 `meta` (optional)

- `generatedAt`: server timestamp for debugging/cache invalidation.

---

## 5. Consistency rules

1. **Single source of truth per entity:** Values in `contract` (e.g. totals, `paidInstallments`) must be **consistent** with `installments` and `additionalPayments` as in the rest of the API (same business rules as after separate calls).
2. **Transactional view (recommended):** Build the payload in one DB transaction or equivalent so the user never sees mixed states between arrays.
3. **Idempotent:** Repeated `GET` with the same contract id returns the same structure; no side effects.

---

## 6. Error responses

Use the same error middleware / shape as other contract routes.

| HTTP | When |
|------|------|
| 404 | Contract not found or not in org |
| 403 | Forbidden |
| 401 | Unauthorized |

---

## 7. Performance & implementation notes

1. **Goal:** One DB round-trip (or one orchestrated batch), not N sequential queries in the handler if avoidable.
2. **Indexes:** Reuse indexes already used by individual contract/installment/item queries.
3. **Payload size:** Typical contract has bounded installments/items; sellers list is org-scoped—acceptable for one response.
4. **Caching:** Optional `Cache-Control` / ETag out of scope for v1 unless product requires it.

---

## 8. Example (illustrative JSON)

```json
{
  "success": true,
  "message": "Contrato carregado",
  "data": {
    "contract": {
      "id": "6c72e958-6340-4006-a504-46c96365c762",
      "eventId": "…",
      "clientId": "…",
      "sellerId": null,
      "totalAmount": 10000,
      "installmentCount": 10,
      "installmentAmount": 1000,
      "firstDueDate": "2025-04-01",
      "periodicity": "Mensal",
      "commissionPercentage": 5,
      "commissionAmount": 500,
      "status": "Assinado",
      "signedAt": "2025-03-01T12:00:00.000Z",
      "closedAt": null,
      "createdAt": "…",
      "updatedAt": "…",
      "totalPaid": "3000",
      "remainingBalance": "7000",
      "event": { "id": "…", "name": "Casamento Silva", "eventDate": "2025-06-15" },
      "client": { "id": "…", "name": "Maria Silva" },
      "seller": null
    },
    "installments": [],
    "contractItems": [],
    "additionalPayments": [],
    "commission": null,
    "sellers": [],
    "meta": {
      "generatedAt": "2025-03-27T12:00:00.000Z"
    }
  }
}
```

---

## 9. Route registration order

Register **`GET /:contractId/detail`** before **`GET /:contractId`** if the router is sensitive to path order, so `detail` is not captured as an `id`.

---

## 10. Frontend reference (Angular)

- Types: `ContractDetailPayload` in `src/app/shared/models/api.types.ts`
- Client: `ContractService.getContractDetail(contractId, { includeSellers?: boolean })`
- UI: `ContractDetailComponent` applies `data` in one shot; on failure (e.g. 404), falls back to legacy chained requests.

---

## 11. Acceptance criteria

- [ ] `GET /api/contracts/{validUuid}/detail` returns `200` with `data` matching section 4.2.
- [ ] Response matches existing individual endpoints for the same contract (manual or automated comparison).
- [ ] `includeSellers=false` reduces or clears `sellers` as specified.
- [ ] Invalid / cross-org `contractId` returns `404` or project-standard error.
- [ ] No duplicate work for the embedded event hub: one request replaces the previous ~5–6 for first load.
