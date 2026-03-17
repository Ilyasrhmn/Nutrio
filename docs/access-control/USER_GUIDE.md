# Access Control Management - User Guide

## Overview

The Access Control Management System allows administrators to configure roles, permissions, and menu visibility for all users in the system.

## Accessing Admin Panel

1. **Login** as an admin user (role: `ADMIN_BGN`)
2. Navigate to **Portal** → **Admin** (or `/portal/admin`)
3. You'll see the Access Control dashboard with three main sections:
   - **Roles** - Manage user roles
   - **Permissions** - Configure fine-grained permissions
   - **Menus** - Set up dynamic sidebar menus

## Managing Roles

### View Roles

- Navigate to the **Roles** tab
- See all existing roles with their permission counts
- Use the search bar to filter roles by name

### Create a New Role

1. Click **"New Role"** button
2. Fill in the form:
   - **Name**: Unique role identifier (e.g., `MANAGER`)
   - **Description**: Human-readable description
3. Click **"Create"**

### Edit a Role

1. Click the **Edit** icon next to a role
2. Update name or description
3. Click **"Save"**

### Assign Permissions to a Role

1. Click **Edit** on a role
2. In the permissions section, check the boxes for permissions you want to assign
3. Permissions are grouped by subject (e.g., Dashboard, Users, Funds)
4. Click **"Save"**

### Delete a Role

1. Click the **Delete** icon next to a role
2. **Note:** You cannot delete roles that have users assigned to them
3. Confirm deletion

## Managing Permissions

### View Permissions

- Navigate to the **Permissions** tab
- Permissions are grouped by **Subject** (resource type)
- Click on a subject to expand and see all actions

### Permission Structure

Each permission consists of:
- **Action**: What can be done (`create`, `read`, `update`, `delete`, `manage`)
- **Subject**: The resource type (e.g., `Dashboard`, `User`, `Funds`)
- **Description**: Human-readable explanation

### Create a New Permission

1. Click **"New Permission"** button
2. Fill in the form:
   - **Action**: Select from dropdown
   - **Subject**: Enter resource name (PascalCase recommended)
   - **Description**: Explain what this permission grants
3. Click **"Create"**

**Example:**
- Action: `update`
- Subject: `Reports`
- Description: "Can modify and update reports"

### Edit a Permission

1. Click **Edit** next to a permission
2. **Note:** You can only edit the description
3. Action and subject are immutable once created

### Delete a Permission

1. Click **Delete** next to a permission
2. **Note:** You cannot delete permissions that are assigned to roles
3. The system will show which roles use this permission
4. Remove the permission from all roles first, then delete

### View Permission Usage

- Click on any permission to see:
  - Which roles have this permission
  - How many users are affected

## Managing Menus

### View Menu Structure

- Navigate to the **Menus** tab
- See hierarchical menu tree
- Parent menus can be expanded to show children

### Create a Menu Item

1. Click **"New Menu Item"** button
2. Fill in the form:
   - **Name**: Display name (e.g., "Dashboard")
   - **Path**: URL path (e.g., "/dashboard")
   - **Icon**: Lucide React icon name (e.g., "Home")
   - **Order**: Display order (lower numbers appear first)
   - **Parent**: Optional parent menu for hierarchy
   - **Required Permission**: Optional permission check (e.g., "read:Dashboard")
   - **Metadata**: Optional JSON data (e.g., translations)
3. Click **"Create"**

### Create a Submenu

1. When creating a menu item, select a **Parent** menu
2. The submenu will appear nested under its parent
3. Order determines position among siblings

### Reorder Menus

- **Desktop**: Drag and drop menu items (if enabled)
- **Alternative**: Edit menu and change the **Order** field

### Assign Roles to Menu

1. Click **Edit** on a menu item
2. Select which roles can see this menu item
3. Users with those roles will see the menu in their sidebar
4. Click **"Save"**

### Delete a Menu Item

1. Click **Delete** next to a menu item
2. **Note:** You cannot delete menus that have children
3. Delete all children first, or reassign them to a different parent

## Role-Based Menu Visibility

How menu visibility works:

1. **No Roles Assigned**: Menu visible to all authenticated users
2. **Roles Assigned**: Menu visible only to users with assigned roles
3. **Required Permission**: Additional permission check on top of role check
4. **Hierarchy**: If parent is hidden, children are also hidden

**Example Configuration:**

```
Settings (visible to: ADMIN_BGN, MANAGER)
├── Users (visible to: ADMIN_BGN) + requires "manage:User"
└── Profile (visible to: all)
```

Result:
- Admins see: Settings > Users, Profile
- Managers see: Settings > Profile
- Others: Don't see Settings at all

## Permission Hierarchy

The `manage` action implies all other actions:

- `manage:User` grants: `create:User`, `read:User`, `update:User`, `delete:User`
- `manage:all` grants: All permissions on all subjects

## Best Practices

### Role Naming

- Use UPPERCASE_SNAKE_CASE (e.g., `ADMIN_BGN`, `COORDINATOR_SPPG`)
- Keep names concise and descriptive
- Use role names that match business roles

### Permission Naming

- **Subjects**: Use PascalCase (e.g., `Dashboard`, `User`, `Funds`)
- **Actions**: Use lowercase verbs (e.g., `read`, `update`, `delete`)
- Be specific: `read:UserProfile` vs `read:User`

### Menu Structure

- Keep hierarchy max 2-3 levels deep
- Group related items under parent menus
- Use clear, action-oriented names
- Set appropriate icons for visual scanning

### Security

- **Principle of least privilege**: Give users only permissions they need
- Review role permissions regularly
- Don't create overly broad permissions
- Use `manage` action sparingly

## Troubleshooting

### "Cannot delete role with assigned users"

- Go to Users management
- Reassign users to different role
- Then delete the role

### "Cannot delete permission assigned to roles"

- Edit each role that uses this permission
- Remove the permission
- Then delete the permission

### Menu not appearing

Check:
1. Is the menu assigned to user's role?
2. Does user have required permission (if specified)?
3. Is parent menu visible?
4. Is menu order correct?

### Changes not reflecting

- **Permissions**: Logout and login again (JWT refresh)
- **Menus**: Refresh the page
- **Cache**: Wait up to 5 minutes or ask admin to clear cache

## Keyboard Shortcuts

- **Search**: Focus search box with `/`
- **Close modal**: Press `Esc`
- **Submit form**: Press `Ctrl+Enter` (in modals)

## Mobile Usage

On mobile devices:
- Use hamburger menu (☰) to access navigation
- Tables switch to card view for better readability
- Swipe to expand/collapse sections

## Support

For issues or questions:
- Check system logs in browser console (F12)
- Contact system administrator
- Refer to technical documentation
