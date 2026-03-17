## ADDED Requirements

### Requirement: Mandatory Live Incident Capture
The incident reporting system SHALL only allow photo or video capture through the live camera interface.

#### Scenario: Blocked Gallery Access
- **WHEN** a vendor attempts to upload a photo for an incident
- **THEN** the system SHALL NOT provide an option to select from the gallery

### Requirement: AI-Driven Incident Validation
The system SHALL use AI to analyze submitted incident photos for authenticity (e.g., detecting a flat tire or engine smoke).

#### Scenario: Verified Flat Tire Report
- **WHEN** a vendor submits a live photo of a flat tire
- **THEN** AI SHALL confirm the incident and reduce the late arrival penalty from -10 to -2 points

### Requirement: Severe Penalty for Fraudulent Reports
The system SHALL deduct 50 points from the daily score if a reported incident is proven to be fake.

#### Scenario: Fraud Detection
- **WHEN** AI or BGN Admin identifies a fraudulent incident report
- **THEN** the vendor SHALL immediately receive a -50 point penalty
