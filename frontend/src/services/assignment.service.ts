/**
 * Assignment Service — EEC EAMS
 * Handles API communication with Express backend /api/assignments endpoints.
 */

import apiClient from '../lib/axios';
import {
  AssetAssignment,
  AssignAssetInput,
  TransferAssetInput,
  ReturnAssetInput,
  AssignmentQueryParams,
  AssignmentStats,
} from '../constants/assignments';

export interface AssignmentsResponse {
  success: boolean;
  data: AssetAssignment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AssignmentResponse {
  success: boolean;
  message?: string;
  data: AssetAssignment;
}

export interface AssignmentHistoryResponse {
  success: boolean;
  data: AssetAssignment[];
}

export interface AssignmentStatsResponse {
  success: boolean;
  data: AssignmentStats;
}

export const assignmentService = {
  /**
   * GET /api/assignments — list assignments with filters & pagination
   */
  async getAll(params?: AssignmentQueryParams): Promise<AssignmentsResponse> {
    const res = await apiClient.get<AssignmentsResponse>('/assignments', { params });
    return res.data;
  },

  /**
   * GET /api/assignments/:id — retrieve single assignment record
   */
  async getById(id: string): Promise<AssignmentResponse> {
    const res = await apiClient.get<AssignmentResponse>(`/assignments/${id}`);
    return res.data;
  },

  /**
   * GET /api/assignments/history/:assetId — retrieve chronological assignment history
   */
  async getHistory(assetId: string): Promise<AssignmentHistoryResponse> {
    const res = await apiClient.get<AssignmentHistoryResponse>(`/assignments/history/${assetId}`);
    return res.data;
  },

  /**
   * POST /api/assignments/assign — assign an available asset to an active employee
   */
  async assign(data: AssignAssetInput): Promise<AssignmentResponse> {
    const res = await apiClient.post<AssignmentResponse>('/assignments/assign', data);
    return res.data;
  },

  /**
   * PATCH /api/assignments/transfer/:assetId — transfer an assigned asset to another employee
   */
  async transfer(assetId: string, data: TransferAssetInput): Promise<AssignmentResponse> {
    const res = await apiClient.patch<AssignmentResponse>(`/assignments/transfer/${assetId}`, data);
    return res.data;
  },

  /**
   * PATCH /api/assignments/return/:assetId — return an assigned asset to available inventory
   */
  async returnAsset(assetId: string, data: ReturnAssetInput): Promise<AssignmentResponse> {
    const res = await apiClient.patch<AssignmentResponse>(`/assignments/return/${assetId}`, data);
    return res.data;
  },

  /**
   * GET /api/assignments/stats — dashboard and KPI assignment metrics
   */
  async getStats(): Promise<AssignmentStatsResponse> {
    const res = await apiClient.get<AssignmentStatsResponse>('/assignments/stats');
    return res.data;
  },
};

export default assignmentService;
