import { PrismaClient, Prisma, Inventory } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class InventoryRepository extends BaseRepository<Inventory> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Inventory | null> {
    return this.prisma.inventory.findUnique({ where: { id } });
  }

  async create(data: Prisma.InventoryCreateInput): Promise<Inventory> {
    return this.prisma.inventory.create({ data });
  }

  async update(id: string, data: Prisma.InventoryUpdateInput): Promise<Inventory> {
    return this.prisma.inventory.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Inventory> {
    return this.prisma.inventory.delete({ where: { id } });
  }

  async findAll(filters?: Partial<Inventory>): Promise<Inventory[]> {
    return this.prisma.inventory.findMany({ where: filters as any });
  }
}
