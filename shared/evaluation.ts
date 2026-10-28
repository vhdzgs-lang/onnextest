import { CAREERS, type Career } from "./careers";
import {
  ALL_DIMENSIONS,
  AREA_KEYS,
  AREA_ORIENTATION_LABELS,
  COMPETENCY_KEYS,
  DIMENSION_LABELS,
  type AreaKey,
  type CompetencyKey,
  type Dimension,
} from "./dimensions";
import { MAX_ANSWER, MIN_ANSWER, QUESTIONS } from "./questions";
import type { Answer, Student } from "./validation";

export type Scores = Record<Dimension, number>;

export interface ScoredDimension {
  key: Dimension;
  label: string;
  score: number;
}

export interface CareerRecommendation {
  career: Career;
  /** Compatibilidad de 0 a 100. */
  match: number;
  justification: string;
}

export interface VocationalReport {
  student: Student;
  completedAt: string;
  scores: Scores;
  areas: ScoredDimension[];
  competencies: ScoredDimension[];
  profileSummary: string;
  personalityType: { name: string; description: string };
  dominantTraits: string[];
  strengths: string[];
  developmentAreas: string[];
  workPreferences: string[];
  motivationFactors: string[];
  highlightedCompetencies: { label: string; score: number; description: string }[];
  workStyle: string;
  learningStyle: string;
  recommendedEnvironments: string[];
  growthAreas: string[];
  compatibleAreas: string[];
  careers: CareerRecommendation[];
  recommendations: string[];
  nextSteps: string[];
  universityTips: string[];
  finalMessage: string;
  disclaimer: string;
}

export const DISCLAIMER =
  "Este reporte es una orientación vocacional. No sustituye una evaluación psicológica clínica ni constituye un diagnóstico médico o psicológico. Las recomendaciones sirven como guía para explorar opciones académicas y deben complementarse con la reflexión personal, el diálogo con la familia y la asesoría de un orientador.";

const PERSONALITY_TYPES: Record<AreaKey, { name: string; description: string; traits: string[]; environments: string[] }> = {
  social: {
    name: "Social humanista",
    description:
      "Se orienta hacia las personas. Disfruta escuchar, acompañar y ayudar, y encuentra sentido en actividades que mejoran la vida de otros.",
    traits: ["Empatía", "Sensibilidad hacia los demás", "Vocación de servicio"],
    environments: ["Escuelas y centros educativos", "Instituciones de salud", "Organizaciones sociales y comunitarias"],
  },
  cientifica: {
    name: "Investigador analítico",
    description:
      "Le mueve la curiosidad por entender cómo funcionan las cosas. Prefiere comprobar las ideas con evidencia y profundizar en los temas.",
    traits: ["Curiosidad intelectual", "Pensamiento crítico", "Rigor y precisión"],
    environments: ["Laboratorios y centros de investigación", "Hospitales y clínicas", "Universidades"],
  },
  tecnologica: {
    name: "Innovador tecnológico",
    description:
      "Se siente atraído por la tecnología y por crear soluciones nuevas. Disfruta aprender herramientas y aplicarlas a problemas reales.",
    traits: ["Curiosidad por la tecnología", "Pensamiento sistemático", "Gusto por innovar"],
    environments: ["Empresas de tecnología y startups", "Áreas de innovación y sistemas", "Proyectos remotos y digitales"],
  },
  artistica: {
    name: "Creativo expresivo",
    description:
      "Se expresa a través de las ideas, las imágenes y la estética. Valora la originalidad y busca dejar un sello propio en lo que hace.",
    traits: ["Imaginación", "Sensibilidad estética", "Originalidad"],
    environments: ["Estudios de diseño y agencias creativas", "Medios y producción audiovisual", "Proyectos independientes"],
  },
  administrativa: {
    name: "Organizador estratégico",
    description:
      "Le gusta el orden, la planeación y que las cosas se hagan bien. Es confiable y se siente cómodo con datos, números y procesos.",
    traits: ["Responsabilidad", "Orden y método", "Atención al detalle"],
    environments: ["Áreas administrativas y financieras", "Despachos y consultorías", "Instituciones públicas"],
  },
  empresarial: {
    name: "Emprendedor líder",
    description:
      "Tiene iniciativa, le gusta convencer, negociar y tomar decisiones. Se motiva con metas ambiciosas y con ver crecer sus proyectos.",
    traits: ["Iniciativa", "Persuasión", "Orientación a resultados"],
    environments: ["Empresas en crecimiento", "Áreas comerciales y de negocios", "Emprendimiento propio"],
  },
  practica: {
    name: "Realizador práctico",
    description:
      "Aprende haciendo y disfruta ver resultados concretos. Le gusta construir, reparar y trabajar en contacto con el mundo físico.",
    traits: ["Sentido práctico", "Habilidad manual", "Constancia"],
    environments: ["Obras, plantas e industria", "Trabajo de campo y al aire libre", "Talleres y laboratorios aplicados"],
  },
};

const COMPETENCY_DESCRIPTIONS: Record<CompetencyKey, { strength: string; growth: string }> = {
  liderazgo: {
    strength: "Toma la iniciativa, organiza a otros y asume decisiones con seguridad.",
    growth: "Practicar coordinar pequeños proyectos o equipos escolares para ganar confianza al dirigir.",
  },
  creatividad: {
    strength: "Genera ideas originales y encuentra caminos distintos para resolver situaciones.",
    growth: "Dedicar tiempo a actividades creativas (dibujo, escritura, proyectos libres) para soltar la imaginación.",
  },
  logica: {
    strength: "Analiza datos y argumentos con orden antes de llegar a una conclusión.",
    growth: "Resolver acertijos, ejercicios de matemáticas o programación básica para fortalecer el razonamiento.",
  },
  comunicacion: {
    strength: "Expresa sus ideas con claridad, tanto de forma oral como escrita.",
    growth: "Buscar oportunidades para exponer en clase o escribir textos breves para ganar soltura al comunicar.",
  },
  organizacion: {
    strength: "Planea sus actividades, cumple con fechas y mantiene sus materiales en orden.",
    growth: "Usar una agenda o aplicación de pendientes y dividir las tareas grandes en pasos pequeños.",
  },
  resolucion: {
    strength: "Enfrenta los obstáculos con persistencia y busca soluciones en lugar de rendirse.",
    growth: "Ante un problema, escribir varias alternativas antes de elegir una y revisar qué funcionó.",
  },
  equipo: {
    strength: "Colabora con facilidad, escucha otras opiniones y suma al trabajo colectivo.",
    growth: "Participar en proyectos grupales asumiendo un rol claro y practicando la escucha activa.",
  },
};

const MOTIVATION_TEXT: Record<"motivServicio" | "motivLogro" | "motivInnovacion" | "motivEstabilidad", string> = {
  motivServicio: "Contribuir al bienestar de otras personas y ver el impacto positivo de su trabajo.",
  motivLogro: "Alcanzar metas ambiciosas, superarse y crecer profesionalmente.",
  motivInnovacion: "Crear, descubrir y aprender cosas nuevas de manera constante.",
  motivEstabilidad: "Contar con un entorno laboral estable, seguro y con reglas claras.",
};

const round = (n: number) => Math.round(n);

/** Convierte las respuestas en puntuaciones de 0 a 100 por dimensión. */
export function computeScores(answers: readonly Answer[]): Scores {
  const byId = new Map(answers.map((a) => [a.questionId, a.value]));
  const sums = Object.fromEntries(ALL_DIMENSIONS.map((d) => [d, 0])) as Record<Dimension, number>;
  const weights = Object.fromEntries(ALL_DIMENSIONS.map((d) => [d, 0])) as Record<Dimension, number>;

  for (const q of QUESTIONS) {
    const value = byId.get(q.id);
    if (value === undefined) throw new Error(`Falta la respuesta de la pregunta ${q.id}`);
    const normalized = (value - MIN_ANSWER) / (MAX_ANSWER - MIN_ANSWER);
    for (const [dim, w] of Object.entries(q.weights) as [Dimension, number][]) {
      sums[dim] += normalized * w;
      weights[dim] += w;
    }
  }

  return Object.fromEntries(
    ALL_DIMENSIONS.map((d) => [d, weights[d] === 0 ? 0 : round((sums[d] / weights[d]) * 100)]),
  ) as Scores;
}

function ranked<K extends Dimension>(keys: readonly K[], scores: Scores): ScoredDimension[] {
  // Orden estable: a igual puntuación se respeta el orden original de las dimensiones.
  return keys
    .map((key, i) => ({ key, label: DIMENSION_LABELS[key], score: scores[key], i }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map(({ key, label, score }) => ({ key, label, score }));
}

/** Compatibilidad de 0 a 100 entre el estudiante y una carrera. */
export function careerMatch(career: Career, scores: Scores): number {
  let total = 0;
  let weight = 0;
  for (const [dim, w] of Object.entries(career.compatibility) as [Dimension, number][]) {
    total += scores[dim] * w;
    weight += w;
  }
  return weight === 0 ? 0 : round(total / weight);
}

function levelWord(score: number): string {
  if (score >= 80) return "muy alto";
  if (score >= 65) return "alto";
  if (score >= 45) return "moderado";
  return "en desarrollo";
}

function joinEs(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function justifyCareer(career: Career, scores: Scores, firstName: string): string {
  const drivers = (Object.entries(career.compatibility) as [Dimension, number][])
    .map(([dim, w]) => ({ dim, contribution: scores[dim] * w, score: scores[dim] }))
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3);
  const described = drivers.map((d) => {
    const label = DIMENSION_LABELS[d.dim].toLowerCase();
    const isArea = (AREA_KEYS as readonly string[]).includes(d.dim);
    return `${isArea ? `interés en el área ${label}` : label} (${d.score}/100)`;
  });
  return `${firstName}, te recomendamos ${career.name} porque tus resultados muestran ${joinEs(described)}, que son pilares de esta carrera. Es una opción adecuada para ${career.recommendedProfile.charAt(0).toLowerCase()}${career.recommendedProfile.slice(1)}`;
}

/** Elige las tres carreras más compatibles. */
export function recommendCareers(scores: Scores, firstName = "Estudiante", count = 3): CareerRecommendation[] {
  return CAREERS.map((career, i) => ({ career, match: careerMatch(career, scores), i }))
    .sort((a, b) => b.match - a.match || a.i - b.i)
    .slice(0, count)
    .map(({ career, match }) => ({ career, match, justification: justifyCareer(career, scores, firstName) }));
}

/** Genera el análisis completo a partir de los datos del estudiante y sus 50 respuestas. */
export function evaluate(student: Student, answers: readonly Answer[], completedAt: Date = new Date()): VocationalReport {
  const scores = computeScores(answers);
  const areas = ranked(AREA_KEYS, scores);
  const competencies = ranked(COMPETENCY_KEYS, scores);
  const firstName = student.fullName.split(/\s+/)[0] ?? student.fullName;

  const [topArea, secondArea, thirdArea] = areas as [ScoredDimension, ScoredDimension, ScoredDimension];
  const type = PERSONALITY_TYPES[topArea.key as AreaKey];
  const secondType = PERSONALITY_TYPES[secondArea.key as AreaKey];

  const topCompetencies = competencies.slice(0, 3);
  const lowCompetencies = competencies.slice(-2).reverse();

  const compatibleAreas = [topArea, secondArea, thirdArea].map(
    (a) => `${AREA_ORIENTATION_LABELS[a.key as AreaKey]} (${a.score}/100)`,
  );

  const profileSummary =
    `${firstName} presenta un perfil vocacional con predominio de la ${AREA_ORIENTATION_LABELS[topArea.key as AreaKey].toLowerCase()} ` +
    `(${topArea.score}/100), complementado por la ${AREA_ORIENTATION_LABELS[secondArea.key as AreaKey].toLowerCase()} (${secondArea.score}/100). ` +
    `Sus respuestas describen a una persona con rasgos de tipo "${type.name}": ${type.description.charAt(0).toLowerCase()}${type.description.slice(1)} ` +
    `Entre sus competencias sobresalen ${joinEs(topCompetencies.map((c) => c.label.toLowerCase()))}.`;

  const teamVsSolo = scores.equipo - scores.autonomia;
  const workStyle =
    teamVsSolo >= 15
      ? "Prefiere trabajar en equipo: se siente con energía al colaborar, intercambiar ideas y construir junto con otros."
      : teamVsSolo <= -15
        ? "Prefiere trabajar de forma independiente: rinde mejor cuando puede concentrarse, organizar su ritmo y tomar sus propias decisiones."
        : "Tiene un estilo flexible: puede colaborar en equipo y también trabajar de forma independiente según lo requiera la tarea.";

  const learning = ranked(["aprendizajeVisual", "aprendizajeTeorico", "aprendizajePractico"] as const, scores);
  const learningText: Record<string, string> = {
    aprendizajeVisual: "visual: aprende mejor con diagramas, videos, mapas mentales y ejemplos gráficos",
    aprendizajeTeorico: "reflexivo-teórico: aprende mejor leyendo, investigando y entendiendo los fundamentos",
    aprendizajePractico: "práctico: aprende mejor haciendo, experimentando y aplicando lo que estudia",
  };
  const learningStyle = `Su estilo de aprendizaje predominante es ${learningText[learning[0]!.key]}.`;

  const motivations = ranked(["motivServicio", "motivLogro", "motivInnovacion", "motivEstabilidad"] as const, scores);
  const motivationFactors = motivations
    .slice(0, 3)
    .map((m) => `${m.label}: ${MOTIVATION_TEXT[m.key as keyof typeof MOTIVATION_TEXT]}`);

  const workPreferences = [
    workStyle,
    scores.organizacion >= 60 || scores.administrativa >= 60
      ? "Se siente cómodo(a) en entornos con objetivos claros, planeación y procesos definidos."
      : "Se adapta mejor a entornos flexibles, donde puede cambiar de actividad y proponer nuevas formas de hacer las cosas.",
    scores.practica >= 60
      ? "Valora las actividades dinámicas y prácticas, con resultados visibles."
      : scores.cientifica >= 60 || scores.aprendizajeTeorico >= 60
        ? "Disfruta las tareas que requieren análisis, investigación y concentración."
        : "Le atraen las actividades que combinan interacción con personas y generación de ideas.",
    scores.liderazgo >= 60
      ? "Le gusta asumir responsabilidades y tener voz en las decisiones."
      : "Prefiere roles en los que pueda aportar desde su especialidad sin la presión de dirigir a otros, al menos por ahora.",
  ];

  const dominantTraits = [...type.traits, ...secondType.traits.slice(0, 1)];
  if (scores.creatividad >= 70 && !dominantTraits.includes("Imaginación")) dominantTraits.push("Pensamiento creativo");
  if (scores.liderazgo >= 70) dominantTraits.push("Iniciativa y liderazgo");

  const strengths = topCompetencies.map(
    (c) => `${c.label} (${c.score}/100): ${COMPETENCY_DESCRIPTIONS[c.key as CompetencyKey].strength}`,
  );
  strengths.push(`Interés ${levelWord(topArea.score)} en el área ${topArea.label.toLowerCase()}, lo que da dirección a su elección profesional.`);

  const developmentAreas = lowCompetencies.map(
    (c) => `${c.label} (${c.score}/100): ${COMPETENCY_DESCRIPTIONS[c.key as CompetencyKey].growth}`,
  );

  const highlightedCompetencies = competencies.map((c) => ({
    label: c.label,
    score: c.score,
    description: COMPETENCY_DESCRIPTIONS[c.key as CompetencyKey].strength,
  }));

  const recommendedEnvironments = Array.from(new Set([...type.environments, ...secondType.environments.slice(0, 2)]));

  const growthAreas = [
    ...lowCompetencies.map((c) => COMPETENCY_DESCRIPTIONS[c.key as CompetencyKey].growth),
    `Explorar actividades del área ${areas[areas.length - 1]!.label.toLowerCase()} para confirmar si es un interés que puede desarrollar o si definitivamente no es su camino.`,
  ];

  const careers = recommendCareers(scores, firstName);

  const recommendations = [
    `Conversar con profesionistas que ejerzan ${joinEs(careers.map((c) => c.career.name))} para conocer cómo es su día a día.`,
    `Buscar cursos, talleres o voluntariados relacionados con la ${AREA_ORIENTATION_LABELS[topArea.key as AreaKey].toLowerCase()} para confirmar su interés en la práctica.`,
    `Fortalecer ${joinEs(lowCompetencies.map((c) => c.label.toLowerCase()))}, ya que le dará más herramientas sin importar la carrera que elija.`,
    "Aprovechar sus fortalezas actuales en proyectos escolares, concursos o actividades extracurriculares.",
  ];

  const nextSteps = [
    "Revisar este reporte con su familia y con un orientador vocacional.",
    "Investigar los planes de estudio de las tres carreras recomendadas en al menos dos universidades.",
    "Asistir a ferias profesiográficas, clases muestra o días de puertas abiertas.",
    "Consultar fechas de convocatorias y exámenes de admisión (por ejemplo EXANI-II o exámenes propios de cada universidad).",
    "Definir una carrera principal y una alternativa antes de iniciar el proceso de admisión.",
  ];

  const universityTips = [
    "Verificar que el programa cuente con Reconocimiento de Validez Oficial de Estudios (RVOE) o pertenezca a una universidad pública autónoma.",
    "Comparar planes de estudio, duración, modalidad (presencial, mixta o en línea) y costos.",
    "Preguntar por prácticas profesionales, convenios con empresas e intercambios.",
    "Revisar opciones de becas y apoyos económicos.",
    "Considerar la ubicación, el tiempo de traslado y el ambiente del campus.",
  ];

  const finalMessage = `${firstName}, elegir una carrera es un proceso, no una decisión de un solo día. Tus resultados muestran intereses y fortalezas valiosas que pueden llevarte a una vida profesional satisfactoria. Usa este reporte como un punto de partida para explorar, preguntar y descubrir el camino que más se parezca a ti.`;

  return {
    student,
    completedAt: completedAt.toISOString(),
    scores,
    areas,
    competencies,
    profileSummary,
    personalityType: { name: type.name, description: type.description },
    dominantTraits,
    strengths,
    developmentAreas,
    workPreferences,
    motivationFactors,
    highlightedCompetencies,
    workStyle,
    learningStyle,
    recommendedEnvironments,
    growthAreas,
    compatibleAreas,
    careers,
    recommendations,
    nextSteps,
    universityTips,
    finalMessage,
    disclaimer: DISCLAIMER,
  };
}
