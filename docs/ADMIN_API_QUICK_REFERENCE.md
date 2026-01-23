# Quick Reference: Admin API Endpoints

## 🎯 Endpoints Overview

| Endpoint                                  | Method | Purpose                     |
| ----------------------------------------- | ------ | --------------------------- |
| `/api/v1/admin/prompt/standalone`         | POST   | Create standalone prompt    |
| `/api/v1/admin/prompt/in-collection`      | POST   | Create prompt in collection |
| `/api/v1/admin/prompt/{id}/visibility`    | PUT    | Update prompt visibility    |
| `/api/v1/admin/prompt/{id}/metadata`      | PUT    | Update prompt metadata      |
| `/api/v1/admin/school-admin-acc`          | POST   | Create school admin account |
| `/api/v1/admin/schools/{id}/subscription` | POST   | Create school subscription  |

---

## 🔥 Quick Start Examples

### 1️⃣ Create Standalone Prompt

```typescript
import { useAdminCreatePromptStandalone } from "@/hooks/queries/admin";

const { mutateAsync } = useAdminCreatePromptStandalone();

await mutateAsync({
  payload: {
    title: "My Prompt",
    instruction: "Do something",
    visibility: "public",
  },
});
```

### 2️⃣ Create Prompt in Collection

```typescript
import { useAdminCreatePromptInCollection } from "@/hooks/queries/admin";

const { mutateAsync } = useAdminCreatePromptInCollection();

await mutateAsync({
  payload: {
    title: "Collection Prompt",
    instruction: "Instructions here",
    visibility: "school",
    collectionId: "col-123",
  },
});
```

### 3️⃣ Update Prompt Visibility

```typescript
import { useAdminUpdatePromptVisibility } from "@/hooks/queries/admin";

const { mutateAsync } = useAdminUpdatePromptVisibility();

await mutateAsync({
  promptId: "prompt-123",
  payload: {
    visibility: "school",
    collectionId: "col-456",
  },
});
```

### 4️⃣ Update Prompt Metadata

```typescript
import { useAdminUpdatePromptMetadata } from "@/hooks/queries/admin";

const { mutateAsync } = useAdminUpdatePromptMetadata();

await mutateAsync({
  promptId: "prompt-123",
  payload: {
    title: "New Title",
    description: "New Description",
  },
});
```

### 5️⃣ Create School Admin Account

```typescript
import { useAdminCreateSchoolAdminAccount } from "@/hooks/queries/admin";

const { mutateAsync } = useAdminCreateSchoolAdminAccount();

await mutateAsync({
  payload: {
    email: "admin@school.edu",
    password: "SecurePass123!",
    fullName: "John Doe",
    schoolId: 1,
  },
});
```

### 6️⃣ Create School Subscription

```typescript
import { useAdminCreateSchoolSubscription } from "@/hooks/queries/admin";

const { mutateAsync } = useAdminCreateSchoolSubscription();

await mutateAsync({
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

## 📦 Import Reference

### Hooks

```typescript
import {
  useAdminCreatePromptStandalone,
  useAdminCreatePromptInCollection,
  useAdminUpdatePromptVisibility,
  useAdminUpdatePromptMetadata,
  useAdminCreateSchoolAdminAccount,
  useAdminCreateSchoolSubscription,
} from "@/hooks/queries/admin";
```

### Services (for direct API calls)

```typescript
import { promptsService } from "@/services/resources/prompts";
import { adminService } from "@/services/resources/admin";
```

### Types

```typescript
import type {
  AdminCreatePromptRequest,
  AdminCreatePromptInCollectionRequest,
  UpdatePromptVisibilityRequest,
  UpdatePromptMetadataRequest,
} from "@/types/prompt.api";

import type {
  CreateSchoolAdminAccountRequest,
  CreateSchoolSubscriptionRequest,
} from "@/types/school.api";
```

---

## ⚡ Direct Service Calls (without hooks)

```typescript
import { promptsService, adminService } from "@/services/resources";

// Create standalone prompt
const result1 = await promptsService.createPromptStandaloneAdmin({
  title: "Prompt",
  instruction: "Do this",
  visibility: "public",
});

// Create school subscription
const result2 = await adminService.createSchoolSubscription(1, {
  tier: "BASIC",
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-12-31T23:59:59Z",
});
```

---

## 🎨 Visibility Options

| Value       | Description               |
| ----------- | ------------------------- |
| `"private"` | Only visible to creator   |
| `"group"`   | Visible to group members  |
| `"public"`  | Visible to everyone       |
| `"school"`  | Visible to school members |

---

## ✅ Error Handling Pattern

```typescript
const result = await mutation.mutateAsync({ payload });

if (result.error) {
  // Handle error
  console.error(result.error.code);
  console.error(result.error.messages);
} else {
  // Use data
  console.log(result.data);
}
```

---

## 📋 Complete Component Example

```typescript
"use client";

import { useAdminCreatePromptStandalone } from "@/hooks/queries/admin";
import { useState } from "react";

export default function CreatePromptPage() {
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const createPrompt = useAdminCreatePromptStandalone();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createPrompt.mutateAsync({
      payload: {
        title,
        instruction,
        visibility: "public",
      },
    });

    if (result.error) {
      alert(`Error: ${result.error.messages.join(", ")}`);
    } else {
      alert(`Prompt created: ${result.data?.id}`);
      setTitle("");
      setInstruction("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
      />
      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Instruction"
        required
      />
      <button type="submit" disabled={createPrompt.isPending}>
        {createPrompt.isPending ? "Creating..." : "Create Prompt"}
      </button>
    </form>
  );
}
```

---

## 🔒 Authentication

All admin endpoints require admin-level authentication. The authentication token is automatically included by the `apiClient` interceptors.

---

## 📚 Documentation Files

- **Implementation Summary:** `docs/ADMIN_API_IMPLEMENTATION.md`
- **API Reference:** `docs/ADMIN_API_REFERENCE.md`
- **Usage Examples:** `docs/admin_api_usage_examples.tsx`
- **Quick Reference:** `docs/ADMIN_API_QUICK_REFERENCE.md` (this file)

---

## ⚙️ Advanced Options

### Idempotency Key (prevent duplicates)

```typescript
await mutateAsync({
  payload: {
    /* ... */
  },
  opts: {
    idempotencyKey: "unique-key-123",
  },
});
```

### Request Cancellation

```typescript
const controller = new AbortController();

await mutateAsync({
  payload: {
    /* ... */
  },
  opts: {
    signal: controller.signal,
  },
});

// Later: controller.abort();
```

### Request Tracking

```typescript
await mutateAsync({
  payload: {
    /* ... */
  },
  opts: {
    requestId: "req-123",
  },
});
```
