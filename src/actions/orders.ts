'use server';

import { auth } from '@/lib/auth';
import { orderRepository } from '@/lib/repositories/orderRepository';
import { Order, OrderDetail } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getOrders(keyword?: string) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  if (keyword) {
    return await orderRepository.search(keyword);
  }
  
  return await orderRepository.getAll();
}

export async function getOrdersPaginated(
  page: number = 1,
  pageSize: number = 20,
  keyword?: string,
  dateFrom?: string,
  dateTo?: string
) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  return await orderRepository.getPaginated(page, pageSize, keyword, dateFrom, dateTo);
}

export async function getOrderById(id: number) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  return await orderRepository.getById(id);
}

export async function searchOrders(keyword: string) {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized', data: [] };
  }

  try {
    const orders = await orderRepository.search(keyword);
    return { success: true, data: orders };
  } catch (error) {
    console.error('Search orders error:', error);
    return { success: false, error: 'Failed to search orders', data: [] };
  }
}

export async function createOrder(data: {
  customer_id: number;
  customer_name: string;
  order_date: string;
  total_amount: number;
  details: Omit<OrderDetail, 'detail_id' | 'order_id'>[];
}) {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const order = await orderRepository.create(
      {
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        order_date: data.order_date,
        total_amount: data.total_amount || 0,
        created_by: parseInt(session.user.id),
      },
      data.details || []
    );

    revalidatePath('/orders');
    return { success: true, data: order };
  } catch (error) {
    console.error('Create order error:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

export async function updateOrder(
  id: number,
  data: {
    customer_id?: number;
    customer_name?: string;
    order_date?: string;
    total_amount?: number;
    version?: number;
    details?: Omit<OrderDetail, 'detail_id' | 'order_id'>[];
  }
) {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const order = await orderRepository.update(
      id,
      {
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        order_date: data.order_date,
        total_amount: data.total_amount,
        version: data.version,
      },
      data.details
    );

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    revalidatePath('/orders');
    revalidatePath(`/orders/${id}`);
    return { success: true, data: order };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('更新されています')) {
      return { success: false, error: error.message };
    }
    console.error('Update order error:', error);
    return { success: false, error: 'Failed to update order' };
  }
}

export async function deleteOrder(id: number, version: number) {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const success = await orderRepository.delete(id, version);
    
    if (!success) {
      return { success: false, error: 'Order not found or version mismatch' };
    }

    revalidatePath('/orders');
    return { success: true };
  } catch (error) {
    console.error('Delete order error:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}

