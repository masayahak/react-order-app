import db from '../db';
import { Customer } from '@/types';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class CustomerRepository {
  getAll(): Customer[] {
    return db().prepare('SELECT * FROM customers ORDER BY customer_name').all() as Customer[];
  }

  getPaginated(page: number = 1, pageSize: number = 20, keyword?: string): PaginatedResult<Customer> {
    const offset = (page - 1) * pageSize;
    let countQuery = 'SELECT COUNT(*) as count FROM customers';
    let dataQuery = 'SELECT * FROM customers';
    const params: (string | number)[] = [];

    if (keyword) {
      const searchTerm = `%${keyword}%`;
      countQuery += ' WHERE customer_name LIKE ? OR phone_number LIKE ?';
      dataQuery += ' WHERE customer_name LIKE ? OR phone_number LIKE ?';
      params.push(searchTerm, searchTerm);
    }

    dataQuery += ' ORDER BY customer_name LIMIT ? OFFSET ?';

    const countResult = db().prepare(countQuery).get(...params) as { count: number };
    const totalCount = countResult.count;
    const totalPages = Math.ceil(totalCount / pageSize);

    const data = db().prepare(dataQuery).all(...params, pageSize, offset) as Customer[];

    return {
      data,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }

  getById(id: number): Customer | null {
    return (db().prepare('SELECT * FROM customers WHERE customer_id = ?').get(id) as Customer) || null;
  }

  search(keyword: string): Customer[] {
    const searchTerm = `%${keyword}%`;
    return db()
      .prepare(
        'SELECT * FROM customers WHERE customer_name LIKE ? OR phone_number LIKE ? ORDER BY customer_name'
      )
      .all(searchTerm, searchTerm) as Customer[];
  }

  create(customer: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>): Customer {
    const result = db()
      .prepare('INSERT INTO customers (customer_name, phone_number) VALUES (?, ?)')
      .run(customer.customer_name, customer.phone_number || null);
    return this.getById(result.lastInsertRowid as number)!;
  }

  update(id: number, customer: Partial<Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>>): Customer | null {
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (customer.customer_name !== undefined) {
      updates.push('customer_name = ?');
      values.push(customer.customer_name);
    }
    if (customer.phone_number !== undefined) {
      updates.push('phone_number = ?');
      values.push(customer.phone_number);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db().prepare(`UPDATE customers SET ${updates.join(', ')} WHERE customer_id = ?`).run(...values);
    return this.getById(id);
  }

  delete(id: number): boolean {
    const result = db().prepare('DELETE FROM customers WHERE customer_id = ?').run(id);
    return result.changes > 0;
  }
}

export const customerRepository = new CustomerRepository();

