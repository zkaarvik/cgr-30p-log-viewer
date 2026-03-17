import { useEffect, useRef } from "react";

export type ScrollSpyParams = {
  targets: string | Element[];
  anchorOffset?: number;
  getId?: (el: Element) => string | null | undefined;
  onChange: (id: string) => void;
};

export const useScrollSpy = (params: ScrollSpyParams) => {
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    let activeId: string | null = null;
    let targets: Element[] = [];
    let frame = 0;

    const resolveTargets = () => {
      if (typeof paramsRef.current.targets === "string") {
        targets = Array.from(
          document.querySelectorAll(paramsRef.current.targets)
        );
      } else {
        targets = paramsRef.current.targets;
      }
    };

    const activate = (target: Element) => {
      const id =
        paramsRef.current.getId?.(target) ??
        (target as HTMLElement).dataset?.group;
      if (!id || id === activeId) return;
      activeId = id;
      paramsRef.current.onChange(id);
    };

    const computeActive = () => {
      if (!targets.length) {
        resolveTargets();
      }
      if (!targets.length) return;
      const anchor = paramsRef.current.anchorOffset ?? 120;
      let bestTarget: Element | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const target of targets) {
        const rect = (target as HTMLElement).getBoundingClientRect();
        if (rect.bottom < anchor || rect.top > window.innerHeight) continue;
        const distance = Math.abs(rect.top - anchor);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestTarget = target;
        }
      }

      if (bestTarget) activate(bestTarget);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        computeActive();
      });
    };

    const refresh = () => {
      resolveTargets();
      computeActive();
    };

    const raf = requestAnimationFrame(refresh);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
};
