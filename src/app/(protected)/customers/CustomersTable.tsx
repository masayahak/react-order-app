'use client';

import { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DataTable, { ColumnDef } from '@/components/DataTable';

interface CustomersTableProps {
  data: Customer[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  keyword?: string;
}

export default function CustomersTable({
  data,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: CustomersTableProps) {
  const columns: ColumnDef<Customer>[] = [
    {
      key: 'customer_name',
      header: '得意先名',
      width: 'w-[60%]',
      sortable: true,
      sortField: 'customer_name',
      render: (customer) => customer.customer_name,
    },
    {
      key: 'phone_number',
      header: '電話番号',
      width: 'w-[25%]',
      sortable: true,
      sortField: 'phone_number',
      render: (customer) => customer.phone_number || '',
    },
    {
      key: 'actions',
      header: '操作',
      width: 'w-[15%]',
      align: 'center',
      headerAlign: 'center',
      render: (customer) => (
        <Link href={`/customers/${customer.customer_id}`}>
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
      basePath="/customers"
      keyExtractor={(customer) => customer.customer_id}
      emptyMessage="該当する得意先がありません。"
      defaultSortField="customer_name"
      defaultSortOrder="asc"
    />
  );
}
