import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_URL, isDevelopment } from '../constants';
import { tokenStorage } from './tokenStorage';

/**
 * IMPORTANT: the backend sends errors as a PLAIN TEXT string body
 * (`res.status(code).send(error.message)`), not JSON `{message: ...}`. `error.response.data`
 * is therefore usually already a string here — never `.message` off it.
 */
export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function extractErrorMessage(error: AxiosError): string {
  const data = error.response?.data;
  if (typeof data === 'string' && data.trim().length > 0) {
    return data;
  }
  // Defensive fallback in case a future endpoint ever responds with JSON instead.
  if (data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)) {
    const message = (data as Record<string, unknown>).message;
    if (typeof message === 'string') return message;
  }
  if (error.response?.statusText) return error.response.statusText;
  return error.message || 'An unknown error occurred';
}

export type UnauthorizedHandler = () => void;

type RequestConfig = AxiosRequestConfig & { skipAuth?: boolean };

class ApiService {
  private static instance: ApiService;
  private readonly api: AxiosInstance;
  private unauthorizedHandler: UnauthorizedHandler | null = null;

  // Refresh-token mutex: concurrent 401s should trigger exactly one /auth/refresh call,
  // with every other pending request awaiting the same in-flight promise.
  private refreshPromise: Promise<string | null> | null = null;

  private constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      const skipAuth = (config as RequestConfig).skipAuth;
      if (!skipAuth) {
        const token = await tokenStorage.getAccessToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      if (isDevelopment) {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as (RequestConfig & { _retry?: boolean }) | undefined;
        const status = error.response?.status;
        const url = originalRequest?.url || '';
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/signup') || url.includes('/auth/refresh');

        if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true;
          const newAccessToken = await this.refreshAccessToken();
          if (newAccessToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.api.request(originalRequest);
          }
          await tokenStorage.clear();
          this.unauthorizedHandler?.();
        }

        return Promise.reject(new ApiError(extractErrorMessage(error), status));
      },
    );
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /** Registered once by AuthContext so the interceptor can force a logout on refresh failure. */
  setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
    this.unauthorizedHandler = handler;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) return null;

        const response = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${API_URL}/api/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        await tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
        return response.data.accessToken;
      } catch {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  /** Exposed for callers that need the raw axios instance (e.g. file downloads). */
  getAxios(): AxiosInstance {
    return this.api;
  }
}

export const apiService = ApiService.getInstance();

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unknown error occurred';
};
