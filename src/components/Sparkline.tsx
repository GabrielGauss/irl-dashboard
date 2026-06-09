import { useMemo } from 'react';

interface SparklineProps {
  values: number[];
  height?: number;
  className?: string;
}

/**
 * Area sparkline for 24h authorize activity. Pure SVG, no deps.
 * Uses a smooth path with a gradient fill and a leading-edge marker.
 */
export function Sparkline({ values, height = 64, className = '' }: SparklineProps) {
  const W = 100;
  const H = height;
  const PAD = 4;

  const { areaPath, linePath, lastPoint, max } = useMemo(() => {
    const max = Math.max(1, ...values);
    const n = values.length;
    const innerW = W;
    const innerH = H - PAD * 2;

    const points = values.map((v, i) => {
      const x = n <= 1 ? 0 : (i / (n - 1)) * innerW;
      const y = PAD + innerH - (v / max) * innerH;
      return [x, y] as const;
    });

    if (points.length === 0) {
      return { areaPath: '', linePath: '', lastPoint: [W, H / 2] as const, max };
    }

    const line = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(' ');

    const area = `${line} L${W},${H} L0,${H} Z`;

    return { areaPath: area, linePath: line, lastPoint: points[points.length - 1], max };
  }, [values, H]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      style={{ height }}
      role="img"
      aria-label={`24-hour activity, peak ${max} per hour`}
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {areaPath && <path d={areaPath} fill="url(#spark-fill)" />}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke="rgb(129,140,248)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r="2" fill="rgb(129,140,248)" />
    </svg>
  );
}
