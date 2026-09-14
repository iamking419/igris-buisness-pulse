# IGRIS Business Pulse — Frontend ↔ FastAPI Contract

Concise interface the frontend expects. Backend implements these; frontend does not invent extra behaviour.

Base path: `{API_CONFIG.BASE_URL}` (default local: `http://localhost:8000/api/v1`)

All JSON request/response bodies use UTF-8. Auth for admin routes: `Authorization: Bearer <token>` (or cookie session if the backend prefers).

---

## Survey

### `POST /survey/responses`

**Request body**

```json
{
  "business_type": "string | null",
  "customer_channels": ["string"],
  "biggest_challenge": "string | null",
  "time_consuming_task": "string | null",
  "order_management": "string | null",
  "payment_tracking": "string | null",
  "technology_used": ["string"],
  "digital_barriers": ["string"],
  "desired_improvement": "string | null",
  "contact_permission": true,
  "contact": "string | null"
}
```

Notes:
- Frontend currently collects single-choice answers; the client wraps scalars into arrays where the contract uses arrays.
- `contact` is only sent when `contact_permission` is true.

**Success response** (200 or 201)

```json
{
  "id": "BP-2026-000041",
  "created_at": "2026-09-10T18:00:00.000Z",
  "business_type": "...",
  "customer_channels": ["..."],
  "biggest_challenge": "...",
  "time_consuming_task": "...",
  "order_management": "...",
  "payment_tracking": "...",
  "technology_used": ["..."],
  "digital_barriers": ["..."],
  "desired_improvement": "...",
  "contact_permission": true,
  "contact": "..."
}
```

Frontend maps `id` / `created_at` / snake_case fields back to its internal camelCase record for thank-you and admin.

---

## Admin auth

### `POST /admin/login`

**Request**

```json
{ "password": "string" }
```

**Success response**

```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

(Alternative accepted field names: `token`, `accessToken`. Cookie-only sessions are also fine; frontend marks a local session flag.)

### `GET /admin/me`

Returns the current admin identity (any reasonable shape). Used to confirm the session.

### `POST /admin/logout`

Invalidates the server session/token. No body required.

---

## Admin responses

### `GET /admin/responses`

**Query parameters** (all optional)

| Param            | Type    | Description                          |
|------------------|---------|--------------------------------------|
| `business_type`  | string  | Filter by business type              |
| `challenge`      | string  | Filter by biggest challenge          |
| `contact_opt_in` | boolean | `true` / `false`                     |
| `search`         | string  | Free-text search across response     |
| `limit`          | integer | Page size                            |
| `offset`         | integer | Offset for pagination                |

**Success response**

Either a bare array of response objects (same shape as survey create response) or:

```json
{
  "items": [ /* response objects */ ]
}
```

(`responses` or `data` keys are also accepted.)

### `GET /admin/responses/{id}`

Single response object (same shape).

---

## Insights

### `GET /admin/insights`

**Success response** (example shape the frontend maps)

```json
{
  "total": 42,
  "responses_today": 3,
  "businesses_represented": 12,
  "contact_opt_ins": 18,
  "top_challenges": [
    { "label": "Managing orders", "count": 10, "pct": 24 }
  ],
  "top_channels": [
    { "label": "WhatsApp", "count": 15, "pct": 36 }
  ],
  "top_time_consuming": [ /* same shape */ ],
  "top_barriers": [ /* same shape */ ]
}
```

CamelCase variants of the keys are also accepted.

---

## Export

### `GET /admin/export`

Returns CSV text (`text/csv`) of all (or filtered) responses. Frontend triggers a browser download.

---

## Error handling

- Non-2xx responses: frontend treats the request as failed and falls back to localStorage (survey submit / admin reads) where applicable.
- Network failures / offline / CORS / backend down: same fallback. No stack traces or credentials are shown to end users.
- Admin UI continues to work against localStorage when the API is unreachable.

---

## CORS

Backend must allow the frontend origin. Frontend does not use `mode: "no-cors"`.
