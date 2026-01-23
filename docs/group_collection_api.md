# Group and Collection API Documentation

This document outlines the API endpoints associated with Group management and Collection assignment.

## Group Endpoints

### 1. Get User's Groups (Paginated)
Retrieves a paginated list of groups the current user belongs to or owns.

*   **URL:** `/api/groups/my-groups`
*   **Method:** `GET`
*   **Parameters:**
    *   `page` (query, integer, default: 0): Page number.
    *   `size` (query, integer, default: 20): Number of items per page.
*   **Response:** `200 OK`
    *   **Body:** `ResponseDtoPageGroupResponse`
        ```json
        {
          "data": {
            "content": [
              {
                "id": "uuid",
                "name": "string",
                "description": "string",
                "memberCount": 0,
                "createdAt": "date-time"
              }
            ],
            "totalElements": 0,
            "totalPages": 0,
            "pageNumber": 0,
            "pageSize": 0
          },
          "error": null
        }
        ```

### 2. Get Group Details
Retrieves detailed information about a specific group.

*   **URL:** `/api/groups/{id}`
*   **Method:** `GET`
*   **Parameters:**
    *   `id` (path, uuid, required): The ID of the group.
*   **Response:** `200 OK`
    *   **Body:** `ResponseDtoObject` (containing Group details)

### 3. Create Group
Creates a new group.

*   **URL:** `/api/groups/create`
*   **Method:** `POST`
*   **Request Body:** `CreateGroupRequest`
    ```json
    {
      "name": "string" // Required, minLength: 1, maxLength: 255
    }
    ```
*   **Response:** `200 OK`
    *   **Body:** `ResponseDtoObject`

### 4. Update Group
Updates an existing group's information.

*   **URL:** `/api/groups/{id}`
*   **Method:** `PUT`
*   **Parameters:**
    *   `id` (path, uuid, required): The ID of the group.
*   **Request Body:** `UpdateGroupRequest`
    ```json
    {
       "name": "string", // maxLength: 255, minLength: 1
       "isActive": boolean // Required
    }
    ```
*   **Response:** `200 OK`
    *   **Body:** `ResponseDtoObject`

### 5. Get Group Members
Retrieves a list of members in a group.

*   **URL:** `/api/groups/{groupId}/members`
*   **Method:** `GET`
*   **Parameters:**
    *   `groupId` (path, uuid, required): The ID of the group.
    *   `page` (query, integer, default: 0)
    *   `size` (query, integer, default: 20)
*   **Response:** `200 OK`
    *   **Body:** `ResponseDtoObject` (List of members)

### 6. Add Members to Group
Adds one or more members to a group.

*   **URL:** `/api/groups/{groupId}/members`
*   **Method:** `POST`
*   **Parameters:**
    *   `groupId` (path, uuid, required): The ID of the group.
*   **Request Body:** `AddGroupMembersRequest`
    ```json
    {
      "members": [ // Required, uniqueItems: true
        {
          "userId": "uuid" // Required
        }
      ]
    }
    ```
*   **Response:** `200 OK`
    *   **Body:** `ResponseDtoObject`

### 7. Remove Member from Group
Removes a specific member from a group.

*   **URL:** `/api/groups/{groupId}/members`
*   **Method:** `DELETE`
*   **Parameters:**
    *   `groupId` (path, uuid, required): The ID of the group.
*   **Request Body:** `RemoveGroupMemberRequest`
    ```json
    {
      "userId": "uuid" // Required
    }
    ```
*   **Response:** `200 OK`
    *   **Body:** `ResponseDtoObject`

---

## Collection Endpoints (Group Related)

### 1. Assign Collection to Group
Assigns an existing collection to a group, changing its visibility to `GROUP`.

*   **URL:** `/api/collections/assign-to-group`
*   **Method:** `POST`
*   **Request Body:** `AssignCollectionToGroupRequest`
    ```json
    {
      "collectionId": "uuid", // Required
      "groupId": "uuid"       // Required
    }
    ```
*   **Response:** `200 OK`
    *   **Body:** `ResponseDtoUpdateCollectionResponse`
        ```json
        {
          "data": {
            "name": "string",
            "description": "string",
            "visibility": "string", // Should be "GROUP"
            "tags": [...],
            "updatedAt": "date-time"
          },
          "error": null
        }
        ```

## Common Schemas

### ResponseDtoObject
Standard wrapper for API responses.
```json
{
  "data": {},
  "error": {
    "code": "string",
    "message": ["string"],
    "status": "string" // e.g., "200 OK", "400 BAD_REQUEST"
  }
}

## User Endpoints

### 1. Get Users in My School
Retrieves a list of all active users in the current user's school.

*   **URL:** `/api/users/school/users`
*   **Method:** `GET`
*   **Response:** `200 OK`
    *   **Body:** `ResponseDtoListUserSchoolResponse`
        ```json
        {
          "data": [
            {
              "id": "uuid",
              "firstName": "string",
              "lastName": "string",
              "email": "string",
              "role": "string",
              "isActive": boolean
            }
          ],
          "error": null
        }
        ```
```
