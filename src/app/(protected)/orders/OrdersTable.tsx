'use client';

import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DataTable, { ColumnDef } from '@/components/DataTable';

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
}: OrdersTableProps) {
  const columns: ColumnDef<Order>[] = [
    {
      key: 'order_date',
      header: '受注日',
      width: 'w-[20%]',
      sortable: true,
      sortField: 'order_date',
      render: (order) => order.order_date,
    },
    {
      key: 'customer_name',
      header: '得意先名',
      width: 'w-[40%]',
      sortable: true,
      sortField: 'customer_name',
      render: (order) => order.customer_name,
    },
    {
      key: 'total_amount',
      header: '合計金額',
      width: 'w-[25%]',
      sortable: true,
      sortField: 'total_amount',
      align: 'right',
      headerAlign: 'right',
      render: (order) => `¥${order.total_amount.toLocaleString()}`,
    },
    {
      key: 'actions',
      header: '操作',
      width: 'w-[15%]',
      align: 'center',
      headerAlign: 'center',
      render: (order) => (
        <Link href={`/orders/${order.order_id}`}>
          <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-50">
            詳細
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      pageSize={pageSize}
      basePath="/orders"
      keyExtractor={(order) => order.order_id}
      emptyMessage="該当する受注がありません。"
      defaultSortField="order_date"
      defaultSortOrder="desc"
    />
  );
}
