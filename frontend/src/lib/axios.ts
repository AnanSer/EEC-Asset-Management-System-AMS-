/**
 * Axios HTTP Client — EEC EAMS
 *
 * A pre-configured Axios instance pointing at the backend API.
 * Base URL is read from the NEXT_PUBLIC_API_URL environment variable.
 *
 * Phase 1: Base config + JSON headers only.
 * Phase 2: Add request/response interceptors, JWT attachment, and 401 handling.
 */

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  timeout: 15_000, // 15 seconds
});

// ─── Phase 2: Add interceptors here ──────────────────────────────────────────
//
// Request interceptor (attach JWT):
// apiClient.interceptors.request.use((config) => {
//   const token = getToken(); // from cookie or localStorage
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
//
// Response interceptor (handle 401 / token refresh):
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) { /* refresh or redirect */ }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
