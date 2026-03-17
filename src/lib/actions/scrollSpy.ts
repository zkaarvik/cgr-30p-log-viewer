export type ScrollSpyParams = {
  targets: string | Element[];
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  anchorOffset?: number;
  getId?: (el: Element) => string | null | undefined;
  onChange: (id: string) => void;
};

const defaultThreshold = [0.15, 0.3, 0.6];
const defaultRootMargin = "-35% 0px -55% 0px";

export function scrollSpy(node: HTMLElement, params: ScrollSpyParams) {
  let activeId: string | null = null;
  let targets: Element[] = [];
  let frame = 0;

  const resolveTargets = () => {
    if (typeof params.targets === "string") {
      targets = Array.from(document.querySelectorAll(params.targets));
    } else {
      targets = params.targets;
    }
  };

  const activate = (target: Element) => {
    const id = params.getId?.(target) ?? (target as HTMLElement).dataset?.group;
    if (!id || id === activeId) return;
    activeId = id;
    params.onChange(id);
  };

  const computeActive = () => {
    if (!targets.length) return;
    const anchor = params.anchorOffset ?? 120;
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

  return {
    update(next: ScrollSpyParams) {
      params = next;
      refresh();
    },
    destroy() {
      cancelAnimationFrame(raf);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    },
  };
}
