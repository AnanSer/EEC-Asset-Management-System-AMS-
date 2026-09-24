import prisma from '../../lib/prisma';
import { maintenanceRepository, MaintenanceRepository } from './maintenance.repository';
import {
  CreateMaintenanceDTO,
  UpdateMaintenanceDTO,
  UpdateMaintenanceStatusDTO,
  MaintenanceQueryDTO,
} from './maintenance.validator';
import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class MaintenanceService {
  constructor(private repo: MaintenanceRepository = maintenanceRepository) {}

  private formatTicket(ticket: any) {
    if (!ticket) return null;

    const currentAssignment = ticket.asset?.assignments?.[0];
    const currentHolder = currentAssignment?.employee
      ? {
          id: currentAssignment.employee.id,
          employeeId: currentAssignment.employee.employeeId,
          fullName: `${currentAssignment.employee.firstName} ${currentAssignment.employee.lastName}`.trim(),
          departmentName: currentAssignment.employee.department?.name,
        }
      : null;

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      assetId: ticket.assetId,
      category: ticket.title,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      cost: ticket.cost ? Number(ticket.cost) : null,
      startDate: ticket.startDate,
      completedDate: ticket.completedDate,
      reportedBy: ticket.reportedBy,
      assignedTechnician: ticket.assignedTechnician,
      resolutionNotes: ticket.resolutionNotes,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      asset: ticket.asset
        ? {
            id: ticket.asset.id,
            assetCode: ticket.asset.assetCode,
            name: ticket.asset.name,
            category: ticket.asset.category,
            brand: ticket.asset.brand,
            model: ticket.asset.model,
            serialNumber: ticket.asset.serialNumber,
            status: ticket.asset.status,
            condition: ticket.asset.condition,
            department: ticket.asset.department,
            currentHolder,
          }
        : null,
      inspectionTests: ticket.inspectionTests || [],
      latestInspection: ticket.inspectionTests?.[0] || null,
    };
  }

  async getTickets(query: MaintenanceQueryDTO) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const { tickets, total } = await this.repo.findMany({
      search: query.search,
      status: query.status,
      priority: query.priority,
      category: query.category,
      technician: query.technician,
      assetId: query.assetId,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      tickets: tickets.map((t) => this.formatTicket(t)),
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

  async getTicketById(id: string) {
    const ticket = await this.repo.findById(id);
    if (!ticket) {
      throw new AppError(`Maintenance ticket with ID '${id}' not found`, 404);
    }
    return this.formatTicket(ticket);
  }

  async createTicket(data: CreateMaintenanceDTO) {
    // 1. Validate Asset
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
      include: { assignments: { where: { isCurrent: true } } },
    });
    if (!asset) {
      throw new AppError(`Asset with ID '${data.assetId}' not found`, 404);
    }

    if (asset.status === 'RETIRED' || asset.status === 'DISPOSED') {
      throw new AppError(`Cannot create maintenance ticket for ${asset.status.toLowerCase()} asset`, 422);
    }

    // 2. Validate Technician (if provided as employeeId, employee UUID, email, or name)
    if (data.assignedTechnician) {
      const parts = data.assignedTechnician.trim().split(/\s+/);
      const firstNamePart = parts[0] || '';
      const lastNamePart = parts.slice(1).join(' ') || '';

      // Query for an active IT_TECHNICIAN profile
      const techProfile = await prisma.employeeProfile.findFirst({
        where: {
          isActive: true,
          user: {
            role: 'IT_TECHNICIAN',
            status: 'APPROVED',
          },
          OR: [
            { id: data.assignedTechnician },
            { employeeId: data.assignedTechnician },
            {
              user: {
                email: data.assignedTechnician,
              },
            },
            ...(lastNamePart
              ? [
                  {
                    AND: [
                      { firstName: { equals: firstNamePart, mode: 'insensitive' as const } },
                      { lastName: { equals: lastNamePart, mode: 'insensitive' as const } },
                    ],
                  },
                ]
              : [
                  { firstName: { equals: firstNamePart, mode: 'insensitive' as const } },
                  { lastName: { equals: firstNamePart, mode: 'insensitive' as const } },
                ]),
          ],
        },
        include: { user: true },
      });

      if (!techProfile) {
        // Check if an employee profile was matched but does not hold IT_TECHNICIAN role
        const nonTechProfile = await prisma.employeeProfile.findFirst({
          where: {
            OR: [
              { id: data.assignedTechnician },
              { employeeId: data.assignedTechnician },
              {
                user: {
                  email: data.assignedTechnician,
                },
              },
              ...(lastNamePart
                ? [
                    {
                      AND: [
                        { firstName: { equals: firstNamePart, mode: 'insensitive' as const } },
                        { lastName: { equals: lastNamePart, mode: 'insensitive' as const } },
                      ],
                    },
                  ]
                : [
                    { firstName: { equals: firstNamePart, mode: 'insensitive' as const } },
                    { lastName: { equals: firstNamePart, mode: 'insensitive' as const } },
                  ]),
            ],
          },
          include: { user: true },
        });

        if (nonTechProfile && nonTechProfile.user?.role !== 'IT_TECHNICIAN') {
          throw new AppError('Assigned technician must hold the IT_TECHNICIAN role', 422);
        }
      }
    }

    const ticketNumber = await this.repo.generateTicketNumber();
    const initialStatus = (data.status as MaintenanceStatus) || 'OPEN';

    // 3. Prisma Transaction: Create Ticket & Update Asset Status
    const createdTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.maintenanceTicket.create({
        data: {
          ticketNumber,
          assetId: data.assetId,
          title: data.category,
          description: data.description,
          priority: data.priority as MaintenancePriority,
          status: initialStatus,
          reportedBy: data.reportedBy,
          assignedTechnician: data.assignedTechnician,
          cost: data.cost != null ? data.cost : null,
          startDate: data.startDate ? new Date(data.startDate) : initialStatus === 'IN_PROGRESS' ? new Date() : null,
          resolutionNotes: data.resolutionNotes || null,
        },
      });

      // Update Asset Status to MAINTENANCE
      let targetAssetStatus: 'MAINTENANCE' | 'TESTING' = 'MAINTENANCE';
      if (initialStatus === 'TESTING') {
        targetAssetStatus = 'TESTING';
      }

      await tx.asset.update({
        where: { id: data.assetId },
        data: { status: targetAssetStatus },
      });

      return ticket;
    });

    const populated = await this.repo.findById(createdTicket.id);
    return this.formatTicket(populated);
  }

  async updateTicket(id: string, data: UpdateMaintenanceDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(`Maintenance ticket with ID '${id}' not found`, 404);
    }

    if (data.status && data.status !== existing.status) {
      return this.updateStatus(id, {
        status: data.status,
        resolutionNotes: data.resolutionNotes,
      });
    }

    const updated = await prisma.maintenanceTicket.update({
      where: { id },
      data: {
        ...(data.category ? { title: data.category } : {}),
        ...(data.priority ? { priority: data.priority as MaintenancePriority } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.reportedBy !== undefined ? { reportedBy: data.reportedBy } : {}),
        ...(data.assignedTechnician !== undefined ? { assignedTechnician: data.assignedTechnician } : {}),
        ...(data.cost !== undefined ? { cost: data.cost } : {}),
        ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
        ...(data.completedDate ? { completedDate: new Date(data.completedDate) } : {}),
        ...(data.resolutionNotes !== undefined ? { resolutionNotes: data.resolutionNotes } : {}),
      },
      include: (this.repo as any).defaultInclude,
    });

    return this.formatTicket(updated);
  }

  async updateStatus(id: string, data: UpdateMaintenanceStatusDTO) {
    const ticket = await this.repo.findById(id);
    if (!ticket) {
      throw new AppError(`Maintenance ticket with ID '${id}' not found`, 404);
    }

    const newStatus = data.status as MaintenanceStatus;
    const now = new Date();

    // Check testing prerequisite if moving to COMPLETED
    if (newStatus === 'COMPLETED') {
      const latestTest = ticket.inspectionTests?.[0];
      if (latestTest && !latestTest.passed) {
        throw new AppError('Cannot complete ticket: latest inspection test did not pass', 422);
      }
    }

    const updatedTicket = await prisma.$transaction(async (tx) => {
      // 1. Determine Asset Status based on Ticket Status & Active Custody
      let targetAssetStatus: any = undefined;

      if (newStatus === 'OPEN' || newStatus === 'IN_PROGRESS') {
        targetAssetStatus = 'MAINTENANCE';
      } else if (newStatus === 'TESTING') {
        targetAssetStatus = 'TESTING';
      } else if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
        // If asset has a current assignment, restore to ASSIGNED, else AVAILABLE
        const activeAssignment = await tx.assetAssignment.findFirst({
          where: { assetId: ticket.assetId, isCurrent: true },
        });
        targetAssetStatus = activeAssignment ? 'ASSIGNED' : 'AVAILABLE';
      }

      if (targetAssetStatus) {
        await tx.asset.update({
          where: { id: ticket.assetId },
          data: { status: targetAssetStatus },
        });
      }

      // 2. Update MaintenanceTicket dates and status
      const updateData: any = {
        status: newStatus,
      };

      if (data.resolutionNotes !== undefined) {
        updateData.resolutionNotes = data.resolutionNotes;
      }

      if (newStatus === 'IN_PROGRESS' && !ticket.startDate) {
        updateData.startDate = now;
      }

      if (newStatus === 'COMPLETED') {
        updateData.completedDate = now;
      }

      const updated = await tx.maintenanceTicket.update({
        where: { id },
        data: updateData,
      });

      return updated;
    });

    const populated = await this.repo.findById(updatedTicket.id);
    return this.formatTicket(populated);
  }

  async getDashboardStats() {
    const stats = await this.repo.getDashboardStats();
    return {
      openTickets: stats.openTickets,
      inProgress: stats.inProgress,
      testing: stats.testing,
      completedThisMonth: stats.completedThisMonth,
      recentTickets: stats.recentTickets.map((t) => this.formatTicket(t)),
    };
  }
}

export const maintenanceService = new MaintenanceService();
