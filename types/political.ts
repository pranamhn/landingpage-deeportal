// ── Political Intelligence — Frontend Types ──

export interface PoliticalRegion {
  id: string;
  kode_bps: string;
  name: string;
  level: "province" | "city" | "district" | "village" | "tps" | "dapil";
  parent_id?: string;
  dapil_code?: string;
  dapil_name?: string;
  total_voters?: number;
}

export interface DemographicProfile {
  region_id: string;
  year: number;
  total_population: number;
  male?: number;
  female?: number;
  age_0_14?: number;
  age_15_24?: number;
  age_25_34?: number;
  age_35_44?: number;
  age_45_54?: number;
  age_55_64?: number;
  age_65plus?: number;
}

export interface ElectionResult {
  region_id: string;
  year: number;
  election_type: string;
  party: string;
  candidate_name?: string;
  votes: number;
  total_votes: number;
  vote_pct: number;
  rank?: number;
}

export interface PoliticalScore {
  region_id: string;
  score_type: string;
  score: number;
  confidence: number;
}

export interface LocalIssue {
  region_id: string;
  issue_type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  population_affected_pct?: number;
}

export interface RegionPoliticalProfile {
  region: PoliticalRegion;
  demographics: DemographicProfile;
  socioeconomic: Record<string, unknown>;
  elections: ElectionResult[];
  scores: PoliticalScore[];
  issues: LocalIssue[];
}

export interface DapilAnalysis {
  dapil_code: string;
  total_regions: number;
  total_voters: number;
  party_results: Record<string, number>;
  dominant_party: { score: number; dominant_party: string; vote_share: number; margin: number };
}

export interface IssuePlan {
  region_code: string;
  topics_requested: string[];
  issue_priority: { top_issues: LocalIssue[]; region_priority_score: number };
}
