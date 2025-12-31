import db from '../db';
import { Order, OrderDetail, OrderWithDetails } from '@/types';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class OrderRepository {
  getAll(): Order[] {
    return db().prepare('SELECT * FROM orders ORDER BY order_date DESC, order_id DESC').all() as Order[];
  }

  getPaginated(
    page: number = 1, 
    pageSize: number = 20, 
    keyword?: string,
    dateFrom?: string,
    dateTo?: string
  ): PaginatedResult<Order> {
    const offset = (page - 1) * pageSize;
    let countQuery = 'SELECT COUNT(*) as count FROM orders';
    let dataQuery = 'SELECT * FROM orders';
    const conditions: string[] = [];
    const params: any[] = [];

    if (keyword) {
      const searchTerm = `%${keyword}%`;
      conditions.push('customer_name LIKE ?');
      params.push(searchTerm);
    }

    if (dateFrom) {
      conditions.push('order_date >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push('order_date <= ?');
      params.push(dateTo);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      countQuery += whereClause;
      dataQuery += whereClause;
    }

    dataQuery += ' ORDER BY order_date DESC, order_id DESC LIMIT ? OFFSET ?';

    const countResult = db().prepare(countQuery).get(...params) as { count: number };
    const totalCount = countResult.count;
    const totalPages = Math.ceil(totalCount / pageSize);

    const data = db().prepare(dataQuery).all(...params, pageSize, offset) as Order[];

    return {
      data,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }

  getById(id: number): OrderWithDetails | null {
    const order = db().prepare('SELECT * FROM orders WHERE order_id = ?').get(id) as Order | null;
    if (!order) {
      return null;
    }

    const details = db()
      .prepare('SELECT * FROM order_details WHERE order_id = ? ORDER BY detail_id')
      .all(id) as OrderDetail[];

    return {
      ...order,
      details,
    };
  }

  search(keyword: string): Order[] {
    const searchTerm = `%${keyword}%`;
    return db()
      .prepare('SELECT * FROM orders WHERE customer_name LIKE ? ORDER BY order_date DESC, order_id DESC')
      .all(searchTerm) as Order[];
  }

  create(
    order: Omit<Order, 'order_id' | 'version' | 'created_at' | 'updated_at'>,
    details: Omit<OrderDetail, 'detail_id' | 'order_id'>[]
  ): OrderWithDetails {
    const database = db();
    const insertOrder = database.prepare(
      'INSERT INTO orders (customer_id, customer_name, order_date, total_amount, created_by) VALUES (?, ?, ?, ?, ?)'
    );
    const insertDetail = database.prepare(
      'INSERT INTO order_details (order_id, product_id, product_name, quantity, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const transaction = database.transaction(() => {
      const orderResult = insertOrder.run(
        order.customer_id,
        order.customer_name,
        order.order_date,
        order.total_amount,
        order.created_by || null
      );
      const orderId = orderResult.lastInsertRowid as number;

      for (const detail of details) {
        insertDetail.run(
          orderId,
          detail.product_id,
          detail.product_name,
          detail.quantity,
          detail.unit_price,
          detail.amount
        );
      }

      return orderId;
    });

    const orderId = transaction();
    return this.getById(orderId)!;
  }

  update(
    id: number,
    order: Partial<Omit<Order, 'order_id' | 'created_at' | 'updated_at'>>,
    details?: Omit<OrderDetail, 'detail_id' | 'order_id'>[]
  ): OrderWithDetails | null {
    const current = this.getById(id);
    if (!current) {
      return null;
    }

    // 楽観的排他制御
    if (order.version !== undefined && order.version !== current.version) {
      throw new Error('他のユーザーによって更新されています。最新のデータを取得してください。');
    }

    const database = db();
    const updates: string[] = [];
    const values: any[] = [];

    if (order.customer_id !== undefined) {
      updates.push('customer_id = ?');
      values.push(order.customer_id);
    }
    if (order.customer_name !== undefined) {
      updates.push('customer_name = ?');
      values.push(order.customer_name);
    }
    if (order.order_date !== undefined) {
      updates.push('order_date = ?');
      values.push(order.order_date);
    }
    if (order.total_amount !== undefined) {
      updates.push('total_amount = ?');
      values.push(order.total_amount);
    }

    if (updates.length > 0) {
      updates.push('version = version + 1');
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      database.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?`).run(...values);
    }

    if (details) {
      const deleteDetails = database.prepare('DELETE FROM order_details WHERE order_id = ?');
      const insertDetail = database.prepare(
        'INSERT INTO order_details (order_id, product_id, product_name, quantity, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?)'
      );

      const transaction = database.transaction(() => {
        deleteDetails.run(id);
        for (const detail of details) {
          insertDetail.run(id, detail.product_id, detail.product_name, detail.quantity, detail.unit_price, detail.amount);
        }
      });

      transaction();
    }

    return this.getById(id);
  }

  delete(id: number): boolean {
    const result = db().prepare('DELETE FROM orders WHERE order_id = ?').run(id);
    return result.changes > 0;
  }
}

export const orderRepository = new OrderRepository();

