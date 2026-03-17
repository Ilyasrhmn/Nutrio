# Access Control Management System - API Documentation

## Overview

The Access Control Management System provides a comprehensive, database-driven authorization framework with role-based access control (RBAC), fine-grained permissions, and dynamic menu configuration.

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

All endpoints require JWT authentication except where noted.

```http
Authorization: Bearer <jwt_token>
```

## Endpoints

### Roles

#### List All Roles

```http
GET /roles?page=1&limit=20&search=admin
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by role name

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "ADMIN_BGN",
      "description": "Administrator role",
      "permissionCount": 15,
      "createdAt": "2026-03-16T10:00:00Z",
      "updatedAt": "2026-03-16T10:00:00Z"
    }
  ],
  "total": 6,
  "page": 1,
  "limit": 20
}
```

#### Get Role by ID

```http
GET /roles/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "ADMIN_BGN",
  "description": "Administrator role",
  "permissions": [
    {
      "id": "uuid",
      "action": "manage",
      "subject": "all",
      "description": "Full access"
    }
  ],
  "createdAt": "2026-03-16T10:00:00Z",
  "updatedAt": "2026-03-16T10:00:00Z"
}
```

#### Create Role

```http
POST /roles
```

**Request Body:**
```json
{
  "name": "CUSTOM_ROLE",
  "description": "Custom role description"
}
```

**Guards:** `AdminGuard`

#### Update Role

```http
PUT /roles/:id
```

**Request Body:**
```json
{
  "name": "UPDATED_ROLE",
  "description": "Updated description"
}
```

**Guards:** `AdminGuard`

#### Delete Role

```http
DELETE /roles/:id
```

**Guards:** `AdminGuard`

**Error:** Returns 400 if role has assigned users

#### Add Permissions to Role

```http
POST /roles/:id/permissions
```

**Request Body:**
```json
{
  "permissionIds": ["uuid1", "uuid2"]
}
```

**Guards:** `AdminGuard`

#### Remove Permissions from Role

```http
DELETE /roles/:id/permissions
```

**Request Body:**
```json
{
  "permissionIds": ["uuid1", "uuid2"]
}
```

**Guards:** `AdminGuard`

---

### Permissions

#### List All Permissions

```http
GET /permissions
```

**Response (grouped by subject):**
```json
{
  "Dashboard": [
    {
      "id": "uuid",
      "action": "read",
      "subject": "Dashboard",
      "description": "View dashboard",
      "createdAt": "2026-03-16T10:00:00Z",
      "updatedAt": "2026-03-16T10:00:00Z"
    }
  ],
  "User": [...]
}
```

#### Get Permission by ID

```http
GET /permissions/:id
```

**Response:**
```json
{
  "id": "uuid",
  "action": "read",
  "subject": "Dashboard",
  "description": "View dashboard",
  "roleCount": 3,
  "createdAt": "2026-03-16T10:00:00Z",
  "updatedAt": "2026-03-16T10:00:00Z"
}
```

#### Create Permission

```http
POST /permissions
```

**Request Body:**
```json
{
  "action": "read",
  "subject": "Reports",
  "description": "View reports"
}
```

**Valid Actions:**
- `create`, `read`, `update`, `delete`, `manage`

**Guards:** `AdminGuard`

#### Update Permission

```http
PUT /permissions/:id
```

**Request Body:**
```json
{
  "description": "Updated description"
}
```

**Note:** Only description can be updated. Action and subject are immutable.

**Guards:** `AdminGuard`

#### Delete Permission

```http
DELETE /permissions/:id
```

**Guards:** `AdminGuard`

**Error:** Returns 400 if permission is assigned to any role

#### Get Roles Using Permission

```http
GET /permissions/:id/roles
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "ADMIN_BGN"
  }
]
```

---

### Menus

#### Get Menu Tree

```http
GET /menus/tree
```

**Response (hierarchical structure):**
```json
[
  {
    "id": "uuid",
    "name": "Dashboard",
    "path": "/dashboard",
    "icon": "Home",
    "order": 1,
    "parentId": null,
    "requiredPermission": "read:Dashboard",
    "metadata": {},
    "children": [],
    "createdAt": "2026-03-16T10:00:00Z",
    "updatedAt": "2026-03-16T10:00:00Z"
  }
]
```

**Guards:** None (public)

#### Get User Menu

```http
GET /menus/user/:roleId
```

**Response:** Filtered menu tree based on role permissions

**Guards:** None (public)

#### Get Menu by ID

```http
GET /menus/:id
```

#### Create Menu

```http
POST /menus
```

**Request Body:**
```json
{
  "name": "Reports",
  "path": "/reports",
  "icon": "FileText",
  "order": 5,
  "parentId": null,
  "requiredPermission": "read:Reports",
  "metadata": {
    "title_en": "Reports",
    "title_id": "Laporan"
  }
}
```

**Guards:** `AdminGuard`

#### Update Menu

```http
PUT /menus/:id
```

**Guards:** `AdminGuard`

**Validation:** Prevents circular parent references

#### Delete Menu

```http
DELETE /menus/:id
```

**Guards:** `AdminGuard`

**Error:** Returns 400 if menu has children

#### Assign Roles to Menu

```http
POST /menus/:id/roles
```

**Request Body:**
```json
{
  "roleIds": ["uuid1", "uuid2"]
}
```

**Guards:** `AdminGuard`

#### Remove Role from Menu

```http
DELETE /menus/:id/roles/:roleId
```

**Guards:** `AdminGuard`

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Role not found"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "Role with this name already exists"
}
```

## Rate Limiting

Not implemented yet. Consider adding rate limiting for production.

## Pagination

All list endpoints support pagination:
- Default page size: 20
- Maximum page size: 100
- Page numbers start at 1

## Caching

Permissions are cached in Redis with 5-minute TTL. Cache is automatically invalidated on:
- Permission assignment/removal
- Role updates
- Permission updates

## Authorization Guards

### AdminGuard

Restricts access to ADMIN_BGN role only.

### PermissionsGuard

Validates fine-grained CASL permissions.

Usage example:
```typescript
@UseGuards(PermissionsGuard)
@Permissions('read:Dashboard', 'update:Dashboard')
@Get('sensitive-data')
```

### RolesGuard

Validates user has one of specified roles.

Usage example:
```typescript
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN_BGN, UserRole.COORDINATOR_SPPG)
@Get('admin-data')
```

## Examples

### Create Role and Assign Permissions

```bash
# 1. Create role
curl -X POST http://localhost:3001/api/v1/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"EDITOR","description":"Content editor"}'

# 2. Add permissions
curl -X POST http://localhost:3001/api/v1/roles/{roleId}/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissionIds":["perm1","perm2"]}'
```

### Configure Menu Hierarchy

```bash
# 1. Create parent menu
curl -X POST http://localhost:3001/api/v1/menus \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Settings",
    "path":"/settings",
    "icon":"Settings",
    "order":10
  }'

# 2. Create child menu
curl -X POST http://localhost:3001/api/v1/menus \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Users",
    "path":"/settings/users",
    "icon":"Users",
    "order":1,
    "parentId":"parent-menu-id"
  }'
```
