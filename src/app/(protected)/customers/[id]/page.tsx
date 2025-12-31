'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Customer } from '@/types';

const customerSchema = z.object({
  customer_name: z.string().min(1, '得意先名は必須です'),
  phone_number: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
        reset({
          customer_name: data.customer_name,
          phone_number: data.phone_number || '',
        });
      } else {
        alert('得意先が見つかりません');
        router.push('/customers');
      }
    } catch (error) {
      console.error('Failed to load customer:', error);
      alert('読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/customers');
      } else {
        alert('更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
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
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/customers');
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-900">読み込み中...</div>;
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">得意先マスタ修正・確認</h3>

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


