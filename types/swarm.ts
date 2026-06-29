// ── Swarm Deeportal — Frontend Types ──

export type SwarmMode = "social_sentiment" | "investment_prediction";
export type SocialSubType = "general" | "political_election" | "ipo_sentiment" | "crisis_sentiment";
export type PredictionType = "funding" | "acquisition" | "ipo" | "market_dynamics" | "business_risk" | "pricing" | "customer_behavior" | "competitive_response";
export type ElectionType = "gubernur" | "bupati" | "walikota" | "presiden" | "caleg";
export type SimulationMode = "fast" | "balanced" | "deep";
export type ProjectStatus = "draft" | "simulating" | "completed" | "failed" | "cancelled";

export interface SwarmProject {
  id: string;
  userId: string;
  title: string;
  mode: SwarmMode;
  subType?: SocialSubType;
  electionType?: ElectionType;
  region?: string;
  platforms?: string[];
  seedTopics?: string[];
  candidates?: { name: string; party: string; twitterHandle?: string }[];
  predictionType?: PredictionType;
  timeHorizon?: string;
  simulationMode?: SimulationMode;
  markets?: string[];
  scenarios?: string[];
  objective?: string;
  targetEntity?: string;
  agentCount: number;
  loops: number;
  status: ProjectStatus;
  progress: number;
  currentStep?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SwarmReport {
  id: string;
  projectId: string;
  mode: SwarmMode;
  summary: string;
  score: SwarmScore;
  keyFindings: { title: string; description: string; confidence: number }[];
  risks: { type: string; description: string; severity: string; probability: number; mitigation?: string }[];
  opportunities: { type: string; description: string; potentialImpact: string }[];
  recommendations: { action: string; rationale: string; priority: string }[];
  rawMarkdown?: string;
  createdAt: string;
}

export interface SwarmScore {
  sentimentScore?: number;
  viralityProbability?: number;
  predictionScore?: number;
  electabilityForecast?: Record<string, number>;
  confidenceScore: number;
  subScores?: { name: string; score: number; weight: number }[];
}

export interface SimulationRun {
  id: string;
  projectId: string;
  mode: SwarmMode;
  scenarioName: string;
  status: string;
  currentLoop: number;
  totalLoops: number;
}

export interface ProgressEvent {
  status: string;
  progress: number;
  currentStep?: string;
  currentLoop?: number;
  totalLoops?: number;
  error?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "agent";
  content: string;
  agentId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
