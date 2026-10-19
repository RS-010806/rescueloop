export type WorkflowStage = 'vision' | 'safety' | 'matching' | 'logistics' | 'impact';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'flagged' | 'blocked' | 'error';

export type IncidentStatus = 'draft' | 'analyzing' | 'pending_approval' | 'approved' | 'dispatched' | 'completed';

export interface FoodItemBreakdown {
  name: string;
  category: 'protein' | 'carbohydrate' | 'vegetable' | 'dairy' | 'bakery' | 'prepared_meal' | 'other';
  estimatedPortions: number;
  confidence: number; // 0 to 1
  packaging: string;
  storageTempActualC?: number;
  allergens: string[];
}

export interface IncidentData {
  id: string;
  title: string;
  venueType: 'college_event' | 'restaurant' | 'hotel' | 'cafeteria' | 'corporate';
  locationAddress: string;
  isSimulatedData: boolean;
  contactName: string;
  contactPhone: string;
  reportedPortions: number;
  reportedWeightKg?: number;
  preparationTime: string; // ISO string or time string
  pickupDeadline: string; // ISO string or time string
  storageMethod: 'hot_hold' | 'refrigerated' | 'ambient' | 'frozen';
  storageTempC: number;
  temperatureVerified: boolean;
  venueSafetyClearanceGranted: boolean;
  venueSafetyOfficerName: string;
  declaredAllergens: string[];
  dietaryTags: string[]; // 'halal', 'vegetarian', 'vegan', 'gluten-free', 'nut-free'
  rawDescription: string;
  imageUrl?: string;
  imageFileName?: string;
}

export interface RecipientOrg {
  id: string;
  name: string;
  type: 'community_kitchen' | 'homeless_shelter' | 'youth_center' | 'food_pantry' | 'senior_care';
  address: string;
  distanceKm: number;
  declaredCapacityPortions: number;
  allocatedPortions: number;
  operatingHours: string;
  acceptsHotFood: boolean;
  acceptsChilledFood: boolean;
  dietaryRequirements: string[];
  contactPerson: string;
  contactPhone: string;
  isSimulatedData: boolean;
  matchScore?: number;
  matchReasons?: string[];
}

export interface VisionAgentOutput {
  identifiedItems: FoodItemBreakdown[];
  estimatedTotalPortions: number;
  confidenceScore: number; // 0 to 100
  portionUncertaintyRange: [number, number];
  uncertaintyStatement: string;
  missingInformationRequests: string[];
  visualObservations: string[];
}

export interface SafetyGateAgentOutput {
  status: 'cleared' | 'flagged_for_human_review' | 'blocked';
  clearedQuantityPortions: number;
  temperatureCompliance: {
    passed: boolean;
    requiredRange: string;
    actualValue: string;
    notes: string;
  };
  timeCompliance: {
    passed: boolean;
    durationSincePrepHours: number;
    maxAllowedHours: number;
  };
  allergenVerification: {
    passed: boolean;
    disclosedAllergens: string[];
    riskNotes: string;
  };
  venueAuthorization: {
    passed: boolean;
    authorizedOfficer: string;
    clearanceNotes: string;
  };
  safetyDisclaimer: string;
  blockers: string[];
  recommendations: string[];
}

export interface MatchingAgentOutput {
  rankedRecipients: {
    recipientId: string;
    recipientName: string;
    score: number; // 0 to 100
    distanceKm: number;
    capacityAvailable: number;
    dietaryCompatibility: string[];
    urgencyMatch: boolean;
    rankingJustification: string;
  }[];
  selectionSummary: string;
}

export interface LogisticsAgentOutput {
  status: 'balanced' | 'partial' | 'unbalanced';
  totalClearedPortions: number;
  totalAllocatedPortions: number;
  unallocatedPortions: number;
  allocations: {
    recipientId: string;
    recipientName: string;
    allocatedPortions: number;
    vehicleRecommendation: string;
    estimatedTransitMins: number;
    pickupWindow: string;
    priorityOrder: number;
  }[];
  routeProposal: {
    stopNumber: number;
    destinationName: string;
    address: string;
    action: string;
    estArrivalTime: string;
    handlingNotes: string;
  }[];
  dockHandoffInstructions: string[];
}

export interface ImpactAgentOutput {
  portionsReported: number;
  portionsCleared: number;
  portionsAllocated: number;
  portionsCollected: number; // verified only after collection
  estimatedWeightKg: number;
  environmentalEstimates: {
    co2eAvoidedKg: number;
    waterSavedLiters: number;
    landfillDivertedKg: number;
  };
  methodologyAssumptions: {
    averageServingWeightKg: number;
    co2PerKgFood: number;
    waterPerServingLiters: number;
    source: string;
  };
  auditNote: string;
}

export interface AgentExecutionState {
  stage: WorkflowStage;
  agentName: string;
  roleDescription: string;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  findingsSummary: string;
  blockers: string[];
  outputData: any;
  executionTimeMs?: number;
}

export interface OrchestrationResult {
  incidentId: string;
  completedAt: string;
  status: 'success' | 'blocked' | 'flagged' | 'error';
  agents: {
    vision: VisionAgentOutput;
    safety: SafetyGateAgentOutput;
    matching: MatchingAgentOutput;
    logistics: LogisticsAgentOutput;
    impact: ImpactAgentOutput;
  };
  executionStates: Record<WorkflowStage, AgentExecutionState>;
  isFallback: boolean;
  errorMessage?: string;
}
