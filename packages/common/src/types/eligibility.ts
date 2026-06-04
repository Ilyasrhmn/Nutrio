/** A document the vendor needs to obtain. */
export interface DocumentRequirement {
  name: string;
  estimatedDays?: number;   // working days to obtain
  estimatedCost?: number;   // IDR
  regulationRef?: string;
}

/** Contextual flag shown on the roadmap result. */
export interface RoadmapFlag {
  type: 'info' | 'warning' | 'critical';
  message: string;
}

/** Full eligibility roadmap returned after wizard completion. */
export interface PersonalRoadmap {
  /** Documents the vendor already possesses. */
  docsHave: string[];
  /** Documents the vendor is currently processing. */
  docsInProgress: DocumentRequirement[];
  /** Documents the vendor still needs to obtain. */
  docsMissing: DocumentRequirement[];
  /** Additional flags / warnings. */
  flags: RoadmapFlag[];
  /** 0-100 score indicating overall readiness. */
  eligibilityScore: number;
  /** Maximum of all missing document estimated days. */
  estimatedDaysToReady: number;
  /** One concrete recommended next action. */
  recommendedNextStep: string;
}
