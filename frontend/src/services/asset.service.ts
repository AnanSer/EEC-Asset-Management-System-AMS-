/**
 * Asset Service — EEC EAMS
 * Handles API communication with Express backend /api/assets endpoints.
 */

import apiClient from '../lib/axios';
import {
  CreateAssetInput,
  UpdateAssetInput,
  AssetQuery,
  AssetsResponse,
  AssetResponse,
} from '../constants/assets';

export const assetService = {
  /**
   * GET /api/assets — list assets with search, filters & pagination
   */
  async getAll(params?: AssetQuery): Promise<AssetsResponse> {
    const res = await apiClient.get<AssetsResponse>('/assets', { params });
    return res.data;
  },

  /**
   * GET /api/assets/:id — retrieve single asset with department & counts
   */
  async getById(id: string): Promise<AssetResponse> {
    const res = await apiClient.get<AssetResponse>(`/assets/${id}`);
    return res.data;
  },

  /**
   * POST /api/assets — register a new asset
   */
  async create(data: CreateAssetInput): Promise<AssetResponse> {
    const res = await apiClient.post<AssetResponse>('/assets', data);
    return res.data;
  },

  /**
   * PUT /api/assets/:id — update existing asset
   */
  async update(id: string, data: UpdateAssetInput): Promise<AssetResponse> {
    const res = await apiClient.put<AssetResponse>(`/assets/${id}`, data);
    return res.data;
  },

  /**
   * PATCH /api/assets/:id/status — change asset status
   */
  async updateStatus(id: string, status: string): Promise<AssetResponse> {
    const res = await apiClient.patch<AssetResponse>(`/assets/${id}/status`, { status });
    return res.data;
  },
};

export default assetService;
