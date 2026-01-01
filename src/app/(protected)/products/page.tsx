import { Suspense } from 'react';
import { getProductsPaginated } from '@/actions/products';
import ProductsTable from './ProductsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import SearchForm from './SearchForm';

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string; keyword?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const keyword = params.keyword;

  const data = await getProductsPaginated(page, PAGE_SIZE, keyword);

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-purple-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-purple-900">商品マスタ一覧</CardTitle>
              <CardDescription className="text-purple-700">
                商品情報の検索・管理
              </CardDescription>
            </div>
            <Link href="/products/new">
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                新規追加
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <SearchForm initialKeyword={keyword} />
          
          <Suspense fallback={<TableSkeleton />}>
            <ProductsTable 
              data={data.data}
              currentPage={page}
              totalPages={data.totalPages}
              totalCount={data.totalCount}
              pageSize={PAGE_SIZE}
              keyword={keyword}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="p-8 text-center text-muted-foreground">
        読み込み中...
      </div>
    </div>
  );
}
