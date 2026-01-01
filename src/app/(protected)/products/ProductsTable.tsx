'use client';

import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DataTable, { ColumnDef } from '@/components/DataTable';

interface ProductsTableProps {
  data: Product[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  keyword?: string;
}

export default function ProductsTable({
  data,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: ProductsTableProps) {
  const columns: ColumnDef<Product>[] = [
    {
      key: 'product_code',
      header: '商品コード',
      width: 'w-[20%]',
      sortable: true,
      sortField: 'product_code',
      render: (product) => product.product_code,
    },
    {
      key: 'product_name',
      header: '商品名',
      width: 'w-[40%]',
      sortable: true,
      sortField: 'product_name',
      render: (product) => product.product_name,
    },
    {
      key: 'unit_price',
      header: '単価',
      width: 'w-[25%]',
      sortable: true,
      sortField: 'unit_price',
      align: 'right',
      headerAlign: 'right',
      render: (product) => `¥${product.unit_price.toLocaleString()}`,
    },
    {
      key: 'actions',
      header: '操作',
      width: 'w-[15%]',
      align: 'center',
      headerAlign: 'center',
      render: (product) => (
        <Link href={`/products/${product.product_code}`}>
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
      basePath="/products"
      keyExtractor={(product) => product.product_code}
      emptyMessage="該当する商品がありません。"
      defaultSortField="product_code"
      defaultSortOrder="asc"
    />
  );
}
