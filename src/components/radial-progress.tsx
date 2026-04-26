import { useI18n } from "@/lib/i18n-context";

interface RadialProgressProps {
  value: number; // 0-100
  size?: number;
  thickness?: number;
}

export function RadialProgress({ value, size = 192, thickness = 12 }: RadialProgressProps) {
  const { lang } = useI18n();
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-border-strong)"
          strokeWidth={thickness}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{
            transition: "stroke-dasharray 800ms cubic-bezier(0.16, 1, 0.3, 1)",
            filter: "drop-shadow(0 0 8px var(--color-primary))",
          }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-primary-glow)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-light tabular text-foreground">
          {new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US", { maximumFractionDigits: 1 }).format(clamped)}
          <span className="text-xl text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  );
}
