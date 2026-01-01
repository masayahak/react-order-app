'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { updateProduct, deleteProduct } from '@/actions/products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  product: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    product_name: product.product_name,
    unit_price: product.unit_price.toString(),
    version: product.version,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateProduct(product.product_code, {
        product_name: formData.product_name,
        unit_price: parseInt(formData.unit_price) || 0,
        version: formData.version,
      });
      if (result.success) {
        toast({
          title: "更新完了",
          description: "商品を更新しました",
        });
        router.push('/products');
      } else {
        toast({
          variant: "destructive",
          title: "更新失敗",
          description: result.error || '更新に失敗しました',
        });
      }
    } catch (error) {
      console.error('更新エラー:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: 'エラーが発生しました',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return;

    setIsDeleting(true);
    try {
      const result = await deleteProduct(product.product_code, formData.version);
      if (result.success) {
        toast({
          title: "削除完了",
          description: "商品を削除しました",
        });
        router.push('/products');
      } else {
        toast({
          variant: "destructive",
          title: "削除失敗",
          description: result.error || '削除に失敗しました',
        });
      }
    } catch (error) {
      console.error('削除エラー:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: 'エラーが発生しました',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-purple-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
          <CardTitle className="text-purple-900">商品情報編集</CardTitle>
          <CardDescription className="text-purple-700">
            商品情報の編集・削除
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product_code">商品コード</Label>
              <Input
                id="product_code"
                value={product.product_code}
                disabled
                className="bg-muted"
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

              <div className="flex gap-4">
                <Link href="/products">
                  <Button type="button" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    戻る
                  </Button>
                </Link>

                <Button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
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

