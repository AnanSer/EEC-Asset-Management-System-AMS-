import prisma from '../../lib/prisma';
import { CreateDepartmentDTO, UpdateDepartmentDTO } from './department.validator';

export class DepartmentRepository {
  async findMany(params: {
    search?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { search, isActive, skip, take } = params;

    const where: any = {};

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { code: { contains: term, mode: 'insensitive' } },
        { building: { contains: term, mode: 'insensitive' } },
        { officeLocation: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              employees: true,
              assets: true,
            },
          },
        },
      }),
      prisma.department.count({ where }),
    ]);

    return { departments, total };
  }

  async findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            employees: true,
            assets: true,
          },
        },
      },
    });
  }

  async findByCode(code: string) {
    return prisma.department.findUnique({
      where: { code },
    });
  }

  async create(data: CreateDepartmentDTO) {
    return prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        location: data.location,
        officeLocation: data.officeLocation,
        building: data.building,
        floor: data.floor,
        headOfDepartment: data.headOfDepartment,
        isActive: data.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            employees: true,
            assets: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateDepartmentDTO) {
    return prisma.department.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.officeLocation !== undefined && { officeLocation: data.officeLocation }),
        ...(data.building !== undefined && { building: data.building }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.headOfDepartment !== undefined && { headOfDepartment: data.headOfDepartment }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        _count: {
          select: {
            employees: true,
            assets: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, isActive: boolean) {
    return prisma.department.update({
      where: { id },
      data: { isActive },
      include: {
        _count: {
          select: {
            employees: true,
            assets: true,
          },
        },
      },
    });
  }
}

export const departmentRepository = new DepartmentRepository();
