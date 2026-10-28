/** Dimensiones que mide el cuestionario. Cada pregunta suma a una o más de ellas. */
export const AREA_KEYS = [
  "social",
  "cientifica",
  "tecnologica",
  "artistica",
  "administrativa",
  "empresarial",
  "practica",
] as const;

export const COMPETENCY_KEYS = [
  "liderazgo",
  "creatividad",
  "logica",
  "comunicacion",
  "organizacion",
  "resolucion",
  "equipo",
] as const;

export const STYLE_KEYS = [
  "autonomia",
  "aprendizajeVisual",
  "aprendizajeTeorico",
  "aprendizajePractico",
  "motivServicio",
  "motivLogro",
  "motivInnovacion",
  "motivEstabilidad",
] as const;

export type AreaKey = (typeof AREA_KEYS)[number];
export type CompetencyKey = (typeof COMPETENCY_KEYS)[number];
export type StyleKey = (typeof STYLE_KEYS)[number];
export type Dimension = AreaKey | CompetencyKey | StyleKey;

export const ALL_DIMENSIONS: readonly Dimension[] = [...AREA_KEYS, ...COMPETENCY_KEYS, ...STYLE_KEYS];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  social: "Social",
  cientifica: "Científica",
  tecnologica: "Tecnológica",
  artistica: "Artística",
  administrativa: "Administrativa",
  empresarial: "Empresarial",
  practica: "Práctica",
  liderazgo: "Liderazgo",
  creatividad: "Creatividad",
  logica: "Pensamiento lógico",
  comunicacion: "Comunicación",
  organizacion: "Organización",
  resolucion: "Resolución de problemas",
  equipo: "Trabajo en equipo",
  autonomia: "Trabajo independiente",
  aprendizajeVisual: "Aprendizaje visual",
  aprendizajeTeorico: "Aprendizaje teórico",
  aprendizajePractico: "Aprendizaje práctico",
  motivServicio: "Servicio a los demás",
  motivLogro: "Logro y crecimiento",
  motivInnovacion: "Innovación y descubrimiento",
  motivEstabilidad: "Estabilidad y seguridad",
};

/** Etiqueta de la orientación profesional, por ejemplo "Orientación científica". */
export const AREA_ORIENTATION_LABELS: Record<AreaKey, string> = {
  social: "Orientación social",
  cientifica: "Orientación científica",
  tecnologica: "Orientación tecnológica",
  artistica: "Orientación artística",
  administrativa: "Orientación administrativa",
  empresarial: "Orientación empresarial",
  practica: "Orientación práctica",
};
