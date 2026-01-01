'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Customer } from '@/types';
import SuggestTextBox from '@/components/SuggestTextBox';
import { searchCustomers } from '@/actions/customers';

interface SearchFormProps {
  initialDateFrom?: string;
  initialDateTo?: string;
  initialCustomerName?: string;
}

export default function SearchForm({ 
  initialDateFrom, 
  initialDateTo, 
  initialCustomerName,
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateFrom, setDateFrom] = useState(initialDateFrom || '');
  const [dateTo, setDateTo] = useState(initialDateTo || '');
  const [customerName, setCustomerName] = useState(initialCustomerName || '');

  const fetchCustomerSuggestions = async (keyword: string) => {
    if (!keyword) return [];
    const result = await searchCustomers(keyword);
    return result.success ? result.data || [] : [];
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (dateFrom) {
      params.set('dateFrom', dateFrom);
    } else {
      params.delete('dateFrom');
    }
    if (dateTo) {
      params.set('dateTo', dateTo);
    } else {
      params.delete('dateTo');
    }
    if (customerName) {
      params.set('customerName', customerName);
    } else {
      params.delete('customerName');
    }
    params.set('page', '1');
    router.push(`/orders?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="customerName">得意先名</Label>
        <SuggestTextBox<Customer>
          id="customerName"
          value={customerName}
          onValueChange={setCustomerName}
          onSelect={(customer) => setCustomerName(customer.customer_name)}
          fetchSuggestions={fetchCustomerSuggestions}
          displayValueSelector={(customer) => customer.customer_name}
          placeholder="得意先名を入力"
          startSearchChars={0}
        />
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor="dateFrom">受注日（開始）</Label>
        <Input
          id="dateFrom"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor="dateTo">受注日（終了）</Label>
        <Input
          id="dateTo"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
      <div className="flex items-end">
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          検索
        </Button>
      </div>
    </div>
  );
}

