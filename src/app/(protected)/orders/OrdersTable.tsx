'use client';

import { useState } from 'react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/Pagination';

type SortField = 'order_date' | 'customer_name' | 'total_amount';
type SortOrder = 'asc' | 'desc';

interface OrdersTableProps {
  data: Order[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  dateFrom?: string;
  dateTo?: string;
}

export default function OrdersTable({
  data,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  dateFrom,
  dateTo,
}: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortField, setSortField] = useState<SortField>('order_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'order_date' ? 'desc' : 'asc');
    }
  };

  const sortedOrders = [...data].sort((a, b) => {
    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];

    if (sortField === 'total_amount') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    aValue = String(aValue);
    bValue = String(bValue);

    return sortOrder === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/orders?${params.toString()}`);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('order_date')}
                  className="flex items-center"
                >
                  受注日
                  <SortIcon field="order_date" />
                </Button>
              </TableHead>
              <TableHead className="w-[45%]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('customer_name')}
                  className="flex items-center"
                >
                  得意先名
                  <SortIcon field="customer_name" />
                </Button>
              </TableHead>
              <TableHead className="w-[20%]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('total_amount')}
                  className="flex items-center"
                >
                  合計金額
                  <SortIcon field="total_amount" />
                </Button>
              </TableHead>
              <TableHead className="w-[15%] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  該当する受注がありません。
                </TableCell>
              </TableRow>
            ) : (
              sortedOrders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell>{order.order_date}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>¥{order.total_amount.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Link href={`/orders/${order.order_id}`}>
                      <Button variant="outline" size="sm">
                        詳細
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
}

