import apiClient from "@/lib/api/client";
import type { RegionProfile, RegionRanking, SegmentDefinition, SegmentResult } from "@/types/population";

const BASE = "/v1/population";

export async function getRegionProfile(regionCode: string): Promise<{ success: boolean; data?: RegionProfile; message?: string }> {
  try {
    const resp = await apiClient.get(`${BASE}/region/${regionCode}`);
    return { success: resp.data.success, data: resp.data.data };
  } catch {
    return { success: false, message: "Failed to fetch region" };
  }
}

export async function listRegions(params?: { page?: number; limit?: number; type?: string }): Promise<{ success: boolean; data?: { items: RegionProfile["region"][]; total: number; page: number; limit: number; hasMore: boolean } }> {
  try {
    const resp = await apiClient.get(`${BASE}/regions`, { params });
    return { success: true, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function getRegionRanking(metric?: string, limit?: number): Promise<{ success: boolean; data?: RegionRanking[] }> {
  try {
    const resp = await apiClient.get(`${BASE}/regions/ranking`, { params: { metric, limit } });
    return { success: true, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function buildSegment(segment: SegmentDefinition): Promise<{ success: boolean; data?: SegmentResult }> {
  try {
    const resp = await apiClient.post(`${BASE}/segment/build`, segment);
    return { success: resp.data.success, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function getPopulationStats(): Promise<{ success: boolean; data?: { total_population: number; total_regions: number; average_hdi: number } }> {
  try {
    const resp = await apiClient.get(`${BASE}/stats`);
    return { success: resp.data.success, data: resp.data.data };
  } catch {
    return { success: false };
  }
}
