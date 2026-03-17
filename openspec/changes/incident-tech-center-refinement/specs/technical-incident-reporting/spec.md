## ADDED Requirements

### Requirement: Self-Diagnostic Health Check
The system SHALL provide a self-diagnostic tool to verify the status of essential device sensors (GPS, Camera, Internet) when reporting technical issues.

#### Scenario: Running diagnostics
- **WHEN** user opens the "Kendala Teknis" tab
- **THEN** the system SHALL automatically initiate a health check of GPS, Camera, and Connection status

### Requirement: Technical Bug Reporting
The system SHALL allow vendors to submit detailed bug reports for application issues, including optional screenshots and sensor diagnostic data.

#### Scenario: Submitting a bug report
- **WHEN** user fills the bug report form and clicks "Kirim Tiket"
- **THEN** the system SHALL save the report with the current diagnostic results for helpdesk review
