import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ListLoadingSkeletonProps {
  themeColor?: 'emerald' | 'purple' | 'blue';
  hasDateRange?: boolean;
}

export default function ListLoadingSkeleton({
  themeColor = 'blue',
  hasDateRange = false,
}: ListLoadingSkeletonProps) {
  const colorClasses = {
    emerald: {
      border: 'border-t-emerald-500',
      bg: 'from-emerald-50 to-teal-50',
    },
    purple: {
      border: 'border-t-purple-500',
      bg: 'from-purple-50 to-violet-50',
    },
    blue: {
      border: 'border-t-blue-500',
      bg: 'from-blue-50 to-indigo-50',
    },
  };

  const colors = colorClasses[themeColor];

  return (
    <div className="space-y-6">
      <Card className={`border-t-4 ${colors.border} shadow-lg`}>
        <CardHeader className={`bg-gradient-to-r ${colors.bg}`}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 flex gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            {hasDateRange && (
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            <div className="flex items-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-8">
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-64" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

