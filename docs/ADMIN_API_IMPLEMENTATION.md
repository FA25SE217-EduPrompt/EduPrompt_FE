# Admin API Implementation Summary

## Overview

Implementation of 6 admin API endpoints from the EduPrompt backend for frontend usage.

## Implemented Endpoints

### 1. **POST /api/v1/admin/prompt/standalone**

Create a standalone prompt as an admin.

**Service:** `promptsService.createPromptStandaloneAdmin()`  
**Hook:** `useAdminCreatePromptStandalone()`  
**Request Type:** `AdminCreatePromptRequest`  
**Response Type:** `BaseResponse<PromptResponse>`

### 2. **POST /api/v1/admin/prompt/in-collection**

Create a prompt within a collection as an admin.

**Service:** `promptsService.createPromptInCollectionAdmin()`  
**Hook:** `useAdminCreatePromptInCollection()`  
**Request Type:** `AdminCreatePromptInCollectionRequest`  
**Response Type:** `BaseResponse<PromptResponse>`

### 3. **POST /api/v1/admin/school-admin-acc**

Create a new school admin account.

**Service:** `adminService.createSchoolAdminAccount()`  
**Hook:** `useAdminCreateSchoolAdminAccount()`  
**Request Type:** `CreateSchoolAdminAccountRequest`  
**Response Type:** `BaseResponse<SchoolAdminAccountResponse>`

### 4. **POST /api/v1/admin/schools/{schoolId}/subscription**

Create or update a school subscription.

**Service:** `adminService.createSchoolSubscription()`  
**Hook:** `useAdminCreateSchoolSubscription()`  
**Request Type:** `CreateSchoolSubscriptionRequest`  
**Response Type:** `BaseResponse<SchoolSubscriptionResponse>`

### 5. **PUT /api/v1/admin/prompt/{promptId}/visibility**

Update prompt visibility settings as an admin.

**Service:** `promptsService.updatePromptVisibilityAdmin()`  
**Hook:** `useAdminUpdatePromptVisibility()`  
**Request Type:** `UpdatePromptVisibilityRequest`  
**Response Type:** `BaseResponse<PromptResponse>`

### 6. **PUT /api/v1/admin/prompt/{promptId}/metadata**

Update prompt metadata as an admin.

**Service:** `promptsService.updatePromptMetadataAdmin()`  
**Hook:** `useAdminUpdatePromptMetadata()`  
**Request Type:** `UpdatePromptMetadataRequest`  
**Response Type:** `BaseResponse<PromptResponse>`

## Files Created/Modified

### Created Files:

1. **`src/services/resources/admin.ts`**

   - New service for school admin operations
   - Contains `createSchoolAdminAccount()` and `createSchoolSubscription()`

2. **`src/hooks/queries/admin.ts`**

   - React Query hooks for all admin operations
   - Includes proper cache invalidation strategies

3. **`docs/admin_api_usage_examples.tsx`**
   - Comprehensive usage examples for all endpoints
   - Shows both hook-based and direct service usage

### Modified Files:

1. **`src/types/prompt.api.ts`**

   - Added `AdminCreatePromptRequest` type
   - Added `AdminCreatePromptInCollectionRequest` type

2. **`src/types/school.api.ts`**

   - Added `CreateSchoolAdminAccountRequest` type
   - Added `SchoolAdminAccountResponse` type
   - Added `CreateSchoolSubscriptionRequest` type
   - Added `SchoolSubscriptionResponse` type

3. **`src/services/resources/prompts.ts`**
   - Added 4 admin prompt service methods:
     - `createPromptStandaloneAdmin()`
     - `createPromptInCollectionAdmin()`
     - `updatePromptVisibilityAdmin()`
     - `updatePromptMetadataAdmin()`

## Usage Examples

### Using React Hooks (Recommended)

```typescript
import { useAdminCreatePromptStandalone } from "@/hooks/queries/admin";

function MyComponent() {
  const createPrompt = useAdminCreatePromptStandalone();

  const handleCreate = async () => {
    const result = await createPrompt.mutateAsync({
      payload: {
        title: "My Prompt",
        instruction: "Do something",
        visibility: "public",
      },
    });

    if (result.error) {
      console.error(result.error.messages);
    } else {
      console.log("Created:", result.data);
    }
  };

  return <button onClick={handleCreate}>Create</button>;
}
```

### Direct Service Usage

```typescript
import { promptsService } from "@/services/resources/prompts";
import { adminService } from "@/services/resources/admin";

async function myFunction() {
  // Create standalone prompt
  const result = await promptsService.createPromptStandaloneAdmin({
    title: "Example",
    instruction: "Do something",
    visibility: "private",
  });

  // Create school subscription
  const subscription = await adminService.createSchoolSubscription(1, {
    tier: "PREMIUM",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
  });
}
```

## Key Features

✅ **Type Safety:** Full TypeScript support with proper type definitions  
✅ **Error Handling:** Consistent error handling using `BaseResponse<T>` pattern  
✅ **Cache Management:** Automatic cache invalidation with React Query  
✅ **Request Options:** Support for idempotency keys, request IDs, and abort signals  
✅ **Consistent API:** Follows existing codebase patterns and conventions

## Testing Recommendations

1. Test each endpoint with valid data
2. Test error scenarios (invalid data, missing fields)
3. Verify cache invalidation works correctly
4. Test concurrent requests with idempotency keys
5. Verify admin permissions are enforced by backend

## Notes

- All endpoints require admin authentication (enforced by backend)
- The `visibility` field supports: "private", "group", "public", "school"
- Request options support idempotency keys for safe retries
- All mutations automatically invalidate relevant query caches
- See `docs/admin_api_usage_examples.tsx` for detailed usage examples
