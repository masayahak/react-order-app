'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product } from '@/types';

const productSchema = z.object({
  product_name: z.string().min(1, '商品名は必須です'),
  unit_price: z.number().min(0, '単価は0以上である必要があります'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        reset({
          product_name: data.product_name,
          unit_price: data.unit_price,
        });
      } else {
        alert('商品が見つかりません');
        router.push('/products');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      alert('読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/products');
      } else {
        alert('更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/products');
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-900">読み込み中...</div>;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">商品マスタ修正・確認</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="product_name" className="form-label">
            商品名 <span className="text-red-500">*</span>
          </label>
          <input
            id="product_name"
            type="text"
            className={`form-control ${errors.product_name ? 'border-red-500' : ''}`}
            {...register('product_name')}
          />
          {errors.product_name && (
            <p className="text-red-500 text-sm mt-1">{errors.product_name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="unit_price" className="form-label">
            単価 <span className="text-red-500">*</span>
          </label>
          <input
            id="unit_price"
            type="number"
            className={`form-control ${errors.unit_price ? 'border-red-500' : ''}`}
            {...register('unit_price', { valueAsNumber: true })}
          />
          {errors.unit_price && (
            <p className="text-red-500 text-sm mt-1">{errors.unit_price.message}</p>
          )}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '削除中...' : '削除'}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.back()}
            >
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '更新中...' : '更新'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


