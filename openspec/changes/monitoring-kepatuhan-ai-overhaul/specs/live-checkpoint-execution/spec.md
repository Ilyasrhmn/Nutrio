## ADDED Requirements

### Requirement: Context-Aware Task Cards
The Live Checkpoint page SHALL only display the currently active checkpoint as an interactive card.

#### Scenario: Active Task Highlight
- **WHEN** the current time is 02:00 WIB (CP1)
- **THEN** the CP1 card SHALL be fully interactive and primary, while future CP cards remain locked

### Requirement: Mandatory AI Validation
The system SHALL require a live photo capture for each checkpoint to be processed by AI for validation.

#### Scenario: Valid Photo Submission
- **WHEN** user submits a clear photo of raw materials at CP1
- **THEN** the AI SHALL validate quantities and mark the checkpoint as "Completed"

### Requirement: Golden Rule 4-Hour Countdown
The system SHALL initiate a 4-hour countdown timer immediately after CP2 (Cooking/Portioning) is completed.

#### Scenario: Warning for Expiring Safety Window
- **WHEN** the 4-hour timer reaches its final 30 minutes
- **THEN** the UI SHALL flash red and display a high-urgency warning
