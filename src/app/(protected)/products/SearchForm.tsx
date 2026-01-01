'use client';

import KeywordSearchForm from '@/components/KeywordSearchForm';

interface SearchFormProps {
  initialKeyword?: string;
}

export default function SearchForm({ initialKeyword }: SearchFormProps) {
  return (
    <KeywordSearchForm
      label="商品コード・商品名"
      placeholder="キーワードを入力"
      basePath="/products"
      initialKeyword={initialKeyword}
    />
  );
}
