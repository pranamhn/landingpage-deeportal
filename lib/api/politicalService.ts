import apiClient from "@/lib/api/client";
import type { RegionPoliticalProfile, DapilAnalysis, IssuePlan, PoliticalScore } from "@/types/political";

const BASE = "/v1/political";

export async function getRegionPoliticalProfile(regionCode: string): Promise<{ success: boolean; data?: RegionPoliticalProfile }> {
  try {
    const resp = await apiClient.get(`${BASE}/regions/${regionCode}/profile`);
    return { success: resp.data.success, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function getElectoralMap(year?: string, electionType?: string, level?: string): Promise<{ success: boolean; data?: { results: Record<string, unknown>[]; total_regions: number } }> {
  try {
    const resp = await apiClient.get(`${BASE}/maps/electoral`, { params: { year, election_type: electionType, level } });
    return { success: true, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function analyzeDapil(dapilCode: string, year?: string): Promise<{ success: boolean; data?: DapilAnalysis }> {
  try {
    const resp = await apiClient.post(`${BASE}/dapil/analyze`, { dapil_code: dapilCode, year });
    return { success: resp.data.success, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function generateIssuePlan(regionCode: string, topics?: string[]): Promise<{ success: boolean; data?: IssuePlan }> {
  try {
    const resp = await apiClient.post(`${BASE}/issue-plan`, { region_code: regionCode, topics });
    return { success: resp.data.success, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function getPoliticalScores(regionCode: string): Promise<{ success: boolean; data?: PoliticalScore[] }> {
  try {
    const resp = await apiClient.get(`${BASE}/scores/${regionCode}`);
    return { success: resp.data.success, data: resp.data.data };
  } catch {
    return { success: false };
  }
}
