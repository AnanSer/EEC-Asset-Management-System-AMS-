import { reportRepository, ReportRepository } from './report.repository';

export class ReportService {
  constructor(private repository: ReportRepository = reportRepository) {}

  async getDashboard() {
    return await this.repository.getDashboardMetrics();
  }

  async getAssets(query: any) {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const result = await this.repository.getAssetsReport({
      search: query.search as string,
      category: query.category as string,
      status: query.status as string,
      condition: query.condition as string,
      departmentId: query.departmentId as string,
      skip,
      take: limit,
    });

    return {
      data: result.assets,
      summary: {
        totalValue: result.totalValue,
      },
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getEmployees(query: any) {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    let isActive: boolean | undefined = undefined;
    if (query.isActive === 'true') isActive = true;
    if (query.isActive === 'false') isActive = false;

    const result = await this.repository.getEmployeesReport({
      search: query.search as string,
      departmentId: query.departmentId as string,
      isActive,
      skip,
      take: limit,
    });

    return {
      data: result.employees,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getDepartments(query: any) {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    let isActive: boolean | undefined = undefined;
    if (query.isActive === 'true') isActive = true;
    if (query.isActive === 'false') isActive = false;

    const result = await this.repository.getDepartmentsReport({
      search: query.search as string,
      isActive,
      skip,
      take: limit,
    });

    return {
      data: result.departments,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getMaintenance(query: any) {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const result = await this.repository.getMaintenanceReport({
      search: query.search as string,
      status: query.status as string,
      priority: query.priority as string,
      category: query.category as string,
      skip,
      take: limit,
    });

    return {
      data: result.tickets,
      summary: {
        totalCost: result.totalCost,
      },
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getWarranty(query: any) {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const result = await this.repository.getWarrantyReport({
      search: query.search as string,
      timeframe: query.timeframe as any,
      departmentId: query.departmentId as string,
      skip,
      take: limit,
    });

    return {
      data: result.assets,
      buckets: result.buckets,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}

export const reportService = new ReportService();
