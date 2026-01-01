'use server';

import { auth } from '@/lib/auth';
import { orderRepository } from '@/lib/repositories/orderRepository';
import { Order, OrderDetail } from '@/types';
import { withAuth, crudHelpers } from '@/lib/serverActionHelpers';

export async function getOrders() {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  return await orderRepository.getAll();
}

export async function getOrdersPaginated(
  page: number = 1,
  pageSize: number = 10,
  customerName?: string,
  dateFrom?: string,
  dateTo?: string
) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  return await orderRepository.getPaginated(page, pageSize, customerName, dateFrom, dateTo);
}

export async function getOrderById(id: number) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  return await orderRepository.getById(id);
}

export async function searchOrders(keyword: string) {
  return withAuth(async () => {
    const orders = await orderRepository.search(keyword);
    return orders;
  });
}

export async function createOrder(
  order: Omit<Order, 'order_id' | 'version' | 'created_at' | 'updated_at'>,
  details: Omit<OrderDetail, 'detail_id' | 'order_id'>[]
) {
  return crudHelpers.create(
    async () => {
      return await orderRepository.create(order, details);
    },
    ['/orders']
  );
}

export async function updateOrder(
  id: number,
  order: Partial<Omit<Order, 'order_id' | 'created_at' | 'updated_at'>>,
  details: Omit<OrderDetail, 'detail_id' | 'order_id'>[]
) {
  return crudHelpers.update(
    async () => {
      return await orderRepository.update(id, order, details);
    },
    ['/orders', `/orders/${id}`],
    'Order not found or version mismatch'
  );
}

export async function deleteOrder(id: number, version: number) {
  return crudHelpers.delete(
    async () => await orderRepository.delete(id, version),
    ['/orders'],
    'Order not found or version mismatch'
  );
}
