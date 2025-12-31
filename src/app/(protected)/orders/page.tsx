'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 20;

interface PaginatedResult {
  data: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadOrders = useCallback(async (page: number, kw: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
      });
      if (kw) {
        params.set('keyword', kw);
      }

      const response = await fetch(`/api/orders?${params}`);
      const data: PaginatedResult = await response.json();
      setOrders(data.data);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(1, '');
  }, [loadOrders]);

  const handleSearch = () => {
    setSearchKeyword(keyword);
    loadOrders(1, keyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    loadOrders(page, searchKeyword);
  };

  const handleAdd = () => {
    router.push('/orders/new');
  };

  const handleEdit = (id: number) => {
    router.push(`/orders/${id}`);
  };

  return (
    <div className="px-4 py-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">受注一覧</h3>

      <div className="mb-4 flex items-end gap-2">
        <div>
          <input
            type="text"
            className="form-control"
            placeholder="キーワード（得意先名）"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width: '300px', display: 'inline-block' }}
          />
        </div>
        <button className="btn btn-primary" onClick={handleSearch}>
          検索
        </button>
        <button className="btn btn-success ms-auto" onClick={handleAdd}>
          ＋追加
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-gray-700">読み込み中...</div>
      ) : (
        <>
          <table className="table table-striped table-bordered table-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-center p-2">受注日</th>
                <th className="text-center p-2">得意先名</th>
                <th className="text-center p-2">受注金額</th>
                <th className="text-center p-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    該当する受注がありません。
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id}>
                    <td className="p-2">{order.order_date}</td>
                    <td className="p-2">{order.customer_name}</td>
                    <td className="p-2 text-right">
                      ¥{order.total_amount.toLocaleString()}
                    </td>
                    <td className="text-center p-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(order.order_id)}
                      >
                        修正・確認
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
