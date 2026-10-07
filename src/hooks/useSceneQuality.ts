import { useEffect, useState } from 'react';

/**
 * 'off' — no WebGL, or the user prefers reduced motion: every 3D screen
 *   must fall back to its existing 2D equivalent.
 * 'reduced' — WebGL works but the device looks low-end (few cores, little
 *   memory, or a small viewport): render the same scenes with fewer
 *   seats/buildings and no extra flourishes.
 * 'full' — render everything.
 */
export type SceneQuality = 'full' | 'reduced' | 'off';

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function detectQuality(): SceneQuality {
  if (typeof window === 'undefined') return 'off';
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return 'off';
  if (!hasWebGL()) return 'off';

  const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 4;
  const smallViewport = window.innerWidth < 480;

  if ((deviceMemory && deviceMemory <= 2) || cores <= 2) return 'reduced';
  if (smallViewport) return 'reduced';
  return 'full';
}

/** Detected once per session; re-checked only if the reduced-motion preference changes mid-visit. */
export function useSceneQuality(): SceneQuality {
  const [quality, setQuality] = useState<SceneQuality>(() => detectQuality());

  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mql) return;
    const onChange = () => setQuality(detectQuality());
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  return quality;
}
