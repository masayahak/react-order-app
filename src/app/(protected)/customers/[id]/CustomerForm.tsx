'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/types';
import { updateCustomer, deleteCustomer } from '@/actions/customers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface CustomerFormProps {
  customer: Customer;
}

export default function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_name: customer.customer_name,
    phone_number: customer.phone_number || '',
    version: customer.version,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateCustomer(customer.customer_id, formData);
      if (result.success) {
        alert('得意先を更新しました');
        router.push('/customers');
      } else {
        alert(result.error || '更新に失敗しました');
      }
    } catch (error) {
      console.error('更新エラー:', error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return;

    setIsDeleting(true);
    try {
      const result = await deleteCustomer(customer.customer_id, formData.version);
      if (result.success) {
        alert('得意先を削除しました');
        router.push('/customers');
      } else {
        alert(result.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('エラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-emerald-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardTitle className="text-emerald-900">得意先情報編集</CardTitle>
          <CardDescription className="text-emerald-700">
            得意先情報の編集・削除
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="customer_name">
                得意先名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">電話番号</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div className="flex justify-between">
              <Link href="/customers">
                <Button type="button" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  戻る
                </Button>
              </Link>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? '削除中...' : '削除'}
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? '更新中...' : '更新'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

