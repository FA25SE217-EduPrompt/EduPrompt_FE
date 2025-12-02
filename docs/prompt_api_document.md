# Prompt API Documentation

Base URL: `/api/prompts`

## Overview

The Prompt API manages prompt creation, retrieval, and the "unlock" mechanism (view logging).
There are two main types of prompt responses:
1.  **PromptResponse**: Contains metadata only (title, description, etc.). Used for lists and previews.
2.  **DetailPromptResponse**: Contains the full prompt content (instruction, context, etc.). This is returned when a user views a specific prompt or creates one.

**Unlock Mechanism:**
To access the full content of a public prompt (if applicable logic exists), the system tracks "views".
- Use `/prompt-view-log/new` to mark a prompt as "unlocked" (viewed) by the user.
- Use `/{promptId}/viewed` to check if the user has already unlocked the prompt.

---

## Authentication

All endpoints require a valid Bearer Token.
Roles allowed: `TEACHER`, `SCHOOL_ADMIN`, `SYSTEM_ADMIN`.

---

## Response Envelope

All responses follow this structure:

```json
{
  "data": { },
  "error": {
    "code": "ERROR_CODE",
    "messages": ["error message 1", "error message 2"],
    "status": "HTTP_STATUS"
  }
}
```

**Rules:**

* Success (2xx): `data` populated, `error` is `null`
* Error (4xx/5xx): `data` is `null`, `error` populated

---

## Data Structures

### PromptResponse (Metadata)
Used in paginated lists.

```json
{
  "title": "string",
  "description": "string",
  "outputFormat": "string",
  "visibility": "string",
  "fullName": "string", // Creator's name
  "collectionName": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### DetailPromptResponse (Full Content)
Used for single prompt retrieval and creation responses.

```json
{
  "id": "UUID",
  "title": "string",
  "description": "string",
  "instruction": "string", // Core prompt content
  "context": "string", // Additional context
  "inputExample": "string", // Example input
  "outputFormat": "string", // Expected output format
  "constraints": "string", // Any constraints or requirements
  "visibility": "string", // PRIVATE, PUBLIC, etc.
  "fullName": "string", // Creator's name
  "collectionName": "string",
  "tags": [
    {
      "id": "UUID",
      "name": "string"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## Endpoints

### 1. Unlock / Log Prompt View
Marks a prompt as "viewed" (unlocked) by the current user. This is required to track usage or unlock content limits.

**POST** `/prompt-view-log/new`

**Request Body:**
```json
{
  "promptId": "UUID" // Required
}
```

**Response:**
`PromptViewLogResponse`
```json
{
  "id": "UUID",
  "userId": "UUID",
  "promptId": "UUID",
  "createdAt": "timestamp"
}
```

---

### 2. Check Unlock Status
Checks if the current user has already unlocked (viewed) a specific prompt.

**GET** `/{promptId}/viewed`

**Response:**
`true` if unlocked, `false` otherwise.

---

### 3. Get Prompt by ID
Retrieves the full details of a prompt.

**GET** `/{promptId}`

**Response:**
`DetailPromptResponse`

---

### 4. Create Standalone Prompt
Creates a prompt not associated with a collection.

**POST** `/standalone`

**Request Body:** `CreatePromptRequest`
```json
{
  "title": "string",
  "description": "string",
  "instruction": "string",
  "context": "string",
  "inputExample": "string",
  "outputFormat": "string",
  "constraints": "string",
  "visibility": "string", // e.g., PRIVATE
  "tagIds": ["UUID"]
}
```

**Response:**
`DetailPromptResponse`

---

### 5. Create Prompt in Collection
Creates a prompt within a specific collection.

**POST** `/collection`

**Request Body:** `CreatePromptCollectionRequest`
```json
{
  "title": "string",
  "description": "string",
  "instruction": "string",
  "context": "string",
  "inputExample": "string",
  "outputFormat": "string",
  "constraints": "string",
  "visibility": "string",
  "tagIds": ["UUID"],
  "collectionId": "UUID" // Required
}
```

**Response:**
`DetailPromptResponse`

---

### 6. Get My Prompts
Retrieves private prompts created by the current user.

**GET** `/my-prompt`

**Query Parameters:**
- `page`: int (default 0)
- `size`: int (default 20)

**Response:**
`PaginatedDetailPromptResponse` (List of `DetailPromptResponse`)

---

### 7. Get Prompts by User ID
Retrieves public/shared prompts of a specific user.

**GET** `/user/{userId}`

**Query Parameters:**
- `page`: int (default 0)
- `size`: int (default 20)

**Response:**
`PaginatedPromptResponse` (List of `PromptResponse` - Metadata only)

---

### 8. Get Non-Private Prompts
Retrieves all prompts that are not PRIVATE (e.g., PUBLIC, SCHOOL, GROUP).

**GET** `/get-non-private`

**Query Parameters:**
- `page`: int (default 0)
- `size`: int (default 20)

**Response:**
`PaginatedPromptResponse` (List of `PromptResponse` - Metadata only)

---

### 9. Get Prompts by Collection
Retrieves prompts belonging to a specific collection.

**GET** `/collection/{collectionId}`

**Query Parameters:**
- `page`: int (default 0)
- `size`: int (default 20)

**Response:**
`PaginatedPromptResponse` (List of `PromptResponse` - Metadata only)

---

### 10. Filter Prompts
Advanced filtering for prompts.

**GET** `/filter`

**Query Parameters:**
- `createdBy`: UUID
- `collectionName`: string
- `tagTypes`: List<string>
- `tagValues`: List<string>
- `schoolName`: string
- `groupName`: string
- `title`: string
- `includeDeleted`: boolean
- `page`: int
- `size`: int

**Response:**
`PaginatedPromptResponse` (List of `PromptResponse` - Metadata only)

---

### 11. Update Metadata
Updates prompt details (title, description, content, etc.).

**PUT** `/{promptId}/metadata`

**Request Body:** `UpdatePromptMetadataRequest`

**Response:**
`DetailPromptResponse`

---

### 12. Update Visibility
Updates just the visibility of a prompt.

**PUT** `/{promptId}/visibility`

**Request Body:** `UpdatePromptVisibilityRequest`
```json
{
  "visibility": "string",
  "collectionId": "UUID" // Optional, used when changing to GROUP/SCHOOL
}
```

**Response:**
`DetailPromptResponse`

---

### 13. Delete Prompt
Soft deletes a prompt.

**DELETE** `/{id}`

**Response:**
`200 OK`
