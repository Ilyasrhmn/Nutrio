## ADDED Requirements

### Requirement: Daily Health Score
The system SHALL maintain a daily operational health score starting at 100 points, which resets every midnight.

#### Scenario: Score Deduction for Late Arrival
- **WHEN** a vendor completes a checkpoint 16-30 minutes past the deadline
- **THEN** the system SHALL deduct 5 points from the daily health score

### Requirement: Incentive Streak System
The system SHALL reward vendors who maintain a high daily score (>95) for 5 consecutive days.

#### Scenario: Streak Achievement
- **WHEN** a vendor reaches a 5-day streak of scores above 95
- **THEN** the system SHALL award a "Gold Vendor" badge and add bonus points or financial priority

### Requirement: Smart Contract Liquidity Lock
The system SHALL automatically flag the Smart Contract for manual review if the daily health score falls below 75.

#### Scenario: Liquidity Suspension
- **WHEN** the daily score drops to 74 or lower
- **THEN** the "Request Funds" button SHALL be disabled and status changed to "Manual Review"
