# AI Endpoints Integration Guide

This document details the expected flow and usage of EduPrompt's AI-powered endpoints: **Prompt Scoring**, **Prompt Optimization**, and **Prompt Generation**.

> [!NOTE]
> All endpoints perform **quota validation** and **deduction**.
> If an AI operation fails completely (e.g., service timeout), the deducted quota is **automatically refunded** asynchronously.

## 1. Prompt Scoring

### Endpoint
`POST /api/v2/prompts/score`

### Description
Evaluates a prompt against 6 quality dimensions (Clarity, Context, Output Spec, Constraints, Curriculum Alignment, Pedagogical Quality).

### Request
```json
{
  "promptContent": "Write a lesson plan about Photosynthesis for 10th grade", // Required
  "lessonId": "uuid-of-lesson-context" // Optional, but recommended for Curriculum Alignment scoring
}
```

### Response
Returns a `PromptScoreResult` object.

```json
{
  "data": {
    "overallScore": 85.5,
    "detectedContext": { /* CurriculumContextDetail object */ },
    "detectedWeaknesses": {
      "Instruction Clarity": ["Suggestion 1", "Suggestion 2"]
    },
    // The 6 dimension scores
    "instructionClarity": {
      "dimensionName": "Instruction Clarity",
      "score": 90.0,
      "maxScore": 100.0,
      "issues": [],
      "suggestions": [],
      "isSuccess": true  // NEW: Check this flag!
    },
    "curriculumAlignment": {
      "dimensionName": "Curriculum Alignment",
      "score": 0.0,
      "isSuccess": false, // If false, show "Failed to score" UI instead of 0
      "issues": ["Failed to score this dimension: Service timeout"]
    },
    // ... contextCompleteness, outputSpecification, constraintStrength, pedagogicalQuality
  }
}
```

### Frontend Implementation Logic
1.  **Call API**: Send prompt content and optional lesson ID.
2.  **Handle Partial Failures**: Iterate through the 6 dimension objects.
    -   If `isSuccess` is `true`: Display the score and progress bar.
    -   If `isSuccess` is `false`: Display a warning icon or "N/A" with the error message from `issues`. **Do not treat 0 as a valid score if `isSuccess` is false.**
3.  **Overall Score**: Display the `overallScore` regardless of partial failures (it handles weighting automatically).

---

## 2. Prompt Optimization

### Endpoint
`POST /api/v2/prompts/optimize`

### Description
Optimizes a prompt based on selected weaknesses and an optimization mode. This is an expensive operation.

### Request
```json
{
  "promptContent": "Original prompt text...",
  "optimizationMode": "SAFE", // Enum: PEDAGOGICAL, SAFE
  "lessonId": "uuid-optional",
  "selectedWeaknesses": {
    "weakness1": [
      "string"
    ],
    "weakness2": [
      "string"
    ]
  }, // Optional filters, which is get from prompt scoring (if user use it)
  "customInstruction": "Make it more engaging for students" // Optional user guidance
}
```

### Response
Returns an `OptimizationResponse` object.

```json
{
  "data": {
    "versionId": null, // Null for unsaved optimizations (Scratchpad)
    "originalPrompt": "Original prompt text...",
    "optimizedPrompt": "New optimized prompt text...", // Display this in diff view
    "originalScore": { /* PromptScoreResult */ },
    "optimizedScore": { /* PromptScoreResult */ },
    "improvement": 15.5, // Score difference
    "appliedFixes": ["Improved instruction clarity", "Added missing context"],
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

### Frontend Implementation Logic
1.  **Loading State**: This request takes 5-15 seconds. Show a "Optimizing..." loading skeleton.
2.  **Error Handling**:
    -   If the request fails (500/400), show a toast error AND check for Quota Refresh. The backend **refunds tokens** on failure, so the user's balance might need re-fetching.
3.  **Diff View**: Use `originalPrompt` and `optimizedPrompt` to show a side-by-side or inline diff.
4.  **Before/After Scores**: Display `originalScore` vs `optimizedScore` using the same `isSuccess` logic as the Scoring endpoint.

---

## 3. Prompt Generation (from File)

### Endpoint
`POST /api/prompts/generate-from-file`

### Description
Uploads a document (PDF, DOCX) and generates a structured prompt based on its content.

### Request (`multipart/form-data`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | File | Yes | The source document (PDF, DOCX, TXT) |
| `promptTask` | Enum | Yes | `LESSON_PLAN`, `SLIDE`, `TEST`, `TEST_MATRIX`, `GROUP_ACTIVITY` |
| `customInstruction` | String | No | Additional context (e.g., "Focus on chapter 3") |

### Response
Returns a `GeneratePromptFromFileResponse` with structured sections.

```json
{
  "data": {
    "instruction": "Design a lesson plan for...",
    "context": "Based on the uploaded document covering...",
    "inputExample": "Teacher inputs: 'Start class'...",
    "outputFormat": "1. Introduction\n2. Main Activity...",
    "constraints": "Do not include advanced topics...",
    "aiModel": "gemini-3-flash-preview", //default model
    "promptTokens": 150,
    "completionTokens": 300,
    "totalTokens": 450
  }
}
```

### Frontend Implementation Logic
1.  **Form Data**: Ensure `Content-Type: multipart/form-data` is set (or let the browser set it).
2.  **Mapping**: Map the response fields (`instruction`, `context`, etc.) to the 5 inputs in the Prompt Editor form.
3.  **Feedback**: Show the `totalTokens` usage to the user as a "Cost" for this generation.
4.  **Error Handling**: If upload fails or generation fails, show a toast. Quota is refunded automatically.

---

## 4. Quota Management Flow

The frontend does not need to manage refunds manually.
1.  **Check Balance**: Before calling any of these endpoints, check generic user quota.
2.  **Optimistic UI**: You may optimistically deduct tokens for immediate feedback, but **always re-fetch the user's profile/quota** after the response returns (success or failure) to sync the actual server-side balance (which accounts for refunds and exact usage).
