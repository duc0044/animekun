"use client";

import type { PointerEvent, ReactNode } from "react";
import { useRef } from "react";

const DRAG_THRESHOLD = 6;

export function DragScroll({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    pointerDown: false,
    isDragging: false,
    hasMoved: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: 0,
  });

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !containerRef.current) return;

    // Don't preventDefault here — let clicks on inner links/buttons work.
    // We only start capturing when the user actually drags past the threshold.
    dragState.current = {
      pointerDown: true,
      isDragging: false,
      hasMoved: false,
      startX: event.clientX,
      scrollLeft: containerRef.current.scrollLeft,
      pointerId: event.pointerId,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const state = dragState.current;

    if (!container || !state.pointerDown) return;

    const deltaX = event.clientX - state.startX;

    if (!state.isDragging) {
      if (Math.abs(deltaX) <= DRAG_THRESHOLD) return;
      state.isDragging = true;
      state.hasMoved = true;
      try {
        container.setPointerCapture(state.pointerId);
      } catch {
        // ignore — capture may fail if pointer was released elsewhere
      }
    }

    container.scrollLeft = state.scrollLeft - deltaX;
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (container?.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }
    dragState.current.pointerDown = false;
    dragState.current.isDragging = false;
  };

  return (
    <div
      ref={containerRef}
      className={`${className} cursor-grab select-none active:cursor-grabbing`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => {
        if (dragState.current.hasMoved) {
          event.preventDefault();
          event.stopPropagation();
          dragState.current.hasMoved = false;
        }
      }}
    >
      {children}
    </div>
  );
}
