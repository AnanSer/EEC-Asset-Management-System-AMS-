/**
 * Testing & Inspection Service — EEC EAMS
 * Handles API communication with Express backend /api/testing endpoints.
 */

import apiClient from '../lib/axios';
import {
  InspectionTest,
  CreateInspectionInput,
} from '../constants/maintenance';

export interface InspectionListResponse {
  success: boolean;
  data: InspectionTest[];
}

export interface InspectionResponse {
  success: boolean;
  message?: string;
  data: InspectionTest;
}

export const testingService = {
  /**
   * GET /api/testing/:ticketId — list inspections for a ticket
   */
  async getByTicketId(ticketId: string): Promise<InspectionListResponse> {
    const res = await apiClient.get<InspectionListResponse>(`/testing/${ticketId}`);
    return res.data;
  },

  /**
   * POST /api/testing — create a new inspection record
   */
  async create(data: CreateInspectionInput): Promise<InspectionResponse> {
    const res = await apiClient.post<InspectionResponse>('/testing', data);
    return res.data;
  },

  /**
   * PUT /api/testing/:id — update an inspection record
   */
  async update(id: string, data: Partial<CreateInspectionInput>): Promise<InspectionResponse> {
    const res = await apiClient.put<InspectionResponse>(`/testing/${id}`, data);
    return res.data;
  },
};

export default testingService;
