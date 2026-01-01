'use client';

import { useState } from 'react';
import { Product } from '@/types';
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

type SortField = 'product_code' | 'product_name' | 'unit_price';
type SortOrder = 'asc' | 'desc';

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
  keyword,
}: ProductsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortField, setSortField] = useState<SortField>('product_code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedProducts = [...data].sort((a, b) => {
    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];

    if (sortField === 'unit_price') {
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
    router.push(`/products?${params.toString()}`);
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
                  onClick={() => handleSort('product_code')}
                  className="flex items-center"
                >
                  商品コード
                  <SortIcon field="product_code" />
                </Button>
              </TableHead>
              <TableHead className="w-[45%]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('product_name')}
                  className="flex items-center"
                >
                  商品名
                  <SortIcon field="product_name" />
                </Button>
              </TableHead>
              <TableHead className="w-[20%]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('unit_price')}
                  className="flex items-center"
                >
                  単価
                  <SortIcon field="unit_price" />
                </Button>
              </TableHead>
              <TableHead className="w-[15%] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  該当する商品がありません。
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => (
                <TableRow key={product.product_code}>
                  <TableCell>{product.product_code}</TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>¥{product.unit_price.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Link href={`/products/${product.product_code}`}>
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

