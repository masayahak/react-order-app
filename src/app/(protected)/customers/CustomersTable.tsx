'use client';

import { useState } from 'react';
import { Customer } from '@/types';
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

type SortField = 'customer_name' | 'phone_number';
type SortOrder = 'asc' | 'desc';

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
  keyword,
}: CustomersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortField, setSortField] = useState<SortField>('customer_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedCustomers = [...data].sort((a, b) => {
    let aValue: string = a[sortField] || '';
    let bValue: string = b[sortField] || '';

    return sortOrder === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/customers?${params.toString()}`);
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
              <TableHead className="w-[55%]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('customer_name')}
                  className="flex items-center"
                >
                  得意先名
                  <SortIcon field="customer_name" />
                </Button>
              </TableHead>
              <TableHead className="w-[30%]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('phone_number')}
                  className="flex items-center"
                >
                  電話番号
                  <SortIcon field="phone_number" />
                </Button>
              </TableHead>
              <TableHead className="w-[15%] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCustomers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  該当する得意先がありません。
                </TableCell>
              </TableRow>
            ) : (
              sortedCustomers.map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell>{customer.customer_name}</TableCell>
                  <TableCell>{customer.phone_number || ''}</TableCell>
                  <TableCell className="text-center">
                    <Link href={`/customers/${customer.customer_id}`}>
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

