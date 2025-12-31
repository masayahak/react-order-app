'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  product_name: z.string().min(1, '商品名は必須です'),
  unit_price: z.number().min(0, '単価は0以上である必要があります'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/products');
      } else {
        alert('登録に失敗しました');
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">商品マスタ登録</h3>

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

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.back()}
          >
            戻る
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? '登録中...' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
}


