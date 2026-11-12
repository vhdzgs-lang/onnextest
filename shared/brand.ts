/** Identidad visual de Onnex Test, compartida por la web, el PDF, el correo y los artes. */
export const BRAND = {
  name: "Onnex Test",
  blue: "#2563EB",
  purple: "#7C3AED",
  ink: "#0B0B12",
  contactPhone: "(833) 258 4802",
  /** Enlace de WhatsApp del número de contacto. */
  whatsappUrl: "https://wa.me/528332584802",
  contactEmail: "vhdzgs@gmail.com",
} as const;

/**
 * Icono oficial: cuadro con gradiente azul-púrpura, letra "T" blanca y punto negro.
 * Se entrega como SVG inline para que nunca dependa de cargar una imagen.
 */
export function logoMarkSvg(size = 40, idSuffix = "m"): string {
  const gid = `onnex-grad-${idSuffix}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="Onnex Test"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${BRAND.blue}"/><stop offset="1" stop-color="${BRAND.purple}"/></linearGradient></defs><rect width="64" height="64" rx="15" fill="url(#${gid})"/><rect x="14" y="15" width="32" height="8.5" rx="2.5" fill="#FFFFFF"/><rect x="25.75" y="15" width="8.5" height="34" rx="2.5" fill="#FFFFFF"/><circle cx="45" cy="44.5" r="5" fill="${BRAND.ink}"/></svg>`;
}

/** Logo horizontal: icono + "Onnex Test" en una sola línea. */
export function logoHorizontalSvg(opts: { height?: number; textColor?: string; idSuffix?: string } = {}): string {
  const height = opts.height ?? 40;
  const textColor = opts.textColor ?? BRAND.ink;
  const gid = `onnex-grad-h-${opts.idSuffix ?? "h"}`;
  const width = Math.round(height * (262 / 64));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 262 64" role="img" aria-label="Onnex Test"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${BRAND.blue}"/><stop offset="1" stop-color="${BRAND.purple}"/></linearGradient></defs><rect width="64" height="64" rx="15" fill="url(#${gid})"/><rect x="14" y="15" width="32" height="8.5" rx="2.5" fill="#FFFFFF"/><rect x="25.75" y="15" width="8.5" height="34" rx="2.5" fill="#FFFFFF"/><circle cx="45" cy="44.5" r="5" fill="${BRAND.ink}"/><text x="78" y="43" font-family="Inter, 'Segoe UI', 'Helvetica Neue', Arial, 'Liberation Sans', 'DejaVu Sans', sans-serif" font-size="30" font-weight="800" letter-spacing="-0.5" fill="${textColor}" style="white-space:pre">Onnex Test</text></svg>`;
}
