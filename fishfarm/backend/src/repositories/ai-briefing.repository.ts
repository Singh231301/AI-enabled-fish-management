import { PrismaClient, Prisma, AiBriefing } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class AiBriefingRepository extends BaseRepository<AiBriefing> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<AiBriefing | null> {
    return this.prisma.aiBriefing.findUnique({ where: { id } });
  }

  async create(data: Prisma.AiBriefingCreateInput): Promise<AiBriefing> {
    return this.prisma.aiBriefing.create({ data });
  }

  async update(id: string, data: Prisma.AiBriefingUpdateInput): Promise<AiBriefing> {
    return this.prisma.aiBriefing.update({ where: { id }, data });
  }

  async delete(id: string): Promise<AiBriefing> {
    return this.prisma.aiBriefing.delete({ where: { id } });
  }

  async findAll(filters?: Partial<AiBriefing>): Promise<AiBriefing[]> {
    return this.prisma.aiBriefing.findMany({ where: filters as any });
  }
}
