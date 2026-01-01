'use client';

import KeywordSearchForm from '@/components/KeywordSearchForm';

interface SearchFormProps {
  initialKeyword?: string;
}

export default function SearchForm({ initialKeyword }: SearchFormProps) {
  return (
    <KeywordSearchForm
      label="得意先名・電話番号"
      placeholder="キーワードを入力"
      basePath="/customers"
      initialKeyword={initialKeyword}
    />
  );
}
