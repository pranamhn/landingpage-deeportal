import type {
  AdminDataQualityData,
  AdminIngestionData,
  AdminIngestionFullData,
  AdminModerationDetail,
  AdminOverviewData,
  AdminStatsData,
  AdminSystemData,
  AdminTableName,
  AdminTableData,
} from "@/types/admin";
import {
  getDataQualityFromJson,
  getIngestionFromJson,
  getIngestionFullData,
  getModerationQueueFromJson,
  getOverviewFromJson,
  getAdminStats,
  getAdminTableData,
  updateAdminTableRow,
  getSystemFromJson,
} from "@/lib/adminJsonAdapter";

export async function getAdminOverview(): Promise<AdminOverviewData> {
  return getOverviewFromJson();
}

export async function getAdminIngestion(): Promise<AdminIngestionData> {
  return getIngestionFromJson();
}

export async function getAdminIngestionFull(): Promise<AdminIngestionFullData> {
  return getIngestionFullData();
}

export async function getAdminDataQuality(): Promise<AdminDataQualityData> {
  return getDataQualityFromJson();
}

export async function getAdminModerationQueue(
  params?: { status?: string; kind?: string; search?: string; page?: number },
): Promise<{ items: AdminModerationDetail[]; total: number; page: number; has_next: boolean }> {
  return getModerationQueueFromJson(params);
}

export async function getAdminSystem(): Promise<AdminSystemData> {
  return getSystemFromJson();
}

export async function getAdminDashboardStats(): Promise<AdminStatsData> {
  return getAdminStats();
}

export async function fetchAdminTableData<T = Record<string, unknown>>(
  table: AdminTableName,
  params?: { page?: number; per_page?: number; search?: string; sort_by?: string; order?: string },
): Promise<AdminTableData<T>> {
  return getAdminTableData<T>(table, params);
}

export async function editAdminTableRow<T = Record<string, unknown>>(
  table: AdminTableName,
  rowId: string,
  updates: Record<string, unknown>,
) {
  return updateAdminTableRow<T>(table, rowId, updates);
}
