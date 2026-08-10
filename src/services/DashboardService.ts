import { apiService } from './api';
import type { DashboardStats } from '../models';

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>('/api/dashboard/stats');
  }
}

export const dashboardService = new DashboardService();
