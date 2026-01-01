'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface KeywordSearchFormProps {
  label: string;
  placeholder?: string;
  basePath: string;
  initialKeyword?: string;
}

export default function KeywordSearchForm({
  label,
  placeholder = 'キーワードを入力',
  basePath,
  initialKeyword = '',
}: KeywordSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (keyword) {
      params.set('keyword', keyword);
    } else {
      params.delete('keyword');
    }
    params.set('page', '1');
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="mb-6 flex gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="keyword">{label}</Label>
        <Input
          id="keyword"
          placeholder={placeholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
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

