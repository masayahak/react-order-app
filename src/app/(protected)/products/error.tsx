'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-red-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <CardTitle className="text-red-900">エラーが発生しました</CardTitle>
              <CardDescription className="text-red-700">
                データの読み込み中に問題が発生しました
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error.message || '予期しないエラーが発生しました。'}
            </p>
            <div className="flex gap-3">
              <Button onClick={reset} variant="default">
                再試行
              </Button>
              <Button
                onClick={() => window.location.href = '/products'}
                variant="outline"
              >
                ページを更新
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

