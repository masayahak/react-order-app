import { prisma } from '../prisma';
import { Customer } from '@/types';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class CustomerRepository {
  async getAll(): Promise<Customer[]> {
    return await prisma.customer.findMany({
      orderBy: { customer_name: 'asc' },
    }) as Customer[];
  }

  async getPaginated(page: number = 1, pageSize: number = 20, keyword?: string): Promise<PaginatedResult<Customer>> {
    const skip = (page - 1) * pageSize;
    
    const where = keyword
      ? {
          OR: [
            { customer_name: { contains: keyword } },
            { phone_number: { contains: keyword } },
          ],
        }
      : undefined;

    const [totalCount, data] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy: { customer_name: 'asc' },
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: data as Customer[],
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }

  async getById(id: number): Promise<Customer | null> {
    return await prisma.customer.findUnique({
      where: { customer_id: id },
    }) as Customer | null;
  }

  async search(keyword: string): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: {
        OR: [
          { customer_name: { contains: keyword } },
          { phone_number: { contains: keyword } },
        ],
      },
      orderBy: { customer_name: 'asc' },
    }) as Customer[];
  }

  async create(customer: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    return await prisma.customer.create({
      data: {
        customer_name: customer.customer_name,
        phone_number: customer.phone_number || null,
      },
    }) as Customer;
  }

  async update(id: number, customer: Partial<Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>>): Promise<Customer | null> {
    try {
      return await prisma.customer.update({
        where: { customer_id: id },
        data: {
          ...(customer.customer_name !== undefined && { customer_name: customer.customer_name }),
          ...(customer.phone_number !== undefined && { phone_number: customer.phone_number }),
        },
      }) as Customer;
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.customer.delete({
        where: { customer_id: id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const customerRepository = new CustomerRepository();
