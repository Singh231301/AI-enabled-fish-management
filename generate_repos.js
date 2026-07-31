const fs = require('fs');
const path = require('path');

const models = [
  { file: 'user.repository.ts', model: 'User' },
  { file: 'pond.repository.ts', model: 'Pond' },
  { file: 'fish-stocking.repository.ts', model: 'FishStocking' },
  { file: 'mortality-log.repository.ts', model: 'MortalityLog' },
  { file: 'feeding-log.repository.ts', model: 'FeedingLog' },
  { file: 'water-quality-log.repository.ts', model: 'WaterQualityLog' },
  { file: 'water-treatment-log.repository.ts', model: 'WaterTreatmentLog' },
  { file: 'fish-growth-sample.repository.ts', model: 'FishGrowthSample' },
  { file: 'expense.repository.ts', model: 'Expense' },
  { file: 'sale.repository.ts', model: 'Sale' },
  { file: 'market-price.repository.ts', model: 'MarketPrice' },
  { file: 'inventory.repository.ts', model: 'Inventory' },
  { file: 'inventory-transaction.repository.ts', model: 'InventoryTransaction' },
  { file: 'task.repository.ts', model: 'Task' },
  { file: 'notification.repository.ts', model: 'Notification' },
  { file: 'ai-briefing.repository.ts', model: 'AiBriefing' },
  { file: 'ai-chat-history.repository.ts', model: 'AiChatHistory' },
  { file: 'infrastructure-checklist.repository.ts', model: 'InfrastructureChecklist' },
  { file: 'activity-log.repository.ts', model: 'ActivityLog' },
];

models.forEach(({ file, model }) => {
  const modelCamel = model.charAt(0).toLowerCase() + model.slice(1);
  const content = `import { PrismaClient, Prisma, ${model} } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ${model}Repository extends BaseRepository<${model}> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<${model} | null> {
    return this.prisma.${modelCamel}.findUnique({ where: { id } });
  }

  async create(data: Prisma.${model}CreateInput): Promise<${model}> {
    return this.prisma.${modelCamel}.create({ data });
  }

  async update(id: string, data: Prisma.${model}UpdateInput): Promise<${model}> {
    return this.prisma.${modelCamel}.update({ where: { id }, data });
  }

  async delete(id: string): Promise<${model}> {
    return this.prisma.${modelCamel}.delete({ where: { id } });
  }

  async findAll(filters?: Partial<${model}>): Promise<${model}[]> {
    return this.prisma.${modelCamel}.findMany({ where: filters as any });
  }
}
`;
  fs.writeFileSync(path.join('fishfarm', 'backend', 'src', 'repositories', file), content);
});
console.log('Done generating stubs.');
