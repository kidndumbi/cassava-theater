import { useState, useMemo, useCallback } from "react";

export function useDragState() {
  const [dragState, setDragState] = useState<boolean[]>([]);
  const isAnyDragging = useMemo(
    () => dragState.some((isDragging) => isDragging),
    [dragState]
  );

  const setDragging = useCallback((isDragging: boolean, idx: number) => {
    setDragState((prev) => {
      if (prev[idx] === isDragging) return prev;
      const newState = [...prev];
      newState[idx] = isDragging;
      return newState;
    });
  }, []);

  return { dragState, isAnyDragging, setDragging };
}
