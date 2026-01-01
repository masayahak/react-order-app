'use client';

import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DataTable, { ColumnDef } from '@/components/DataTable';
import { useSearchParams } from 'next/navigation';

interface OrdersTableProps {
  data: Order[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  dateFrom?: string;
  dateTo?: string;
  customerName?: string;
}

export default function OrdersTable({
  data,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  dateFrom,
  dateTo,
  customerName,
}: OrdersTableProps) {
  const searchParams = useSearchParams();
  
  const getDetailUrl = (orderId: number) => {
    const params = new URLSearchParams();
    if (dateFrom) {
      params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params.set('dateTo', dateTo);
    }
    if (customerName) {
      params.set('customerName', customerName);
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    const queryString = params.toString();
    return `/orders/${orderId}${queryString ? `?${queryString}` : ''}`;
  };
  const columns: ColumnDef<Order>[] = [
    {
      key: 'order_date',
      header: '受注日',
      width: 'w-[20%]',
      sortable: true,
      sortField: 'order_date',
      align: 'left',
      headerAlign: 'left',
      render: (order) => order.order_date,
    },
    {
      key: 'customer_name',
      header: '得意先名',
      width: 'w-[40%]',
      sortable: true,
      sortField: 'customer_name',
      align: 'left',
      headerAlign: 'left',
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
        <Link href={getDetailUrl(order.order_id)}>
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
