import apiClient from "@/lib/api/client";
import type { SwarmProject, SwarmReport, SimulationRun, ChatMessage, PaginatedResponse } from "@/types/swarm";

const SWARM_URL = "/v1/swarm";

interface NewSwarmPayload {
  title: string;
  mode: string;
  subType?: string;
  electionType?: string;
  region?: string;
  platforms?: string[];
  seedTopics?: string[];
  candidates?: { name: string; party: string }[];
  predictionType?: string;
  timeHorizon?: string;
  simulationMode?: string;
  markets?: string[];
  scenarios?: string[];
  objective?: string;
  targetEntity?: string;
  agentCount?: number;
  loops?: number;
}

// ── Projects ──
export async function createSwarmProject(payload: NewSwarmPayload): Promise<{ success: boolean; data?: SwarmProject; error?: { code: string; message: string } }> {
  try {
    const resp = await apiClient.post(`${SWARM_URL}/projects`, payload);
    return { success: true, data: resp.data.data };
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: { code: string; message: string } } }; message?: string };
    return { success: false, error: e.response?.data?.error || { code: "UNKNOWN", message: e.message || "Failed to create project" } };
  }
}

export async function listSwarmProjects(params?: { page?: number; limit?: number; mode?: string }): Promise<{ success: boolean; data?: PaginatedResponse<SwarmProject> }> {
  try {
    const resp = await apiClient.get(`${SWARM_URL}/projects`, { params });
    return { success: true, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function getSwarmProject(id: string): Promise<{ success: boolean; data?: SwarmProject }> {
  try {
    const resp = await apiClient.get(`${SWARM_URL}/projects/${id}`);
    return { success: true, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

// ── Simulation ──
export async function startSimulation(projectId: string): Promise<{ success: boolean; data?: { jobId: string; status: string; estimatedDuration: string } }> {
  try {
    const resp = await apiClient.post(`${SWARM_URL}/simulation/${projectId}/start`);
    return { success: true, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function getSimulationStatus(projectId: string): Promise<{ success: boolean; data?: { status: string; progress: number; currentStep?: string; runs: SimulationRun[] } }> {
  try {
    const resp = await apiClient.get(`${SWARM_URL}/simulation/${projectId}/status`);
    return { success: true, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function stopSimulation(projectId: string): Promise<{ success: boolean }> {
  try {
    await apiClient.post(`${SWARM_URL}/simulation/${projectId}/stop`);
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ── Report ──
export async function getSwarmReport(projectId: string): Promise<{ success: boolean; data?: SwarmReport }> {
  try {
    const resp = await apiClient.get(`${SWARM_URL}/report/${projectId}/report`);
    return { success: true, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function sendChatMessage(projectId: string, message: string): Promise<{ success: boolean; data?: { answer: string; message: ChatMessage } }> {
  try {
    const resp = await apiClient.post(`${SWARM_URL}/report/${projectId}/chat`, { message, projectId });
    return { success: true, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

export async function getChatMessages(projectId: string): Promise<{ success: boolean; data?: ChatMessage[] }> {
  try {
    const resp = await apiClient.get(`${SWARM_URL}/report/${projectId}/chat`);
    return { success: true, data: resp.data.data };
  } catch {
    return { success: false };
  }
}

// ── SSE Stream URL ──
export function getSimulationStreamUrl(projectId: string): string {
  const baseUrl = typeof window !== "undefined" ? "" : process.env.BACKEND_URL || "http://127.0.0.1:5002";
  return `${baseUrl}/api/swarm/simulation/${projectId}/stream`;
}
