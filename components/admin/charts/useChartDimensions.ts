"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ChartDimensions {
  width: number;
  height: number;
  ready: boolean;
}

/** Responsive chart dimension hook — observes container resize. Client-only. */
export function useChartDimensions(
  defaultWidth = 600,
  defaultHeight = 300,
): [React.RefObject<HTMLDivElement | null>, ChartDimensions] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState<ChartDimensions>({
    width: defaultWidth,
    height: defaultHeight,
    ready: false,
  });

  const measure = useCallback(() => {
    if (ref.current) {
      const { width } = ref.current.getBoundingClientRect();
      setDims({ width: Math.max(width, 100), height: defaultHeight, ready: true });
    }
  }, [defaultHeight]);

  useEffect(() => {
    measure();
    const obs = new ResizeObserver(measure);
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [measure]);

  return [ref, dims];
}
