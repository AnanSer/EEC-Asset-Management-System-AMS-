import { departmentRepository, DepartmentRepository } from './department.repository';
import { CreateDepartmentDTO, UpdateDepartmentDTO, DepartmentQueryDTO } from './department.validator';

export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class DepartmentService {
  constructor(private repo: DepartmentRepository = departmentRepository) {}

  async getDepartments(query: DepartmentQueryDTO) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    let isActive: boolean | undefined = undefined;
    if (query.status === 'active') isActive = true;
    if (query.status === 'inactive') isActive = false;

    const { departments, total } = await this.repo.findMany({
      search: query.search,
      isActive,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      departments,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getDepartmentById(id: string) {
    const department = await this.repo.findById(id);
    if (!department) {
      throw new AppError(`Department with ID '${id}' not found`, 404);
    }
    return department;
  }

  async createDepartment(data: CreateDepartmentDTO) {
    const existing = await this.repo.findByCode(data.code);
    if (existing) {
      throw new AppError(`Department code '${data.code}' is already in use`, 409);
    }

    return this.repo.create(data);
  }

  async updateDepartment(id: string, data: UpdateDepartmentDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(`Department with ID '${id}' not found`, 404);
    }

    if (data.code && data.code !== existing.code) {
      const codeTaken = await this.repo.findByCode(data.code);
      if (codeTaken) {
        throw new AppError(`Department code '${data.code}' is already in use`, 409);
      }
    }

    return this.repo.update(id, data);
  }

  async updateStatus(id: string, isActive: boolean) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(`Department with ID '${id}' not found`, 404);
    }

    return this.repo.updateStatus(id, isActive);
  }
}

export const departmentService = new DepartmentService();
