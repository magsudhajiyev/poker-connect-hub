'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component for poker table
const PokerTableSkeleton = () => (
  <div className="w-full max-w-4xl mx-auto p-4">
    <div className="relative w-full" style={{ aspectRatio: '2/1' }}>
      <Skeleton className="absolute inset-0 rounded-full" />
    </div>
  </div>
);

// Loading component for share hand form
const ShareHandFormSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
);

// Lazy load heavy components
export const LazyPokerTable = dynamic(
  () => import('./poker-table/PokerTable'),
  {
    loading: () => <PokerTableSkeleton />,
    ssr: true,
  }
);

export const LazyShareHandForm = dynamic(
  () => import('./ShareHandForm'),
  {
    loading: () => <ShareHandFormSkeleton />,
    ssr: true,
  }
);

export const LazyActionFlow = dynamic(
  () => import('./ActionFlow'),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: true,
  }
);

export const LazyHandReplay = dynamic(
  () => import('./HandReplay'),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false, // HandReplay likely has client-only features
  }
);

export const LazyHandDisplay = dynamic(
  () => import('./HandDisplay'),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: true,
  }
);