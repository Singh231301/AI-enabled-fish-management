import { PrismaClient, Prisma, InventoryTransaction } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class InventoryTransactionRepository extends BaseRepository<InventoryTransaction> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<InventoryTransaction | null> {
    return this.prisma.inventoryTransaction.findUnique({ where: { id } });
  }

  async create(data: Prisma.InventoryTransactionCreateInput): Promise<InventoryTransaction> {
    return this.prisma.inventoryTransaction.create({ data });
  }

  async update(id: string, data: Prisma.InventoryTransactionUpdateInput): Promise<InventoryTransaction> {
    return this.prisma.inventoryTransaction.update({ where: { id }, data });
  }

  async delete(id: string): Promise<InventoryTransaction> {
    return this.prisma.inventoryTransaction.delete({ where: { id } });
  }

  async findAll(filters?: Partial<InventoryTransaction>): Promise<InventoryTransaction[]> {
    return this.prisma.inventoryTransaction.findMany({ where: filters as any });
  }
}
