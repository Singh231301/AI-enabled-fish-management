import { PrismaClient, Prisma, AiChatHistory } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class AiChatHistoryRepository extends BaseRepository<AiChatHistory> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<AiChatHistory | null> {
    return this.prisma.aiChatHistory.findUnique({ where: { id } });
  }

  async create(data: Prisma.AiChatHistoryCreateInput): Promise<AiChatHistory> {
    return this.prisma.aiChatHistory.create({ data });
  }

  async update(id: string, data: Prisma.AiChatHistoryUpdateInput): Promise<AiChatHistory> {
    return this.prisma.aiChatHistory.update({ where: { id }, data });
  }

  async delete(id: string): Promise<AiChatHistory> {
    return this.prisma.aiChatHistory.delete({ where: { id } });
  }

  async findAll(filters?: Partial<AiChatHistory>): Promise<AiChatHistory[]> {
    return this.prisma.aiChatHistory.findMany({ where: filters as any });
  }
}
