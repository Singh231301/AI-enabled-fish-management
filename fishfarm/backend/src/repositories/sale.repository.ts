import { PrismaClient, Prisma, Sale, PaymentStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { MonthlySale } from '../types/financials.types';
import { format, subMonths } from 'date-fns';

export class SaleRepository extends BaseRepository<Sale> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Sale | null> {
    return this.prisma.sale.findUnique({ where: { id } });
  }

  async findByPondId(
    pondId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      paymentStatus?: string;
      skip: number;
      take: number;
    }
  ): Promise<{ records: Sale[]; total: number }> {
    const where: Prisma.SaleWhereInput = {
      pondId,
      ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus as PaymentStatus } : {}),
      ...(filters.startDate || filters.endDate ? {
        saleDate: {
          ...(filters.startDate ? { gte: filters.startDate } : {}),
          ...(filters.endDate ? { lte: filters.endDate } : {})
        }
      } : {})
    };

    const [records, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        orderBy: { saleDate: 'desc' },
        skip: filters.skip,
        take: filters.take
      }),
      this.prisma.sale.count({ where })
    ]);

    return { records, total };
  }

  async findAllByPondId(pondId: string): Promise<Sale[]> {
    return this.prisma.sale.findMany({
      where: { pondId },
      orderBy: { saleDate: 'desc' }
    });
  }

  async findByIdAndPondId(id: string, pondId: string): Promise<Sale | null> {
    return this.prisma.sale.findFirst({ where: { id, pondId } });
  }

  async getTotalRevenue(
    pondId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const result = await this.prisma.sale.aggregate({
      where: {
        pondId,
        ...(startDate || endDate ? {
          saleDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {})
          }
        } : {})
      },
      _sum: { totalAmount: true }
    });
    return result._sum.totalAmount ?? 0;
  }

  async getTotalFishSoldKg(pondId: string): Promise<number> {
    const result = await this.prisma.sale.aggregate({
      where: { pondId },
      _sum: { fishQuantityKg: true }
    });
    return result._sum.fishQuantityKg ?? 0;
  }

  async getPendingPayments(pondId: string): Promise<Sale[]> {
    return this.prisma.sale.findMany({
      where: {
        pondId,
        paymentStatus: { in: ['PENDING', 'PARTIAL'] }
      },
      orderBy: { saleDate: 'asc' }
    });
  }

  async getTotalPendingAmount(pondId: string): Promise<number> {
    const result = await this.prisma.sale.aggregate({
      where: {
        pondId,
        paymentStatus: { in: ['PENDING', 'PARTIAL'] }
      },
      _sum: { balancePending: true }
    });
    return result._sum.balancePending ?? 0;
  }

  async getMonthlySales(
    pondId: string,
    months: number
  ): Promise<MonthlySale[]> {
    const startDate = subMonths(new Date(), months - 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const sales = await this.prisma.sale.findMany({
      where: {
        pondId,
        saleDate: { gte: startDate }
      },
      orderBy: { saleDate: 'asc' }
    });

    const monthlyMap = new Map<string, MonthlySale>();

    for (let i = 0; i < months; i++) {
      const d = subMonths(new Date(), i);
      const m = format(d, 'yyyy-MM');
      monthlyMap.set(m, {
        month: m,
        displayMonth: format(d, 'MMM yyyy'),
        totalRevenue: 0,
        totalKg: 0,
        avgPricePerKg: 0,
        saleCount: 0
      });
    }

    sales.forEach(sale => {
      const monthKey = format(sale.saleDate, 'yyyy-MM');
      if (monthlyMap.has(monthKey)) {
        const monthData = monthlyMap.get(monthKey)!;
        monthData.totalRevenue += sale.totalAmount;
        monthData.totalKg += sale.fishQuantityKg;
        monthData.saleCount += 1;
        monthData.avgPricePerKg = monthData.totalKg > 0 ? monthData.totalRevenue / monthData.totalKg : 0;
      }
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  async getAveragePricePerKg(pondId: string): Promise<number | null> {
    const result = await this.prisma.sale.aggregate({
      where: { pondId },
      _avg: { pricePerKg: true }
    });
    return result._avg.pricePerKg;
  }

  async getLatestInvoiceNumber(pondId: string): Promise<string | null> {
    const sale = await this.prisma.sale.findFirst({
      where: { pondId, invoiceNumber: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true }
    });
    return sale?.invoiceNumber ?? null;
  }

  async create(data: Prisma.SaleCreateInput): Promise<Sale> {
    return this.prisma.sale.create({ data });
  }

  async update(id: string, data: Prisma.SaleUpdateInput): Promise<Sale> {
    return this.prisma.sale.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Sale> {
    return this.prisma.sale.delete({ where: { id } });
  }
}
