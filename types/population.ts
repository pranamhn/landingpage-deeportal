// ── Population Intelligence — Frontend Types ──

export interface Region {
  id: string;
  kode_bps: string;
  name: string;
  type: "nasional" | "provinsi" | "kabupaten" | "kota" | "kecamatan";
  parent_id?: string;
  area_km2?: number;
}

export interface PopulationData {
  region_id: string;
  year: number;
  total: number;
  male?: number;
  female?: number;
  density?: number;
  growth_rate?: number;
}

export interface SocioeconomicData {
  region_id: string;
  year: number;
  poverty_rate?: number;
  unemployment_rate?: number;
  hdi?: number;
  gini_ratio?: number;
  minimum_wage?: number;
  expenditure_per_capita?: number;
}

export interface RegionProfile {
  region: Region;
  population: PopulationData;
  socioeconomic: SocioeconomicData;
  timestamp: string;
}

export interface AgeGroup {
  region_id: string;
  year: number;
  group_0_4?: number;
  group_5_9?: number;
  group_10_14?: number;
  group_15_19?: number;
  group_20_24?: number;
  group_25_29?: number;
  group_30_34?: number;
  group_35_39?: number;
  group_40_44?: number;
  group_45_49?: number;
  group_50_54?: number;
  group_55_59?: number;
  group_60_64?: number;
  group_65_69?: number;
  group_70_74?: number;
  group_75plus?: number;
}

export interface EmploymentData {
  region_id: string;
  year: number;
  labor_force?: number;
  employed?: number;
  sector_agriculture_pct?: number;
  sector_industry_pct?: number;
  sector_services_pct?: number;
  informal_pct?: number;
}

export interface RegionRanking {
  id: string;
  name: string;
  type: string;
  total?: number;
  density?: number;
  hdi?: number;
  poverty_rate?: number;
  expenditure_per_capita?: number;
  growth_rate?: number;
  opportunity_score: number;
  composite_score?: number;
  percentile?: number;
}

export interface SegmentDefinition {
  region_id?: string;
  age_min?: number;
  age_max?: number;
  income_proxy?: string;
}

export interface SegmentResult {
  region: string;
  segment_definition: SegmentDefinition;
  total_population: number;
  estimated_segment_size: number;
}
