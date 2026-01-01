import { prisma } from '../prisma';
import { Order, OrderDetail, OrderWithDetails } from '@/types';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class OrderRepository {
  async getAll(): Promise<Order[]> {
    return await prisma.order.findMany({
      orderBy: [
        { order_date: 'desc' },
        { order_id: 'desc' },
      ],
    }) as Order[];
  }

  async getPaginated(
    page: number = 1, 
    pageSize: number = 20, 
    keyword?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<PaginatedResult<Order>> {
    const skip = (page - 1) * pageSize;
    
    const conditions: any[] = [];
    
    if (keyword) {
      conditions.push({ customer_name: { contains: keyword } });
    }
    
    if (dateFrom) {
      conditions.push({ order_date: { gte: dateFrom } });
    }
    
    if (dateTo) {
      conditions.push({ order_date: { lte: dateTo } });
    }
    
    const where = conditions.length > 0 ? { AND: conditions } : undefined;

    const [totalCount, data] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: [
          { order_date: 'desc' },
          { order_id: 'desc' },
        ],
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: data as Order[],
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }

  async getById(id: number): Promise<OrderWithDetails | null> {
    const order = await prisma.order.findUnique({
      where: { order_id: id },
      include: {
        details: {
          orderBy: { detail_id: 'asc' },
        },
      },
    });

    if (!order) {
      return null;
    }

    return order as OrderWithDetails;
  }

  async search(keyword: string): Promise<Order[]> {
    return await prisma.order.findMany({
      where: {
        customer_name: { contains: keyword },
      },
      orderBy: [
        { order_date: 'desc' },
        { order_id: 'desc' },
      ],
    }) as Order[];
  }

  async create(
    order: Omit<Order, 'order_id' | 'version' | 'created_at' | 'updated_at'>,
    details: Omit<OrderDetail, 'detail_id' | 'order_id'>[]
  ): Promise<OrderWithDetails> {
    const createdOrder = await prisma.order.create({
      data: {
        customer_id: order.customer_id,
        customer_name: order.customer_name,
        order_date: order.order_date,
        total_amount: order.total_amount,
        created_by: order.created_by || null,
        details: {
          create: details.map(detail => ({
            product_code: detail.product_code,
            product_name: detail.product_name,
            quantity: detail.quantity,
            unit_price: detail.unit_price,
            amount: detail.amount,
          })),
        },
      },
      include: {
        details: {
          orderBy: { detail_id: 'asc' },
        },
      },
    });

    return createdOrder as OrderWithDetails;
  }

  async update(
    id: number,
    order: Partial<Omit<Order, 'order_id' | 'created_at' | 'updated_at'>>,
    details?: Omit<OrderDetail, 'detail_id' | 'order_id'>[]
  ): Promise<OrderWithDetails | null> {
    // 楽観的排他制御
    const current = await this.getById(id);
    if (!current) {
      return null;
    }

    if (order.version !== undefined && order.version !== current.version) {
      throw new Error('他のユーザーによって更新されています。最新のデータを取得してください。');
    }

    try {
      const updatedOrder = await prisma.order.update({
        where: { order_id: id },
        data: {
          ...(order.customer_id !== undefined && { customer_id: order.customer_id }),
          ...(order.customer_name !== undefined && { customer_name: order.customer_name }),
          ...(order.order_date !== undefined && { order_date: order.order_date }),
          ...(order.total_amount !== undefined && { total_amount: order.total_amount }),
          version: { increment: 1 },
          ...(details && {
            details: {
              deleteMany: {},
              create: details.map(detail => ({
                product_code: detail.product_code,
                product_name: detail.product_name,
                quantity: detail.quantity,
                unit_price: detail.unit_price,
                amount: detail.amount,
              })),
            },
          }),
        },
        include: {
          details: {
            orderBy: { detail_id: 'asc' },
          },
        },
      });

      return updatedOrder as OrderWithDetails;
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.order.delete({
        where: { order_id: id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const orderRepository = new OrderRepository();
