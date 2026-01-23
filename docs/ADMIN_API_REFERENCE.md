# Admin API Reference

## Table of Contents

- [Prompt Management](#prompt-management)
- [School Administration](#school-administration)
- [Type Definitions](#type-definitions)

---

## Prompt Management

### Create Standalone Prompt (Admin)

**Endpoint:** `POST /api/v1/admin/prompt/standalone`

**Description:** Create a new standalone prompt as a system administrator.

**Service Method:**

```typescript
promptsService.createPromptStandaloneAdmin(payload, opts?)
```

**React Hook:**

```typescript
const mutation = useAdminCreatePromptStandalone();
```

**Request Body:**

```typescript
{
  title: string;                                    // Required
  description?: string;                             // Optional
  instruction: string;                              // Required
  context?: string;                                 // Optional
  inputExample?: string;                            // Optional
  outputFormat?: string;                            // Optional
  constraints?: string;                             // Optional
  visibility: "private" | "group" | "public" | "school";
  tagIds?: string[];                                // Optional
}
```

**Example:**

```typescript
const result = await mutation.mutateAsync({
  payload: {
    title: "Math Problem Solver",
    instruction: "Solve math problems step by step",
    visibility: "public",
    tagIds: ["math", "education"],
  },
});
```

---

### Create Prompt in Collection (Admin)

**Endpoint:** `POST /api/v1/admin/prompt/in-collection`

**Description:** Create a new prompt within a specific collection as admin.

**Service Method:**

```typescript
promptsService.createPromptInCollectionAdmin(payload, opts?)
```

**React Hook:**

```typescript
const mutation = useAdminCreatePromptInCollection();
```

**Request Body:**

```typescript
{
  title: string;
  description?: string;
  instruction: string;
  context?: string;
  inputExample?: string;
  outputFormat?: string;
  constraints?: string;
  visibility: "private" | "group" | "public" | "school";
  collectionId: string;                              // Required
  tagIds?: string[];
}
```

**Example:**

```typescript
const result = await mutation.mutateAsync({
  payload: {
    title: "Science Experiment",
    instruction: "Conduct the experiment safely",
    visibility: "school",
    collectionId: "col-123",
  },
});
```

---

### Update Prompt Visibility (Admin)

**Endpoint:** `PUT /api/v1/admin/prompt/{promptId}/visibility`

**Description:** Update the visibility settings of an existing prompt.

**Service Method:**

```typescript
promptsService.updatePromptVisibilityAdmin(promptId, payload, opts?)
```

**React Hook:**

```typescript
const mutation = useAdminUpdatePromptVisibility();
```

**Request Body:**

```typescript
{
  visibility: "private" | "group" | "public" | "school";
  collectionId?: string;  // Required when changing to group/school visibility
}
```

**Example:**

```typescript
const result = await mutation.mutateAsync({
  promptId: "prompt-123",
  payload: {
    visibility: "school",
    collectionId: "col-456",
  },
});
```

---

### Update Prompt Metadata (Admin)

**Endpoint:** `PUT /api/v1/admin/prompt/{promptId}/metadata`

**Description:** Update the metadata of an existing prompt.

**Service Method:**

```typescript
promptsService.updatePromptMetadataAdmin(promptId, payload, opts?)
```

**React Hook:**

```typescript
const mutation = useAdminUpdatePromptMetadata();
```

**Request Body:**

```typescript
{
  title: string;
  description?: string;
  instruction?: string;
  context?: string;
  inputExample?: string;
  outputFormat?: string;
  constraints?: string;
  tagIds?: string[];
}
```

**Example:**

```typescript
const result = await mutation.mutateAsync({
  promptId: "prompt-123",
  payload: {
    title: "Updated Title",
    description: "Updated description",
    tagIds: ["new-tag-1", "new-tag-2"],
  },
});
```

---

## School Administration

### Create School Admin Account

**Endpoint:** `POST /api/v1/admin/school-admin-acc`

**Description:** Create a new school administrator account.

**Service Method:**

```typescript
adminService.createSchoolAdminAccount(payload, opts?)
```

**React Hook:**

```typescript
const mutation = useAdminCreateSchoolAdminAccount();
```

**Request Body:**

```typescript
{
  email: string; // Required
  password: string; // Required
  fullName: string; // Required
  schoolId: number; // Required
}
```

**Response:**

```typescript
{
  id: string;
  email: string;
  fullName: string;
  schoolId: number;
  createdAt: string;
}
```

**Example:**

```typescript
const result = await mutation.mutateAsync({
  payload: {
    email: "admin@school.edu",
    password: "SecurePassword123!",
    fullName: "John Doe",
    schoolId: 1,
  },
});
```

---

### Create School Subscription

**Endpoint:** `POST /api/v1/admin/schools/{schoolId}/subscription`

**Description:** Create or update a subscription plan for a school.

**Service Method:**

```typescript
adminService.createSchoolSubscription(schoolId, payload, opts?)
```

**React Hook:**

```typescript
const mutation = useAdminCreateSchoolSubscription();
```

**Parameters:**

- `schoolId`: number (path parameter)

**Request Body:**

```typescript
{
  tier: string;         // e.g., "BASIC", "PREMIUM", "ENTERPRISE"
  startDate: string;    // ISO 8601 format
  endDate: string;      // ISO 8601 format
  maxTokens?: number;   // Optional token limit
}
```

**Response:**

```typescript
{
  id: string;
  schoolId: number;
  tier: string;
  startDate: string;
  endDate: string;
  maxTokens?: number;
  createdAt: string;
  updatedAt?: string;
}
```

**Example:**

```typescript
const result = await mutation.mutateAsync({
  schoolId: 1,
  payload: {
    tier: "PREMIUM",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
    maxTokens: 1000000,
  },
});
```

---

## Type Definitions

### Common Types

#### BaseResponse<T>

```typescript
type BaseResponse<T> = {
  data: T | null;
  error: ErrorPayload | null;
};
```

#### ErrorPayload

```typescript
type ErrorPayload = {
  code: string;
  messages: string[];
  status: string;
};
```

#### ApiRequestOptions

```typescript
type ApiRequestOptions = {
  idempotencyKey?: string; // For safe retries
  requestId?: string; // For request tracking
  signal?: AbortSignal; // For request cancellation
};
```

### Prompt Types

#### AdminCreatePromptRequest

```typescript
type AdminCreatePromptRequest = {
  title: string;
  description?: string;
  instruction: string;
  context?: string;
  inputExample?: string;
  outputFormat?: string;
  constraints?: string;
  visibility: "private" | "group" | "public" | "school";
  tagIds?: string[];
};
```

#### AdminCreatePromptInCollectionRequest

```typescript
type AdminCreatePromptInCollectionRequest = {
  title: string;
  description?: string;
  instruction: string;
  context?: string;
  inputExample?: string;
  outputFormat?: string;
  constraints?: string;
  visibility: "private" | "group" | "public" | "school";
  collectionId: string;
  tagIds?: string[];
};
```

#### UpdatePromptVisibilityRequest

```typescript
type UpdatePromptVisibilityRequest = {
  visibility: "private" | "group" | "public" | "school";
  collectionId?: string;
};
```

#### UpdatePromptMetadataRequest

```typescript
type UpdatePromptMetadataRequest = {
  title: string;
  description?: string;
  instruction?: string;
  context?: string;
  inputExample?: string;
  outputFormat?: string;
  constraints?: string;
  tagIds?: string[];
};
```

#### PromptResponse

```typescript
type PromptResponse = {
  id: string;
  title: string;
  description?: string;
  instruction: string;
  context?: string;
  inputExample?: string;
  outputFormat?: string;
  constraints?: string;
  visibility: "private" | "group" | "public";
  collectionName?: string;
  fullName?: string;
  tags: TagResponse[];
  ownerName?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  averageRating?: number;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  ownerId?: string;
};
```

### School Admin Types

#### CreateSchoolAdminAccountRequest

```typescript
type CreateSchoolAdminAccountRequest = {
  email: string;
  password: string;
  fullName: string;
  schoolId: number;
};
```

#### SchoolAdminAccountResponse

```typescript
type SchoolAdminAccountResponse = {
  id: string;
  email: string;
  fullName: string;
  schoolId: number;
  createdAt: string;
};
```

#### CreateSchoolSubscriptionRequest

```typescript
type CreateSchoolSubscriptionRequest = {
  tier: string;
  startDate: string;
  endDate: string;
  maxTokens?: number;
};
```

#### SchoolSubscriptionResponse

```typescript
type SchoolSubscriptionResponse = {
  id: string;
  schoolId: number;
  tier: string;
  startDate: string;
  endDate: string;
  maxTokens?: number;
  createdAt: string;
  updatedAt?: string;
};
```

---

## Error Handling

All API calls return a `BaseResponse<T>` type that includes both data and error:

```typescript
const result = await mutation.mutateAsync({ ... });

if (result.error) {
  // Handle error
  console.error('Error code:', result.error.code);
  console.error('Messages:', result.error.messages);
  console.error('Status:', result.error.status);
} else {
  // Use data
  console.log('Success:', result.data);
}
```

---

## Cache Invalidation

All mutations automatically invalidate relevant query caches:

- **Prompt mutations** invalidate:

  - `adminKeys.prompts()`
  - `promptKeys.all`
  - Specific prompt detail caches

- **School admin mutations** invalidate:
  - `adminKeys.schoolAdmins()`
  - `adminKeys.subscriptions()`
  - Specific school caches

---

## Best Practices

1. **Use Hooks for Components:** React hooks provide automatic cache management
2. **Use Services for Server-Side:** Direct service calls for API routes or server actions
3. **Handle Errors:** Always check for `result.error` before using `result.data`
4. **Use Idempotency Keys:** For critical operations that should not be duplicated
5. **TypeScript Types:** Let TypeScript guide you with proper type checking
6. **Request Cancellation:** Use AbortSignal for cancellable requests

---

## Import Paths

```typescript
// Hooks
import {
  useAdminCreatePromptStandalone,
  useAdminCreatePromptInCollection,
  useAdminUpdatePromptVisibility,
  useAdminUpdatePromptMetadata,
  useAdminCreateSchoolAdminAccount,
  useAdminCreateSchoolSubscription,
} from "@/hooks/queries/admin";

// Services
import { promptsService } from "@/services/resources/prompts";
import { adminService } from "@/services/resources/admin";

// Types
import type {
  AdminCreatePromptRequest,
  AdminCreatePromptInCollectionRequest,
  UpdatePromptVisibilityRequest,
  UpdatePromptMetadataRequest,
} from "@/types/prompt.api";

import type {
  CreateSchoolAdminAccountRequest,
  CreateSchoolSubscriptionRequest,
  SchoolAdminAccountResponse,
  SchoolSubscriptionResponse,
} from "@/types/school.api";
```
