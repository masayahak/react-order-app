'use server';

import { auth } from '@/lib/auth';
import { productRepository } from '@/lib/repositories/productRepository';
import { withAuth, crudHelpers } from '@/lib/serverActionHelpers';

export async function getProducts(keyword?: string) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  if (keyword) {
    return await productRepository.search(keyword);
  }
  
  return await productRepository.getAll();
}

export async function getProductsPaginated(
  page: number = 1,
  pageSize: number = 10,
  keyword?: string
) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  return await productRepository.getPaginated(page, pageSize, keyword);
}

export async function getProductByCode(code: string) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  return await productRepository.getByCode(code);
}

export async function searchProducts(keyword: string) {
  return withAuth(async () => {
    const products = await productRepository.search(keyword);
    return products;
  });
}

export async function createProduct(data: {
  product_code: string;
  product_name: string;
  unit_price: number;
}) {
  return crudHelpers.create(
    async () => {
      return await productRepository.create({
        product_code: data.product_code,
        product_name: data.product_name,
        unit_price: data.unit_price || 0,
      });
    },
    ['/products']
  );
}

export async function updateProduct(
  code: string,
  data: {
    product_name?: string;
    unit_price?: number;
    version?: number;
  }
) {
  return crudHelpers.update(
    async () => {
      return await productRepository.update(code, {
        product_name: data.product_name,
        unit_price: data.unit_price,
        version: data.version,
      });
    },
    ['/products', `/products/${code}`],
    'Product not found'
  );
}

export async function deleteProduct(code: string, version: number) {
  return crudHelpers.delete(
    async () => await productRepository.delete(code, version),
    ['/products'],
    'Product not found or version mismatch'
  );
}
