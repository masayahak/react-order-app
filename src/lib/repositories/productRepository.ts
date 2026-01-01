import { prisma } from '../prisma';
import { Product } from '@/types';
import { PaginatedResult } from '@/types/pagination';

export class ProductRepository {
  async getAll(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      orderBy: { product_code: 'asc' },
    });
    return products.map(p => ({
      ...p,
      created_at: p.created_at.toISOString(),
      updated_at: p.updated_at.toISOString(),
    }));
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
      data: data.map(p => ({
        ...p,
        created_at: p.created_at.toISOString(),
        updated_at: p.updated_at.toISOString(),
      })),
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }

  async getByCode(code: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { product_code: code },
    });
    if (!product) return null;
    return {
      ...product,
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString(),
    };
  }

  async search(keyword: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { product_code: { contains: keyword } },
          { product_name: { contains: keyword } },
        ],
      },
      orderBy: { product_code: 'asc' },
    });
    return products.map(p => ({
      ...p,
      created_at: p.created_at.toISOString(),
      updated_at: p.updated_at.toISOString(),
    }));
  }

  async create(product: Omit<Product, 'version' | 'created_at' | 'updated_at'>): Promise<Product> {
    const created = await prisma.product.create({
      data: {
        product_code: product.product_code,
        product_name: product.product_name,
        unit_price: product.unit_price,
      },
    });
    return {
      ...created,
      created_at: created.created_at.toISOString(),
      updated_at: created.updated_at.toISOString(),
    };
  }

  async update(code: string, product: Partial<Omit<Product, 'product_code' | 'created_at' | 'updated_at'>>): Promise<Product | null> {
    try {
      const updated = await prisma.product.update({
        where: { product_code: code },
        data: {
          ...(product.product_name !== undefined && { product_name: product.product_name }),
          ...(product.unit_price !== undefined && { unit_price: product.unit_price }),
        },
      });
      return {
        ...updated,
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  async delete(code: string, version: number): Promise<boolean> {
    try {
      const result = await prisma.product.deleteMany({
        where: { 
          product_code: code,
          version: version
        },
      });
      return result.count > 0;
    } catch (error) {
      return false;
    }
  }
}

export const productRepository = new ProductRepository();
