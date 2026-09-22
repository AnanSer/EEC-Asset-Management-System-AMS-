import prisma from '../../lib/prisma';
import { InspectionStatus } from '@prisma/client';

export class TestingRepository {
  private defaultInclude = {
    ticket: {
      include: {
        asset: {
          include: {
            department: true,
          },
        },
      },
    },
  };

  async findByTicketId(ticketId: string) {
    return prisma.inspectionTest.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
      include: this.defaultInclude,
    });
  }

  async findById(id: string) {
    return prisma.inspectionTest.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async create(data: {
    ticketId: string;
    testedBy: string;
    testDate: Date;
    status: InspectionStatus;
    findings?: string | null;
    recommendations?: string | null;
    passed: boolean;
    testType: string;
  }) {
    return prisma.inspectionTest.create({
      data,
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: any) {
    return prisma.inspectionTest.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }
}

export const testingRepository = new TestingRepository();
