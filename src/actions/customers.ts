'use server';

import { auth } from '@/lib/auth';
import { customerRepository } from '@/lib/repositories/customerRepository';
import { Customer } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getCustomers(keyword?: string) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  if (keyword) {
    return await customerRepository.search(keyword);
  }
  
  return await customerRepository.getAll();
}

export async function getCustomersPaginated(
  page: number = 1,
  pageSize: number = 20,
  keyword?: string
) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  return await customerRepository.getPaginated(page, pageSize, keyword);
}

export async function getCustomerById(id: number) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  return await customerRepository.getById(id);
}

export async function searchCustomers(keyword: string) {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized', data: [] };
  }

  try {
    const customers = await customerRepository.search(keyword);
    return { success: true, data: customers };
  } catch (error) {
    console.error('Search customers error:', error);
    return { success: false, error: 'Failed to search customers', data: [] };
  }
}

export async function createCustomer(data: {
  customer_name: string;
  phone_number?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== 'Administrator') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const customer = await customerRepository.create({
      customer_name: data.customer_name,
      phone_number: data.phone_number || null,
    });

    revalidatePath('/customers');
    return { success: true, data: customer };
  } catch (error) {
    console.error('Create customer error:', error);
    return { success: false, error: 'Failed to create customer' };
  }
}

export async function updateCustomer(
  id: number,
  data: {
    customer_name?: string;
    phone_number?: string;
    version?: number;
  }
) {
  const session = await auth();
  if (!session || session.user.role !== 'Administrator') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const customer = await customerRepository.update(id, {
      customer_name: data.customer_name,
      phone_number: data.phone_number || null,
      version: data.version,
    });

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    revalidatePath('/customers');
    revalidatePath(`/customers/${id}`);
    return { success: true, data: customer };
  } catch (error) {
    console.error('Update customer error:', error);
    return { success: false, error: 'Failed to update customer' };
  }
}

export async function deleteCustomer(id: number, version: number) {
  const session = await auth();
  if (!session || session.user.role !== 'Administrator') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const success = await customerRepository.delete(id, version);
    
    if (!success) {
      return { success: false, error: 'Customer not found or version mismatch' };
    }

    revalidatePath('/customers');
    return { success: true };
  } catch (error) {
    console.error('Delete customer error:', error);
    return { success: false, error: 'Failed to delete customer' };
  }
}

