'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SuggestTextBox from '@/components/SuggestTextBox';
import { Customer, Product, OrderWithDetails, OrderDetail as OrderDetailType } from '@/types';
import { searchCustomers } from '@/actions/customers';
import { searchProducts as searchProductsAction } from '@/actions/products';
import { updateOrder, deleteOrder } from '@/actions/orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

const orderSchema = z.object({
  customer_id: z.number().min(1, '得意先を選択してください'),
  customer_name: z.string().min(1, '得意先名は必須です'),
  order_date: z.string().min(1, '受注日は必須です'),
  version: z.number(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderDetail {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface OrderFormProps {
  order: OrderWithDetails;
}

export default function OrderForm({ order }: OrderFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [details, setDetails] = useState<OrderDetail[]>(
    order.details.map((detail) => ({
      product_code: detail.product_code,
      product_name: detail.product_name,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      amount: detail.amount,
    }))
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: order.customer_id,
      customer_name: order.customer_name,
      order_date: order.order_date,
      version: order.version,
    },
  });

  const customerName = watch('customer_name');

  const fetchCustomerSuggestions = async (keyword: string): Promise<Customer[]> => {
    if (keyword.length < 1) return [];
    const result = await searchCustomers(keyword);
    return result.success ? result.data || [] : [];
  };

  const handleCustomerSelect = (customer: Customer) => {
    setValue('customer_id', customer.customer_id);
    setValue('customer_name', customer.customer_name);
  };

  const fetchProductSuggestions = async (keyword: string): Promise<Product[]> => {
    if (keyword.length < 1) return [];
    const result = await searchProductsAction(keyword);
    return result.success ? result.data || [] : [];
  };

  const handleProductSelect = (index: number, product: Product) => {
    setDetails((prevDetails) => {
      const quantity = prevDetails[index].quantity || 1;
      const amount = quantity * product.unit_price;
      
      const newDetails = prevDetails.map((detail, i) => 
        i === index 
          ? {
              product_code: product.product_code,
              product_name: product.product_name,
              unit_price: product.unit_price,
              quantity: quantity,
              amount: amount,
            }
          : detail
      );
      
      return newDetails;
    });
  };

  const handleDetailChange = (index: number, field: keyof OrderDetail, value: string | number) => {
    setDetails((prevDetails) => {
      const newDetails = prevDetails.map((detail, i) => {
        if (i !== index) return detail;
        
        const updated = {
          ...detail,
          [field]: value,
        };

        if (field === 'quantity' || field === 'unit_price') {
          updated.amount = updated.quantity * updated.unit_price;
        }

        return updated;
      });

      return newDetails;
    });
  };

  const calculateTotal = () => {
    return details.reduce((sum, detail) => sum + detail.amount, 0);
  };

  const addDetail = () => {
    setDetails((prevDetails) => [
      ...prevDetails,
      {
        product_code: '',
        product_name: '',
        quantity: 0,
        unit_price: 0,
        amount: 0,
      }
    ]);
  };

  const removeDetail = (index: number) => {
    if (details.length <= 1) {
      alert('最低1行は必要です');
      return;
    }
    setDetails((prevDetails) => prevDetails.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: OrderFormData) => {
    const validDetails = details.filter((d) => 
      d.product_code.trim() !== '' && 
      d.product_name.trim() !== '' && 
      d.quantity > 0 && 
      d.unit_price > 0
    );
    
    if (validDetails.length === 0) {
      alert('明細を1件以上登録してください（商品名、数量、単価が必要です）');
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateOrder(order.order_id, {
        ...data,
        total_amount: calculateTotal(),
        details: validDetails,
      });

      if (result.success) {
        alert('受注を更新しました');
        router.push('/orders');
      } else {
        alert(result.error || '更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return;

    setDeleting(true);
    try {
      const version = watch('version');
      const result = await deleteOrder(order.order_id, version);
      if (result.success) {
        alert('受注を削除しました');
        router.push('/orders');
      } else {
        alert(result.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-blue-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-blue-900">受注情報編集</CardTitle>
          <CardDescription className="text-blue-700">
            受注情報の編集・削除
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer_name">
                  得意先名 <span className="text-destructive">*</span>
                </Label>
                <SuggestTextBox
                  value={customerName || ''}
                  placeholder="得意先名で検索"
                  onValueChange={(val) => {
                    setValue('customer_name', val);
                    if (!val) setValue('customer_id', 0);
                  }}
                  onSelect={handleCustomerSelect}
                  fetchSuggestions={fetchCustomerSuggestions}
                  displayValueSelector={(item) => item.customer_name}
                  startSearchChars={0}
                />
                <input type="hidden" {...register('customer_id')} />
                <input type="hidden" {...register('version')} />
                {(errors.customer_id || errors.customer_name) && (
                  <p className="text-destructive text-sm">
                    {errors.customer_id?.message || errors.customer_name?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_date">
                  受注日 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="order_date"
                  type="date"
                  {...register('order_date')}
                />
                {errors.order_date && (
                  <p className="text-destructive text-sm">{errors.order_date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg">明細</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDetail}>
                  <Plus className="mr-2 h-4 w-4" />
                  明細を追加
                </Button>
              </div>

              <div className="border rounded-md overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-center w-12"></th>
                      <th className="p-2 text-center w-32">商品コード</th>
                      <th className="p-2 text-center">商品名</th>
                      <th className="p-2 text-center w-32">単価</th>
                      <th className="p-2 text-center w-28">数量</th>
                      <th className="p-2 text-center w-40">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 text-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDetail(index)}
                            disabled={details.length <= 1}
                            className="border-red-500 text-red-500 hover:bg-red-50 w-8 h-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </td>
                        <td className="p-2" style={{ position: 'relative', zIndex: details.length - index }}>
                          <SuggestTextBox
                            value={detail.product_code}
                            placeholder="商品コード"
                            onValueChange={(val) => {
                              handleDetailChange(index, 'product_code', val);
                              if (!val) {
                                handleDetailChange(index, 'product_name', '');
                                handleDetailChange(index, 'unit_price', 0);
                                handleDetailChange(index, 'amount', 0);
                              }
                            }}
                            onSelect={(product) => handleProductSelect(index, product)}
                            fetchSuggestions={fetchProductSuggestions}
                            displayValueSelector={(item) => `${item.product_code} ${item.product_name}`}
                            valueSelector={(item) => item.product_code}
                            dropdownMinWidth="400px"
                            startSearchChars={1}
                            debounceMs={300}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="text"
                            value={detail.product_name || ''}
                            readOnly
                            className="bg-muted"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="text"
                            value={detail.unit_price > 0 ? detail.unit_price.toLocaleString() : ''}
                            readOnly
                            className="bg-muted text-right"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="0"
                            value={detail.quantity || ''}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0;
                              handleDetailChange(index, 'quantity', qty);
                            }}
                            className="text-right"
                          />
                        </td>
                        <td className="p-2 text-right font-semibold">
                          ¥{detail.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted font-bold">
                    <tr>
                      <td colSpan={5} className="text-right p-2">
                        合計
                      </td>
                      <td className="text-right p-2">
                        ¥{calculateTotal().toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-between">
              <Link href="/orders">
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
                  disabled={deleting || submitting}
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? '削除中...' : '削除'}
                </Button>

                <Button
                  type="submit"
                  disabled={submitting || deleting}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? '更新中...' : '更新'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

