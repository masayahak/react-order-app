import { prisma } from '../prisma';
import { Product } from '@/types';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ProductRepository {
  async getAll(): Promise<Product[]> {
    return await prisma.product.findMany({
      orderBy: { product_code: 'asc' },
    }) as Product[];
  }

  async getPaginated(page: number = 1, pageSize: number = 20, keyword?: string): Promise<PaginatedResult<Product>> {
    const skip = (page - 1) * pageSize;
    
    const where = keyword
      ? {
          OR: [
            { product_code: { contains: keyword } },
            { product_name: { contains: keyword } },
          ],
        }
      : undefined;

    const [totalCount, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { product_code: 'asc' },
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: data as Product[],
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }

  async getByCode(code: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { product_code: code },
    }) as Product | null;
  }

  async search(keyword: string): Promise<Product[]> {
    return await prisma.product.findMany({
      where: {
        OR: [
          { product_code: { contains: keyword } },
          { product_name: { contains: keyword } },
        ],
      },
      orderBy: { product_code: 'asc' },
    }) as Product[];
  }

  async create(product: Omit<Product, 'created_at' | 'updated_at'>): Promise<Product> {
    return await prisma.product.create({
      data: {
        product_code: product.product_code,
        product_name: product.product_name,
        unit_price: product.unit_price,
      },
    }) as Product;
  }

  async update(code: string, product: Partial<Omit<Product, 'product_code' | 'created_at' | 'updated_at'>>): Promise<Product | null> {
    try {
      return await prisma.product.update({
        where: { product_code: code },
        data: {
          ...(product.product_name !== undefined && { product_name: product.product_name }),
          ...(product.unit_price !== undefined && { unit_price: product.unit_price }),
        },
      }) as Product;
    } catch (error) {
      return null;
    }
  }

  async delete(code: string): Promise<boolean> {
    try {
      await prisma.product.delete({
        where: { product_code: code },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const productRepository = new ProductRepository();
