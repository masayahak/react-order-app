import { prisma } from '../prisma';
import { Order, OrderDetail, OrderWithDetails } from '@/types';
import { PaginatedResult } from '@/types/pagination';

export class OrderRepository {
  async getAll(): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      orderBy: [
        { order_date: 'desc' },
        { order_id: 'desc' },
      ],
    });
    return orders.map(o => ({
      ...o,
      created_at: o.created_at.toISOString(),
      updated_at: o.updated_at.toISOString(),
    }));
  }

  async getPaginated(
    page: number = 1, 
    pageSize: number = 20, 
    customerName?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<PaginatedResult<Order>> {
    const skip = (page - 1) * pageSize;
    
    const conditions: any[] = [];
    
    if (customerName) {
      conditions.push({ customer_name: { contains: customerName } });
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
      data: data.map(o => ({
        ...o,
        created_at: o.created_at.toISOString(),
        updated_at: o.updated_at.toISOString(),
      })),
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

    return {
      ...order,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
    };
  }

  async search(keyword: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: {
        customer_name: { contains: keyword },
      },
      orderBy: [
        { order_date: 'desc' },
        { order_id: 'desc' },
      ],
    });
    return orders.map(o => ({
      ...o,
      created_at: o.created_at.toISOString(),
      updated_at: o.updated_at.toISOString(),
    }));
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

    return {
      ...createdOrder,
      created_at: createdOrder.created_at.toISOString(),
      updated_at: createdOrder.updated_at.toISOString(),
    };
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

      return {
        ...updatedOrder,
        created_at: updatedOrder.created_at.toISOString(),
        updated_at: updatedOrder.updated_at.toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  async delete(id: number, version: number): Promise<boolean> {
    try {
      const result = await prisma.order.deleteMany({
        where: { 
          order_id: id,
          version: version
        },
      });
      return result.count > 0;
    } catch (error) {
      return false;
    }
  }
}

export const orderRepository = new OrderRepository();
