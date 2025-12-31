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
    return db().prepare('SELECT * FROM products ORDER BY product_name').all() as Product[];
  }

  getPaginated(page: number = 1, pageSize: number = 20, keyword?: string): PaginatedResult<Product> {
    const offset = (page - 1) * pageSize;
    let countQuery = 'SELECT COUNT(*) as count FROM products';
    let dataQuery = 'SELECT * FROM products';
    const params: (string | number)[] = [];

    if (keyword) {
      const searchTerm = `%${keyword}%`;
      countQuery += ' WHERE product_name LIKE ?';
      dataQuery += ' WHERE product_name LIKE ?';
      params.push(searchTerm);
    }

    dataQuery += ' ORDER BY product_name LIMIT ? OFFSET ?';

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

  getById(id: number): Product | null {
    return (db().prepare('SELECT * FROM products WHERE product_id = ?').get(id) as Product) || null;
  }

  search(keyword: string): Product[] {
    const searchTerm = `%${keyword}%`;
    return db()
      .prepare('SELECT * FROM products WHERE product_name LIKE ? ORDER BY product_name')
      .all(searchTerm) as Product[];
  }

  create(product: Omit<Product, 'product_id' | 'created_at' | 'updated_at'>): Product {
    const result = db()
      .prepare('INSERT INTO products (product_name, unit_price) VALUES (?, ?)')
      .run(product.product_name, product.unit_price);
    return this.getById(result.lastInsertRowid as number)!;
  }

  update(id: number, product: Partial<Omit<Product, 'product_id' | 'created_at' | 'updated_at'>>): Product | null {
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
      return this.getById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db().prepare(`UPDATE products SET ${updates.join(', ')} WHERE product_id = ?`).run(...values);
    return this.getById(id);
  }

  delete(id: number): boolean {
    const result = db().prepare('DELETE FROM products WHERE product_id = ?').run(id);
    return result.changes > 0;
  }
}

export const productRepository = new ProductRepository();

