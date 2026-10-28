import { useId } from "react";

/** Icono oficial: gradiente azul-púrpura, "T" blanca y punto negro. */
export function LogoMark({ size = 40 }: { size?: number }) {
  const gid = `onnex-${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${gid})`} />
      <rect x="14" y="15" width="32" height="8.5" rx="2.5" fill="#FFFFFF" />
      <rect x="25.75" y="15" width="8.5" height="34" rx="2.5" fill="#FFFFFF" />
      <circle cx="45" cy="44.5" r="5" fill="#0B0B12" />
    </svg>
  );
}

/** Logo horizontal: el texto "Onnex Test" siempre en una sola línea junto al icono. */
export function Logo({ size = 40, tone = "dark" }: { size?: number; tone?: "dark" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap" aria-label="Onnex Test" role="img">
      <LogoMark size={size} />
      <span
        className={`font-extrabold tracking-tight whitespace-nowrap ${tone === "dark" ? "text-ink" : "text-white"}`}
        style={{ fontSize: Math.round(size * 0.56) }}
        aria-hidden="true"
      >
        Onnex Test
      </span>
    </span>
  );
}
