import { Suspense } from 'react';
import { getCustomersPaginated } from '@/actions/customers';
import CustomersTable from './CustomersTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import SearchForm from './SearchForm';

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string; keyword?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const keyword = params.keyword;

  const data = await getCustomersPaginated(page, PAGE_SIZE, keyword);

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-emerald-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-emerald-900">得意先マスタ一覧</CardTitle>
              <CardDescription className="text-emerald-700">
                得意先情報の検索・管理
              </CardDescription>
            </div>
            <Link href="/customers/new">
              <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                新規追加
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <SearchForm initialKeyword={keyword} />
          
          <Suspense fallback={<TableSkeleton />}>
            <CustomersTable 
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
