import prisma from '../../lib/prisma';
import { testingRepository, TestingRepository } from './testing.repository';
import { CreateInspectionDTO, UpdateInspectionDTO } from './testing.validator';
import { InspectionStatus } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class TestingService {
  constructor(private repo: TestingRepository = testingRepository) {}

  private formatInspection(test: any) {
    if (!test) return null;
    return {
      id: test.id,
      ticketId: test.ticketId,
      testedBy: test.testedBy,
      testDate: test.testDate,
      testType: test.testType,
      status: test.status,
      passed: Boolean(test.passed),
      result: test.passed ? 'PASS' : 'FAIL',
      notes: test.findings,
      findings: test.findings,
      recommendedAction: test.recommendations,
      recommendations: test.recommendations,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
      ticket: test.ticket
        ? {
            id: test.ticket.id,
            ticketNumber: test.ticket.ticketNumber,
            title: test.ticket.title,
            category: test.ticket.title,
            status: test.ticket.status,
            priority: test.ticket.priority,
            asset: test.ticket.asset,
          }
        : null,
    };
  }

  async getInspectionsByTicket(ticketId: string) {
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new AppError(`Maintenance ticket with ID '${ticketId}' not found`, 404);
    }

    const inspections = await this.repo.findByTicketId(ticketId);
    return inspections.map((i) => this.formatInspection(i));
  }

  async createInspection(data: CreateInspectionDTO) {
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: data.ticketId },
      include: {
        asset: {
          include: {
            assignments: { where: { isCurrent: true } },
          },
        },
      },
    });

    if (!ticket) {
      throw new AppError(`Maintenance ticket with ID '${data.ticketId}' not found`, 404);
    }

    const passed = data.result === 'PASS';
    const testDate = data.testDate ? new Date(data.testDate) : new Date();
    const status = passed ? InspectionStatus.PASSED : InspectionStatus.FAILED;

    const created = await prisma.$transaction(async (tx) => {
      // 1. Record Inspection Test
      const inspection = await tx.inspectionTest.create({
        data: {
          ticketId: data.ticketId,
          testedBy: data.testedBy,
          testDate,
          status,
          findings: data.findings || null,
          recommendations: data.recommendations || null,
          passed,
          testType: data.testType || 'QUALITY_AND_FUNCTIONALITY',
        },
      });

      // 2. Apply Business Workflow Rules
      if (!passed) {
        // FAIL rule: Ticket returns to IN_PROGRESS, asset remains/reverts to MAINTENANCE
        await tx.maintenanceTicket.update({
          where: { id: data.ticketId },
          data: {
            status: 'IN_PROGRESS',
            resolutionNotes: data.recommendations
              ? `Inspection FAILED: ${data.findings || ''} | Recommended Action: ${data.recommendations}`
              : data.findings
              ? `Inspection FAILED: ${data.findings}`
              : ticket.resolutionNotes,
          },
        });

        await tx.asset.update({
          where: { id: ticket.assetId },
          data: { status: 'MAINTENANCE' },
        });
      } else {
        // PASS rule: Ticket can move to COMPLETED
        if (data.autoComplete) {
          const now = new Date();
          const activeAssignment = await tx.assetAssignment.findFirst({
            where: { assetId: ticket.assetId, isCurrent: true },
          });

          await tx.maintenanceTicket.update({
            where: { id: data.ticketId },
            data: {
              status: 'COMPLETED',
              completedDate: now,
              resolutionNotes: data.findings
                ? `Passed inspection: ${data.findings}`
                : ticket.resolutionNotes,
            },
          });

          await tx.asset.update({
            where: { id: ticket.assetId },
            data: {
              status: activeAssignment ? 'ASSIGNED' : 'AVAILABLE',
            },
          });
        } else {
          // Keep ticket in TESTING so completion can be confirmed, or update notes
          if (ticket.status !== 'TESTING') {
            await tx.maintenanceTicket.update({
              where: { id: data.ticketId },
              data: { status: 'TESTING' },
            });
            await tx.asset.update({
              where: { id: ticket.assetId },
              data: { status: 'TESTING' },
            });
          }
        }
      }

      return inspection;
    });

    const populated = await this.repo.findById(created.id);
    return this.formatInspection(populated);
  }

  async updateInspection(id: string, data: UpdateInspectionDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(`Inspection test with ID '${id}' not found`, 404);
    }

    const passed = data.result ? data.result === 'PASS' : existing.passed;
    const status = passed ? InspectionStatus.PASSED : InspectionStatus.FAILED;

    const updated = await this.repo.update(id, {
      ...(data.testedBy ? { testedBy: data.testedBy } : {}),
      ...(data.testDate ? { testDate: new Date(data.testDate) } : {}),
      ...(data.testType ? { testType: data.testType } : {}),
      ...(data.findings !== undefined ? { findings: data.findings } : {}),
      ...(data.recommendations !== undefined ? { recommendations: data.recommendations } : {}),
      ...(data.result ? { passed, status } : {}),
    });

    return this.formatInspection(updated);
  }
}

export const testingService = new TestingService();
