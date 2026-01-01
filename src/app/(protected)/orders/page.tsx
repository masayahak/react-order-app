import { Suspense } from 'react';
import { getOrdersPaginated } from '@/actions/orders';
import OrdersTable from './OrdersTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import SearchForm from './SearchForm';

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string; dateFrom?: string; dateTo?: string }>;
}

// 日本時間で昨日と今日の日付を取得
function getDefaultDates() {
  const now = new Date();
  const jstOffset = 9 * 60; // 日本時間 (UTC+9)
  const jstNow = new Date(now.getTime() + jstOffset * 60 * 1000);
  
  const today = jstNow.toISOString().split('T')[0];
  
  const yesterday = new Date(jstNow);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  return { dateFrom: yesterdayStr, dateTo: today };
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const defaultDates = getDefaultDates();
  const dateFrom = params.dateFrom || defaultDates.dateFrom;
  const dateTo = params.dateTo || defaultDates.dateTo;

  const data = await getOrdersPaginated(page, PAGE_SIZE, undefined, dateFrom, dateTo);

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-blue-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">受注一覧</CardTitle>
              <CardDescription className="text-blue-700">
                受注情報の検索・管理
              </CardDescription>
            </div>
            <Link href="/orders/new">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                新規追加
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <SearchForm initialDateFrom={dateFrom} initialDateTo={dateTo} />
          
          <Suspense fallback={<TableSkeleton />}>
            <OrdersTable 
              data={data.data}
              currentPage={page}
              totalPages={data.totalPages}
              totalCount={data.totalCount}
              pageSize={PAGE_SIZE}
              dateFrom={dateFrom}
              dateTo={dateTo}
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
