"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  variant?: "table" | "cards" | "form" | "chart";
  rows?: number;
  columns?: number;
}

export function LoadingSkeleton({
  variant = "table",
  rows = 5,
  columns = 5,
}: LoadingSkeletonProps) {
  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-5 space-y-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-[250px] w-full rounded-lg" />
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="space-y-6 max-w-2xl">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Table skeleton
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 border-b border-border/30 last:border-0"
        >
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton
              key={j}
              className={`h-4 flex-1 ${j === 0 ? "max-w-[200px]" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
