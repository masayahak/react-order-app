'use client';

import ListErrorBoundary from '@/components/ListErrorBoundary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ListErrorBoundary
      error={error}
      reset={reset}
      redirectUrl="/products"
    />
  );
}
