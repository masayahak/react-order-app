'use server';

import { auth } from '@/lib/auth';
import { customerRepository } from '@/lib/repositories/customerRepository';
import { withAuth, crudHelpers } from '@/lib/serverActionHelpers';

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
  pageSize: number = 10,
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
  return withAuth(async () => {
    const customers = await customerRepository.search(keyword);
    return customers;
  });
}

export async function createCustomer(data: {
  customer_name: string;
  phone_number?: string;
}) {
  return crudHelpers.create(
    async () => {
      return await customerRepository.create({
        customer_name: data.customer_name,
        phone_number: data.phone_number || null,
      });
    },
    ['/customers']
  );
}

export async function updateCustomer(
  id: number,
  data: {
    customer_name?: string;
    phone_number?: string;
    version?: number;
  }
) {
  return crudHelpers.update(
    async () => {
      return await customerRepository.update(id, {
        customer_name: data.customer_name,
        phone_number: data.phone_number || null,
        version: data.version,
      });
    },
    ['/customers', `/customers/${id}`],
    'Customer not found'
  );
}

export async function deleteCustomer(id: number, version: number) {
  return crudHelpers.delete(
    async () => await customerRepository.delete(id, version),
    ['/customers'],
    'Customer not found or version mismatch'
  );
}
