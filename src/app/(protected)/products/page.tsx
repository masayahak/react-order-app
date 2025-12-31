'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 20;

interface PaginatedResult {
  data: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadProducts = useCallback(async (page: number, kw: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
      });
      if (kw) {
        params.set('keyword', kw);
      }

      const response = await fetch(`/api/products?${params}`);
      const data: PaginatedResult = await response.json();
      setProducts(data.data);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(1, '');
  }, [loadProducts]);

  const handleSearch = () => {
    setSearchKeyword(keyword);
    loadProducts(1, keyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    loadProducts(page, searchKeyword);
  };

  const handleAdd = () => {
    router.push('/products/new');
  };

  const handleEdit = (id: number) => {
    router.push(`/products/${id}`);
  };

  return (
    <div className="px-4 py-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">商品マスタ一覧</h3>

      <div className="mb-4 flex items-end gap-2">
        <div>
          <input
            type="text"
            className="form-control"
            placeholder="キーワード（商品名）"
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
                <th className="text-center p-2" style={{ width: '60%' }}>
                  商品名
                </th>
                <th className="text-center p-2" style={{ width: '25%' }}>
                  単価
                </th>
                <th className="text-center p-2" style={{ width: '15%' }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-4">
                    該当する商品がありません。
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.product_id}>
                    <td className="p-2">{product.product_name}</td>
                    <td className="p-2 text-right">
                      ¥{product.unit_price.toLocaleString()}
                    </td>
                    <td className="text-center p-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(product.product_id)}
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
