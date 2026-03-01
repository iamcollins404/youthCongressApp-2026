# Youth Congress 2026 — Backend Specification

> Auto-generated from client source audit. Every endpoint, payload shape,
> and response contract the React client depends on.

---

## 1. Overview

| Item        | Value                                      |
|-------------|--------------------------------------------|
| API Base    | `http://localhost:5000/api`                |
| DB          | MongoDB (Atlas) via Mongoose               |
| Collection  | `registrations`                            |
| Model name  | `Registration`                             |
| Auth        | Session-based (admin email in sessionStorage, no JWT yet) |

---

## 2. Data Model — `Registration`

| Field                 | Type       | Required | Enum / Notes                                                             |
|-----------------------|------------|----------|--------------------------------------------------------------------------|
| `ticketId`            | String     | Yes      | Unique, auto-generated `TKT` + 4 digits                                 |
| `firstName`           | String     | Yes      |                                                                          |
| `surname`             | String     | Yes      |                                                                          |
| `email`               | String     | Yes      |                                                                          |
| `contactNumber`       | String     | Yes      |                                                                          |
| `conference`          | String     | Yes      | `cc-western`, `cc-northern`, `cc-eastern`, `cape`, `ncsa`, `other`       |
| `churchOrOrganization`| String     | No       |                                                                          |
| `churchInsured`       | String     | No       | `"true"` / `"false"`, default `"true"`                                   |
| `gender`              | String     | Yes      | `male`, `female`                                                         |
| `age`                 | Number     | No       |                                                                          |
| `delegateType`        | String     | No       | `""`, `ambassador`, `youthAdult`                                         |
| `emergencyContactName`| String     | No       |                                                                          |
| `emergencyContactNumber`| String   | No       |                                                                          |
| `package`             | String     | Yes      | `basic`, `basicPack`, `halfPack`, `fullPack`, `withPack`, `withoutPack`  |
| `hoodieSize`          | String     | Cond.    | Required when package ∈ {basicPack, halfPack, fullPack, withPack}. Values: `XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL`, `4XL` |
| `passportPhoto`       | String     | No       | URL to uploaded file                                                     |
| `paymentProof`        | String     | No       | URL to uploaded file                                                     |
| `status`              | String     | Yes      | `pending`, `approved`, `declined`. Default: `pending`                    |
| `statusComments`      | Array      | No       | `[{ status, comment, createdAt }]`                                       |
| `createdAt`           | Date/String| Auto     |                                                                          |

---

## 3. API Endpoints

### 3.1 `POST /api/uploads/file`

File upload (passport photos, payment proofs).

**Request:** `multipart/form-data`, field name `file`

**Response:**
```json
{
  "success": true,
  "file": {
    "url": "http://localhost:5000/uploads/1709312400000-photo.jpg",
    "name": "photo.jpg",
    "type": "image/jpeg",
    "size": 123456
  }
}
```

**Used by:** `register.jsx` (public registration uploads)

---

### 3.2 `POST /api/tickets/new`

Public registration — creates a new pending ticket.

**Request body:**
```json
{
  "firstName": "string",
  "surname": "string",
  "email": "string",
  "contactNumber": "string",
  "conference": "cc-western",
  "churchOrOrganization": "string?",
  "gender": "male",
  "age": 25,
  "delegateType": "ambassador?",
  "emergencyContactName": "string?",
  "emergencyContactNumber": "string?",
  "package": "basicPack",
  "hoodieSize": "M",
  "churchInsured": "true",
  "passportPhotoUrl": "https://...",
  "paymentProofUrl": "https://..."
}
```

**Response (201):**
```json
{
  "success": true,
  "ticketId": "TKT1234"
}
```

**Client redirect:** `navigate(/ticket/${ticketId})`

**Used by:** `register.jsx`

---

### 3.3 `GET /api/tickets/:ticketId`

Fetch a single ticket by its ticketId.

**Response (200):** Full Registration document (flat JSON).

**Key fields the client reads:**
`ticketId`, `status`, `firstName`, `surname`, `email`, `contactNumber`,
`conference`, `package`, `hoodieSize`, `createdAt`

**Used by:** `ticket.jsx`

---

### 3.4 `GET /api/tickets`

List all tickets (no pagination currently).

**Response (200):** Array of Registration documents.

**Key fields the client reads:**
`ticketId`, `firstName`, `surname`, `email`, `conference`, `package`,
`hoodieSize`, `status`, `gender`, `age`, `contactNumber`, `churchInsured`,
`passportPhoto`, `paymentProof`, `createdAt`, `statusComments`, `_id`

**Used by:** `admin/home.jsx` (charts), `admin/tickets.jsx` (table), `admin/duplicates.jsx`

---

### 3.5 `GET /api/tickets/admin/stats`

Dashboard statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketStats": {
      "approved": 1850,
      "pending": 12,
      "rejected": 16,
      "total": 1878
    },
    "congressPacks": {
      "basic": 50,
      "basicPack": 400,
      "halfPack": 300,
      "fullPack": 200,
      "withPack": 100,
      "withoutPack": 50,
      "total": 1000
    },
    "hoodieSizes": {
      "XS": 120,
      "S": 250,
      "M": 380,
      "L": 320,
      "XL": 280,
      "XXL": 95,
      "3XL": 45,
      "4XL": 10,
      "total": 1500
    }
  }
}
```

**Used by:** `admin/home.jsx` — stat cards, hoodie size grid, hoodie doughnut chart

---

### 3.6 `POST /api/tickets/admin/create`

Admin creates a ticket directly (can set status).

**Request body:**
```json
{
  "firstName": "string",
  "surname": "string",
  "email": "string",
  "contactNumber": "string",
  "conference": "cc-western",
  "gender": "male",
  "age": 25,
  "package": "basicPack",
  "hoodieSize": "M",
  "churchInsured": "true",
  "status": "approved",
  "statusComment": "Created by admin",
  "passportPhoto": "https://...",
  "paymentProof": "https://..."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "ticketId": "TKT5678",
    "firstName": "...",
    "surname": "...",
    "email": "...",
    "contactNumber": "...",
    "conference": "...",
    "package": "...",
    "hoodieSize": "...",
    "status": "approved",
    "gender": "...",
    "age": 25,
    "passportPhoto": "...",
    "paymentProof": "...",
    "statusComments": [...],
    "_id": "..."
  }
}
```

**Used by:** `admin/tickets.jsx` (Add Ticket modal)

---

### 3.7 `PATCH /api/tickets/:ticketId/status`

Update ticket status with comment.

**Request body:**
```json
{
  "status": "approved",
  "comment": "Payment verified by admin"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "TKT1234",
    "status": "approved",
    "comments": [...]
  }
}
```

**Used by:** `admin/tickets.jsx`, `admin/duplicates.jsx`

---

### 3.8 `PATCH /api/tickets/:ticketId/edit`

Edit ticket fields (admin).

**Request body:** Any subset of editable fields:
```json
{
  "firstName": "string",
  "surname": "string",
  "email": "string",
  "contactNumber": "string",
  "conference": "cc-western",
  "gender": "male",
  "age": 25,
  "package": "basicPack",
  "hoodieSize": "M",
  "churchInsured": "true",
  "passportPhoto": "https://new-url..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "...",
    "firstName": "...",
    "surname": "...",
    "...all fields...",
    "statusComments": [...],
    "_id": "...",
    "createdAt": "..."
  }
}
```

**Used by:** `admin/tickets.jsx` (Edit modal)

---

## 4. File Uploads

| Source page         | Upload target                              |
|---------------------|--------------------------------------------|
| `register.jsx`      | `POST /api/uploads/file` (local API)       |
| `admin/tickets.jsx` | External Azure: `https://forfilesapp-gshyh0dxbcabhtgg.canadacentral-01.azurewebsites.net/upload?file` |

The local upload endpoint serves files statically at `/uploads/:filename`.

---

## 5. Constants (shared between client & backend)

### Conferences
| Code          | Label                                 |
|---------------|---------------------------------------|
| `cc-western`  | Cape Conference - Western Region      |
| `cc-northern` | Cape Conference - Northern Region     |
| `cc-eastern`  | Cape Conference - Eastern Region      |
| `cape`        | The Cape Conference                   |
| `ncsa`        | Northern Conference of South Africa   |
| `other`       | Other                                 |

### Packages
| Code         | Label                                      | Price  |
|--------------|--------------------------------------------|--------|
| `basic`      | Basic — No Pack                            | R450   |
| `basicPack`  | Basic Pack — Jacket                        | R750   |
| `halfPack`   | Half Pack — Jacket & Bag                   | R900   |
| `fullPack`   | Full Pack — Jacket, Bag, Cup & Socks       | R1 200 |
| `withPack`   | Including Congress Pack (legacy)           | R750   |
| `withoutPack`| Without Congress Pack (legacy)             | R450   |

### Hoodie Sizes
`XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL`, `4XL`

### Ticket Statuses
`pending`, `approved`, `declined`
