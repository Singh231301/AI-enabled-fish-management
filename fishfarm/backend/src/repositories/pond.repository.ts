import { PrismaClient, Prisma, Pond, InfrastructureStatus, InfrastructureChecklist } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { PondWithCounts, PondWithFullDetails } from '../types/pond.types';

export class PondRepository extends BaseRepository<Pond> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Pond | null> {
    return this.prisma.pond.findUnique({
      where: { id },
      include: {
        fishStockings: {
          orderBy: { stockingDate: 'desc' },
          take: 1
        },
        _count: {
          select: {
            fishStockings: true,
            mortalityLogs: true,
            feedingLogs: true,
            waterQualityLogs: true,
            expenses: true,
            sales: true,
            tasks: true,
            infrastructureItems: true
          }
        }
      }
    });
  }

  async findByUserId(userId: string): Promise<PondWithCounts[]> {
    return this.prisma.pond.findMany({
      where: { userId, isActive: true },
      include: {
        fishStockings: {
          orderBy: { stockingDate: 'desc' },
          take: 1
        },
        _count: {
          select: {
            fishStockings: true,
            mortalityLogs: true,
            feedingLogs: true,
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Pond | null> {
    return this.prisma.pond.findFirst({
      where: {
        id,
        userId,
        isActive: true,
      },
    });
  }

  async findAllActive(): Promise<Pond[]> {
    return this.prisma.pond.findMany({
      where: { isActive: true },
    });
  }

  async create(data: Prisma.PondCreateInput | any): Promise<Pond> {
    return this.prisma.pond.create({ data });
  }

  async update(id: string, data: Prisma.PondUpdateInput | any): Promise<Pond> {
    return this.prisma.pond.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Pond> {
    return this.prisma.pond.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() }
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.pond.count({ where: { userId, isActive: true } });
  }

  async findWithFullDetails(id: string): Promise<PondWithFullDetails | null> {
    return this.prisma.pond.findUnique({
      where: { id },
      include: {
        fishStockings: {
          orderBy: { stockingDate: 'desc' }
        },
        infrastructureItems: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            mortalityLogs: true,
            feedingLogs: true,
            waterQualityLogs: true,
            expenses: true,
            sales: true,
            tasks: true,
            infrastructureItems: true
          }
        }
      }
    });
  }
}
