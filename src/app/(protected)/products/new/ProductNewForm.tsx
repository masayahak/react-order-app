'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/actions/products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ProductNewForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    product_code: '',
    product_name: '',
    unit_price: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createProduct({
        product_code: formData.product_code,
        product_name: formData.product_name,
        unit_price: parseInt(formData.unit_price) || 0,
      });
      if (result.success) {
        toast({
          title: "登録完了",
          description: "商品を登録しました",
        });
        router.push('/products');
      } else {
        toast({
          variant: "destructive",
          title: "登録失敗",
          description: result.error || '登録に失敗しました',
        });
      }
    } catch (error) {
      console.error('登録エラー:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: 'エラーが発生しました',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-purple-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
          <CardTitle className="text-purple-900">商品新規登録</CardTitle>
          <CardDescription className="text-purple-700">
            新しい商品情報を登録
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product_code">
                商品コード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product_code"
                value={formData.product_code}
                onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">
                商品名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">
                単価 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unit_price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                required
                min="0"
              />
            </div>

            <div className="flex justify-between">
              <Link href="/products">
                <Button type="button" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  戻る
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? '登録中...' : '登録'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

