'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const customerSchema = z.object({
  customer_name: z.string().min(1, '得意先名は必須です'),
  phone_number: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function NewCustomerPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (data: CustomerFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/customers');
      } else {
        alert('登録に失敗しました');
      }
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">得意先マスタ登録</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="customer_name" className="form-label">
            得意先名 <span className="text-red-500">*</span>
          </label>
          <input
            id="customer_name"
            type="text"
            className={`form-control ${errors.customer_name ? 'border-red-500' : ''}`}
            {...register('customer_name')}
          />
          {errors.customer_name && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="phone_number" className="form-label">
            電話番号
          </label>
          <input
            id="phone_number"
            type="text"
            className="form-control"
            {...register('phone_number')}
          />
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


