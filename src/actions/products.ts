'use server';

import { auth } from '@/lib/auth';
import { productRepository } from '@/lib/repositories/productRepository';
import { Product } from '@/types';
import { revalidatePath } from 'next/cache';

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
  pageSize: number = 20,
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
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized', data: [] };
  }

  try {
    const products = await productRepository.search(keyword);
    return { success: true, data: products };
  } catch (error) {
    console.error('Search products error:', error);
    return { success: false, error: 'Failed to search products', data: [] };
  }
}

export async function createProduct(data: {
  product_code: string;
  product_name: string;
  unit_price: number;
}) {
  const session = await auth();
  if (!session || session.user.role !== 'Administrator') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const product = await productRepository.create({
      product_code: data.product_code,
      product_name: data.product_name,
      unit_price: data.unit_price || 0,
    });

    revalidatePath('/products');
    return { success: true, data: product };
  } catch (error) {
    console.error('Create product error:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProduct(
  code: string,
  data: {
    product_name?: string;
    unit_price?: number;
    version?: number;
  }
) {
  const session = await auth();
  if (!session || session.user.role !== 'Administrator') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const product = await productRepository.update(code, {
      product_name: data.product_name,
      unit_price: data.unit_price,
      version: data.version,
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    revalidatePath('/products');
    revalidatePath(`/products/${code}`);
    return { success: true, data: product };
  } catch (error) {
    console.error('Update product error:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(code: string, version: number) {
  const session = await auth();
  if (!session || session.user.role !== 'Administrator') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const success = await productRepository.delete(code, version);
    
    if (!success) {
      return { success: false, error: 'Product not found or version mismatch' };
    }

    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    console.error('Delete product error:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

