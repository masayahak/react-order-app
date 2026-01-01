'use client';

import { useState, ReactNode } from 'react';
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
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/Pagination';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  sortField?: keyof T;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  basePath: string;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  defaultSortField?: keyof T;
  defaultSortOrder?: 'asc' | 'desc';
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  basePath,
  keyExtractor,
  emptyMessage = '該当するデータがありません。',
  defaultSortField,
  defaultSortOrder = 'asc',
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortField, setSortField] = useState<keyof T | undefined>(defaultSortField);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  const handleSort = (field: keyof T, defaultOrder?: 'asc' | 'desc') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(defaultOrder || 'asc');
    }
  };

  const sortedData = sortField
    ? [...data].sort((a, b) => {
        let aValue: string | number = a[sortField];
        let bValue: string | number = b[sortField];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        aValue = String(aValue);
        bValue = String(bValue);

        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      })
    : data;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${basePath}?${params.toString()}`);
  };

  const SortIcon = ({ field }: { field: keyof T }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return '';
    }
  };

  const getHeaderAlignClass = (headerAlign?: 'left' | 'center' | 'right', align?: 'left' | 'center' | 'right') => {
    // headerAlignが指定されていない場合はalignを参照
    const effectiveAlign = headerAlign ?? align;
    switch (effectiveAlign) {
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-start';
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                // headerAlignが指定されていない場合はalignを参照
                const effectiveHeaderAlign = column.headerAlign ?? column.align;
                return (
                  <TableHead
                    key={column.key}
                    className={`${column.width || ''} ${getAlignClass(effectiveHeaderAlign)}`}
                  >
                    {column.sortable && column.sortField ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column.sortField!, column.key === 'order_date' ? 'desc' : 'asc')}
                        className={`flex items-center ${getHeaderAlignClass(column.headerAlign, column.align)} w-full`}
                      >
                        {column.header}
                        <SortIcon field={column.sortField} />
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow key={keyExtractor(item)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={getAlignClass(column.align)}
                    >
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
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

