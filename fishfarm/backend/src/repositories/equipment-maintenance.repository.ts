import { PrismaClient, EquipmentMaintenance, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class EquipmentMaintenanceRepository extends BaseRepository<EquipmentMaintenance> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<EquipmentMaintenance | null> {
    return this.prisma.equipmentMaintenance.findUnique({ where: { id } });
  }

  async findByInventoryId(inventoryId: string): Promise<EquipmentMaintenance[]> {
    return this.prisma.equipmentMaintenance.findMany({
      where: { inventoryId },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  async findPendingByPondId(pondId: string): Promise<any[]> {
    return this.prisma.equipmentMaintenance.findMany({
      where: {
        inventory: { pondId },
        status: { in: ['PENDING', 'OVERDUE'] }
      },
      include: {
        inventory: {
          select: { itemName: true, category: true, pondId: true }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  async findOverdue(): Promise<any[]> {
    return this.prisma.equipmentMaintenance.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
        scheduledDate: { lt: new Date() }
      },
      include: {
        inventory: {
          select: {
            itemName: true,
            pondId: true,
            category: true,
            pond: { select: { userId: true, name: true } }
          }
        }
      }
    });
  }

  async findUpcoming(pondId: string, daysAhead: number): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.equipmentMaintenance.findMany({
      where: {
        inventory: { pondId },
        status: 'PENDING',
        scheduledDate: {
          gte: new Date(),
          lte: futureDate
        }
      },
      include: {
        inventory: { select: { itemName: true, category: true, pondId: true } }
      },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  async create(data: Prisma.EquipmentMaintenanceCreateInput): Promise<EquipmentMaintenance> {
    return this.prisma.equipmentMaintenance.create({ data });
  }

  async update(id: string, data: Prisma.EquipmentMaintenanceUpdateInput): Promise<EquipmentMaintenance> {
    return this.prisma.equipmentMaintenance.update({ where: { id }, data });
  }

  async markOverdue(ids: string[]): Promise<{ count: number }> {
    return this.prisma.equipmentMaintenance.updateMany({
      where: {
        id: { in: ids },
        status: 'PENDING',
        scheduledDate: { lt: new Date() }
      },
      data: { status: 'OVERDUE' }
    });
  }
}
