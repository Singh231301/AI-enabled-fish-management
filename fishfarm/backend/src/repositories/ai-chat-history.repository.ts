import { PrismaClient, Prisma, AiChatHistory } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { SessionSummary } from '../types/ai.types';

export class AiChatHistoryRepository extends BaseRepository<AiChatHistory> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<AiChatHistory | null> {
    return this.prisma.aiChatHistory.findUnique({ where: { id } });
  }

  async findBySessionId(sessionId: string): Promise<AiChatHistory[]> {
    return this.prisma.aiChatHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async findByUserId(userId: string, filters: { pondId?: string, skip: number, take: number }): Promise<{ records: AiChatHistory[], total: number }> {
    const whereClause: any = { userId };
    if (filters.pondId) {
      whereClause.pondId = filters.pondId;
    }
    
    const [records, total] = await Promise.all([
      this.prisma.aiChatHistory.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: filters.skip,
        take: filters.take
      }),
      this.prisma.aiChatHistory.count({ where: whereClause })
    ]);
    
    return { records, total };
  }

  async findRecentSessions(userId: string, limit: number): Promise<SessionSummary[]> {
    const distinctSessions = await this.prisma.aiChatHistory.findMany({
      where: { userId },
      distinct: ['sessionId'],
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        sessionId: true,
        message: true,
        createdAt: true,
        pondId: true,
        role: true
      }
    });

    const sessionSummaries = await Promise.all(
      distinctSessions.map(async (session) => {
        const count = await this.prisma.aiChatHistory.count({
          where: { sessionId: session.sessionId }
        });
        
        return {
          sessionId: session.sessionId,
          firstMessage: session.message,
          messageCount: count,
          startedAt: session.createdAt.toISOString(),
          pondId: session.pondId
        };
      })
    );

    return sessionSummaries;
  }

  async getSessionHistory(sessionId: string, userId: string): Promise<AiChatHistory[]> {
    return this.prisma.aiChatHistory.findMany({
      where: { sessionId, userId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async create(data: Prisma.AiChatHistoryCreateInput): Promise<AiChatHistory> {
    return this.prisma.aiChatHistory.create({ data });
  }

  async createMany(data: Prisma.AiChatHistoryCreateManyInput[]): Promise<{ count: number }> {
    return this.prisma.aiChatHistory.createMany({ data });
  }

  async deleteSession(sessionId: string, userId: string): Promise<{ count: number }> {
    return this.prisma.aiChatHistory.deleteMany({
      where: { sessionId, userId }
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.aiChatHistory.count({ where: { userId } });
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
