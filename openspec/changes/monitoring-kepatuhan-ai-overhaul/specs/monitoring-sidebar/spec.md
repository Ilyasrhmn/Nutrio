## ADDED Requirements

### Requirement: Structured Monitoring Navigation
The system SHALL provide a grouped navigation menu in the sidebar specifically for monitoring and compliance activities.

#### Scenario: Expandable Monitoring Menu
- **WHEN** user clicks on the "Monitoring & Kepatuhan AI" menu item
- **THEN** the menu expands to reveal sub-menus: Eksekusi Checkpoint, Skor & Performa, Arsip Validasi AI, and Pusat Kendali & SOP

### Requirement: Real-time Status Indicators
The sidebar SHALL display visual status indicators (dots) next to the Monitoring menu to reflect the current operational state.

#### Scenario: Visual Warning for Imminent Deadline
- **WHEN** a checkpoint deadline is less than 10 minutes away
- **THEN** a yellow dot indicator SHALL appear next to the "Monitoring & Kepatuhan AI" menu
