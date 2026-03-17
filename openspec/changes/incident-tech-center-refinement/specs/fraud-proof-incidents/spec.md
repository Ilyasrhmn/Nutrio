## MODIFIED Requirements

### Requirement: AI-Driven Incident Validation
The system SHALL use AI and device sensor data to analyze submitted incident photos and technical reports for authenticity.

#### Scenario: Verified Flat Tire Report
- **WHEN** a vendor submits a live photo of a flat tire
- **THEN** AI SHALL confirm the incident visual and cross-check with GPS telemetri to reduce the late arrival penalty from -10 to -2 points
