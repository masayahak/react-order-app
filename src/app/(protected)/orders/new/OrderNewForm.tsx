'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SuggestTextBox from '@/components/SuggestTextBox';
import { Customer, Product } from '@/types';
import { searchCustomers } from '@/actions/customers';
import { createOrder } from '@/actions/orders';
import { searchProducts as searchProductsAction } from '@/actions/products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const orderSchema = z.object({
  customer_id: z.number().min(1, '得意先を選択してください'),
  customer_name: z.string().min(1, '得意先名は必須です'),
  order_date: z.string().min(1, '受注日は必須です'),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderDetail {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export default function OrderNewForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<OrderDetail[]>([
    {
      product_code: '',
      product_name: '',
      quantity: 0,
      unit_price: 0,
      amount: 0,
    }
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      order_date: new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      toast({
        variant: "destructive",
        title: "削除できません",
        description: "最低1行は必要です",
      });
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
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "明細を1件以上登録してください（商品名、数量、単価が必要です）",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        ...data,
        total_amount: calculateTotal(),
        created_by: null,
      }, validDetails);

      if (result.success) {
        toast({
          title: "登録完了",
          description: "受注を登録しました",
        });
        router.push('/orders');
      } else {
        toast({
          variant: "destructive",
          title: "登録失敗",
          description: result.error || '登録に失敗しました',
        });
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: '登録に失敗しました',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-blue-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-blue-900">受注新規登録</CardTitle>
          <CardDescription className="text-blue-700">
            新しい受注情報を登録
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
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addDetail}
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  明細を追加
                </Button>
              </div>

              <div className="border rounded-md overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-center w-12"></th>
                      <th className="p-2 text-left w-32">商品コード</th>
                      <th className="p-2 text-left w-48">商品名</th>
                      <th className="p-2 text-right w-28">単価</th>
                      <th className="p-2 text-right w-24">数量</th>
                      <th className="p-2 text-right w-32">金額</th>
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
                          <div className="px-3 py-2 text-sm">
                            {detail.product_name || ''}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="px-3 py-2 text-sm text-right">
                            {detail.unit_price > 0 ? `¥${detail.unit_price.toLocaleString()}` : ''}
                          </div>
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
                      <td colSpan={5} className="p-2 text-right pr-4">
                        合計
                      </td>
                      <td className="p-2 text-right font-semibold text-lg">
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

              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {submitting ? '登録中...' : '登録'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

