'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  hasMore?: boolean;
  loading?: boolean;
}

export const useInfiniteScroll = (
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    hasMore = true,
    loading = false
  } = options;

  const [isFetching, setIsFetching] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading && !isFetching) {
        setIsFetching(true);
        callback();
      }
    },
    [callback, hasMore, loading, isFetching]
  );

  useEffect(() => {
    if (!targetRef) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin
    });

    observer.observe(targetRef);

    return () => {
      if (targetRef) observer.unobserve(targetRef);
    };
  }, [targetRef, handleObserver, threshold, rootMargin]);

  useEffect(() => {
    if (!loading) {
      setIsFetching(false);
    }
  }, [loading]);

  return { setTargetRef, isFetching };
};

export const useProgressiveLoading = <T>(
  items: T[],
  itemsPerBatch: number = 6,
  delay: number = 100
) => {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadMoreItems = useCallback(() => {
    if (currentIndex >= items.length) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const nextIndex = Math.min(currentIndex + itemsPerBatch, items.length);
      const newItems = items.slice(currentIndex, nextIndex);
      
      setVisibleItems(prev => [...prev, ...newItems]);
      setCurrentIndex(nextIndex);
      setIsLoading(false);
    }, delay);
  }, [items, currentIndex, itemsPerBatch, delay]);

  useEffect(() => {
    if (items.length > 0 && visibleItems.length === 0) {
      loadMoreItems();
    }
  }, [items, visibleItems.length, loadMoreItems]);

  const hasMore = currentIndex < items.length;

  return {
    visibleItems,
    loadMoreItems,
    hasMore,
    isLoading,
    reset: () => {
      setVisibleItems([]);
      setCurrentIndex(0);
    }
  };
};