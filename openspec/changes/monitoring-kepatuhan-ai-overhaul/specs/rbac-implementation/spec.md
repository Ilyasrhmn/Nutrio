## MODIFIED Requirements

### Requirement: Shared Permissions Definitions
The system MUST share permission definitions (Actions and Subjects) between the backend and frontend to ensure consistency, including the new 'Monitoring' subject for the AI-driven compliance cluster.

#### Scenario: Shared actions and subjects
- **WHEN** defining permissions
- **THEN** both the frontend and backend MUST reference the exact same types defined in the `packages/common` workspace.

#### Scenario: Monitoring permission check
- **WHEN** the sidebar evaluates visibility for the Monitoring group
- **THEN** it MUST check `ability.can('read', 'Monitoring')` using the common subject type.
