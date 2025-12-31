import db from '../db';
import { Product } from '@/types';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ProductRepository {
  getAll(): Product[] {
    return db().prepare('SELECT * FROM products ORDER BY product_code').all() as Product[];
  }

  getPaginated(page: number = 1, pageSize: number = 20, keyword?: string): PaginatedResult<Product> {
    const offset = (page - 1) * pageSize;
    let countQuery = 'SELECT COUNT(*) as count FROM products';
    let dataQuery = 'SELECT * FROM products';
    const params: (string | number)[] = [];

    if (keyword) {
      const searchTerm = `%${keyword}%`;
      countQuery += ' WHERE product_code LIKE ? OR product_name LIKE ?';
      dataQuery += ' WHERE product_code LIKE ? OR product_name LIKE ?';
      params.push(searchTerm, searchTerm);
    }

    dataQuery += ' ORDER BY product_code LIMIT ? OFFSET ?';

    const countResult = db().prepare(countQuery).get(...params) as { count: number };
    const totalCount = countResult.count;
    const totalPages = Math.ceil(totalCount / pageSize);

    const data = db().prepare(dataQuery).all(...params, pageSize, offset) as Product[];

    return {
      data,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }

  getByCode(code: string): Product | null {
    return (db().prepare('SELECT * FROM products WHERE product_code = ?').get(code) as Product) || null;
  }

  search(keyword: string): Product[] {
    const searchTerm = `%${keyword}%`;
    return db()
      .prepare('SELECT * FROM products WHERE product_code LIKE ? OR product_name LIKE ? ORDER BY product_code')
      .all(searchTerm, searchTerm) as Product[];
  }

  create(product: Omit<Product, 'created_at' | 'updated_at'>): Product {
    db()
      .prepare('INSERT INTO products (product_code, product_name, unit_price) VALUES (?, ?, ?)')
      .run(product.product_code, product.product_name, product.unit_price);
    return this.getByCode(product.product_code)!;
  }

  update(code: string, product: Partial<Omit<Product, 'product_code' | 'created_at' | 'updated_at'>>): Product | null {
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (product.product_name !== undefined) {
      updates.push('product_name = ?');
      values.push(product.product_name);
    }
    if (product.unit_price !== undefined) {
      updates.push('unit_price = ?');
      values.push(product.unit_price);
    }

    if (updates.length === 0) {
      return this.getByCode(code);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(code);

    db().prepare(`UPDATE products SET ${updates.join(', ')} WHERE product_code = ?`).run(...values);
    return this.getByCode(code);
  }

  delete(code: string): boolean {
    const result = db().prepare('DELETE FROM products WHERE product_code = ?').run(code);
    return result.changes > 0;
  }
}

export const productRepository = new ProductRepository();
