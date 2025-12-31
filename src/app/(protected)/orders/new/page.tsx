'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SuggestTextBox from '@/components/SuggestTextBox';
import { Customer, Product } from '@/types';

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

// マイナスアイコンコンポーネント
const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

export default function NewOrderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
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
      order_date: new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0], // 日本時間
    },
  });

  const customerName = watch('customer_name');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const fetchCustomerSuggestions = async (keyword: string): Promise<Customer[]> => {
    if (!keyword) {
      return customers;
    }
    const k = keyword.toLowerCase();
    return customers.filter(
      (c) =>
        c.customer_name.toLowerCase().includes(k) ||
        (c.phone_number && c.phone_number.includes(k))
    );
  };

  const handleCustomerSelect = (customer: Customer) => {
    setValue('customer_id', customer.customer_id);
    setValue('customer_name', customer.customer_name);
  };

  const fetchProductSuggestions = async (keyword: string): Promise<Product[]> => {
    if (keyword.length < 1) {
      return [];
    }
    try {
      const response = await fetch(`/api/products?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
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
    // 商品名が入力されている明細をチェック
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
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          total_amount: calculateTotal(),
          details: validDetails.map((d) => ({
            product_code: d.product_code,
            product_name: d.product_name,
            quantity: d.quantity,
            unit_price: d.unit_price,
            amount: d.amount,
          })),
        }),
      });

      if (response.ok) {
        router.push('/orders');
      } else {
        alert('登録に失敗しました');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">受注登録</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customer_name" className="form-label">
              得意先名 <span className="text-red-500">*</span>
            </label>
            <SuggestTextBox
              value={customerName || ''}
              placeholder="(得意先名で検索)"
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
            {errors.customer_id && (
              <p className="text-red-500 text-sm mt-1">{errors.customer_id.message}</p>
            )}
            {errors.customer_name && (
              <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="order_date" className="form-label">
              受注日 <span className="text-red-500">*</span>
            </label>
            <input
              id="order_date"
              type="date"
              className={`form-control ${errors.order_date ? 'border-red-500' : ''}`}
              {...register('order_date')}
            />
            {errors.order_date && (
              <p className="text-red-500 text-sm mt-1">{errors.order_date.message}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold text-gray-900">明細</h4>
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={addDetail}
            >
              ＋明細を追加
            </button>
          </div>
          <table className="table table-bordered table-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-center p-2" style={{ width: '6%' }}></th>
                <th className="text-center p-2" style={{ width: '12%' }}>商品コード</th>
                <th className="text-center p-2" style={{ width: '28%' }}>商品名</th>
                <th className="text-center p-2" style={{ width: '13%' }}>単価</th>
                <th className="text-center p-2" style={{ width: '13%' }}>数量</th>
                <th className="text-center p-2" style={{ width: '18%' }}>金額</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr key={index}>
                  <td className="p-2 text-center align-middle">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger p-1"
                      onClick={() => removeDetail(index)}
                      disabled={details.length <= 1}
                      title="削除"
                    >
                      <MinusIcon />
                    </button>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      className="form-control"
                      value={detail.product_code || ''}
                      readOnly
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  </td>
                  <td className="p-2" style={{ position: 'relative', zIndex: details.length - index }}>
                    <SuggestTextBox
                      value={detail.product_name}
                      placeholder="(商品コードまたは商品名で検索)"
                      onValueChange={(val) => {
                        handleDetailChange(index, 'product_name', val);
                        if (!val) {
                          handleDetailChange(index, 'product_code', '');
                          handleDetailChange(index, 'unit_price', 0);
                          handleDetailChange(index, 'amount', 0);
                        }
                      }}
                      onSelect={(product) => handleProductSelect(index, product)}
                      fetchSuggestions={fetchProductSuggestions}
                      displayValueSelector={(item) => `${item.product_code} ${item.product_name}`}
                      startSearchChars={1}
                      debounceMs={300}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      className="form-control text-right"
                      value={detail.unit_price > 0 ? detail.unit_price.toLocaleString() : ''}
                      readOnly
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      className="form-control text-right"
                      value={detail.quantity || ''}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 0;
                        handleDetailChange(index, 'quantity', qty);
                      }}
                    />
                  </td>
                  <td className="p-2 text-right font-semibold text-gray-900 align-middle">
                    ¥{detail.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right font-bold p-2">
                  合計
                </td>
                <td className="text-right font-bold p-2">
                  ¥{calculateTotal().toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
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
