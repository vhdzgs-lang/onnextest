import type { Dimension } from "./dimensions";

export type QuestionSection =
  | "Intereses profesionales"
  | "Habilidades y aptitudes"
  | "Estilo de trabajo"
  | "Estilo de aprendizaje"
  | "Motivaciones";

export interface Question {
  id: number;
  text: string;
  section: QuestionSection;
  /** Peso de la pregunta en cada dimensión. */
  weights: Partial<Record<Dimension, number>>;
}

/** Escala Likert de 5 puntos usada en todo el cuestionario. */
export const ANSWER_SCALE = [
  { value: 1, label: "Totalmente en desacuerdo" },
  { value: 2, label: "En desacuerdo" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "De acuerdo" },
  { value: 5, label: "Totalmente de acuerdo" },
] as const;

export const MIN_ANSWER = 1;
export const MAX_ANSWER = 5;

const I: QuestionSection = "Intereses profesionales";
const H: QuestionSection = "Habilidades y aptitudes";

export const QUESTIONS: readonly Question[] = [
  // Orientación social
  { id: 1, section: I, text: "Me gusta ayudar a otras personas a resolver sus problemas personales o escolares.", weights: { social: 1, motivServicio: 0.5 } },
  { id: 2, section: I, text: "Me interesa entender por qué las personas sienten y actúan como lo hacen.", weights: { social: 1 } },
  { id: 3, section: I, text: "Me gustaría trabajar en algo que mejore la calidad de vida de mi comunidad.", weights: { social: 1, motivServicio: 0.5 } },
  { id: 4, section: I, text: "Disfruto explicar temas a mis compañeros cuando no los entienden.", weights: { social: 1, comunicacion: 0.5 } },
  // Orientación científica
  { id: 5, section: I, text: "Me da curiosidad cómo funcionan el cuerpo humano y los seres vivos.", weights: { cientifica: 1 } },
  { id: 6, section: I, text: "Disfruto las clases de biología, química o física.", weights: { cientifica: 1, aprendizajeTeorico: 0.5 } },
  { id: 7, section: I, text: "Me gusta hacer experimentos para comprobar si una idea es cierta.", weights: { cientifica: 1, logica: 0.5 } },
  { id: 8, section: I, text: "Me interesaría investigar para encontrar soluciones a problemas de salud o de la naturaleza.", weights: { cientifica: 1, motivInnovacion: 0.5 } },
  // Orientación tecnológica
  { id: 9, section: I, text: "Me gusta usar la computadora para crear cosas, no solo para entretenerme.", weights: { tecnologica: 1 } },
  { id: 10, section: I, text: "Me interesa aprender a programar, o ya lo he intentado.", weights: { tecnologica: 1, logica: 0.5 } },
  { id: 11, section: I, text: "Me llama la atención cómo funcionan las apps, los videojuegos o los robots.", weights: { tecnologica: 1 } },
  { id: 12, section: I, text: "Me emociona conocer nuevas tecnologías, como la inteligencia artificial.", weights: { tecnologica: 1, motivInnovacion: 0.5 } },
  // Orientación artística
  { id: 13, section: I, text: "Me gusta dibujar, diseñar, tomar fotos o hacer videos.", weights: { artistica: 1, creatividad: 0.5, aprendizajeVisual: 0.5 } },
  { id: 14, section: I, text: "Me fijo en los colores, las formas y la estética de las cosas.", weights: { artistica: 1, aprendizajeVisual: 0.5 } },
  { id: 15, section: I, text: "Disfruto expresar mis ideas a través de la música, la escritura o el arte.", weights: { artistica: 1, comunicacion: 0.3 } },
  { id: 16, section: I, text: "Me gustaría que mi trabajo tuviera un toque original y creativo.", weights: { artistica: 1, creatividad: 0.5 } },
  // Orientación administrativa
  { id: 17, section: I, text: "Me gusta llevar el control de mis gastos, tareas o pendientes.", weights: { administrativa: 1, organizacion: 0.5 } },
  { id: 18, section: I, text: "Me siento cómodo(a) trabajando con números, tablas y datos.", weights: { administrativa: 1, logica: 0.3 } },
  { id: 19, section: I, text: "Me interesa saber cómo se administra una empresa o una institución.", weights: { administrativa: 1, empresarial: 0.3 } },
  { id: 20, section: I, text: "Prefiero seguir procedimientos claros para que las cosas salgan bien.", weights: { administrativa: 1, motivEstabilidad: 0.5 } },
  // Orientación empresarial
  { id: 21, section: I, text: "Me imagino teniendo mi propio negocio algún día.", weights: { empresarial: 1, motivLogro: 0.5 } },
  { id: 22, section: I, text: "Me gusta convencer a otros de una idea o de un producto.", weights: { empresarial: 1, comunicacion: 0.5 } },
  { id: 23, section: I, text: "Me interesa entender cómo se mueven el dinero, la economía y los mercados.", weights: { empresarial: 1 } },
  { id: 24, section: I, text: "Me atrae negociar y llegar a acuerdos con otras personas.", weights: { empresarial: 1, liderazgo: 0.5 } },
  // Orientación práctica
  { id: 25, section: I, text: "Prefiero aprender haciendo las cosas con mis manos que solo leyendo.", weights: { practica: 1, aprendizajePractico: 1 } },
  { id: 26, section: I, text: "Me gusta armar, reparar o construir objetos.", weights: { practica: 1, aprendizajePractico: 0.5 } },
  { id: 27, section: I, text: "Disfruto las actividades al aire libre o en contacto con la naturaleza.", weights: { practica: 1 } },
  { id: 28, section: I, text: "Me gusta ver resultados concretos y visibles de mi trabajo.", weights: { practica: 1, motivLogro: 0.3 } },
  // Liderazgo
  { id: 29, section: H, text: "Cuando trabajo en equipo, suelo tomar la iniciativa y organizar a los demás.", weights: { liderazgo: 1, equipo: 0.3 } },
  { id: 30, section: H, text: "Me siento capaz de tomar decisiones importantes aunque haya presión.", weights: { liderazgo: 1, resolucion: 0.3 } },
  // Creatividad
  { id: 31, section: H, text: "Se me ocurren ideas diferentes para resolver una misma situación.", weights: { creatividad: 1, resolucion: 0.3 } },
  { id: 32, section: H, text: "Me gusta imaginar cosas nuevas que todavía no existen.", weights: { creatividad: 1, motivInnovacion: 0.5 } },
  // Pensamiento lógico
  { id: 33, section: H, text: "Disfruto resolver problemas de matemáticas o acertijos de lógica.", weights: { logica: 1 } },
  { id: 34, section: H, text: "Antes de dar una opinión, analizo los datos y los argumentos.", weights: { logica: 1, aprendizajeTeorico: 0.3 } },
  // Comunicación
  { id: 35, section: H, text: "Se me facilita hablar en público o exponer en clase.", weights: { comunicacion: 1, liderazgo: 0.3 } },
  { id: 36, section: H, text: "Puedo explicar mis ideas por escrito de forma clara.", weights: { comunicacion: 1 } },
  // Organización
  { id: 37, section: H, text: "Planeo mis actividades y cumplo con las fechas de entrega.", weights: { organizacion: 1 } },
  { id: 38, section: H, text: "Mantengo mis cosas, archivos y apuntes ordenados.", weights: { organizacion: 1 } },
  // Resolución de problemas
  { id: 39, section: H, text: "Cuando algo sale mal, busco una solución en lugar de rendirme.", weights: { resolucion: 1 } },
  { id: 40, section: H, text: "Me gustan los retos difíciles porque me hacen aprender.", weights: { resolucion: 1, motivLogro: 0.3 } },
  // Trabajo en equipo
  { id: 41, section: "Estilo de trabajo", text: "Me gusta más trabajar en equipo que hacerlo solo(a).", weights: { equipo: 1 } },
  { id: 42, section: H, text: "Escucho las opiniones de los demás aunque sean diferentes a las mías.", weights: { equipo: 1, social: 0.3 } },
  // Trabajo individual
  { id: 43, section: "Estilo de trabajo", text: "Trabajo mejor cuando puedo concentrarme solo(a) y a mi propio ritmo.", weights: { autonomia: 1 } },
  { id: 44, section: "Estilo de trabajo", text: "Me gusta tomar mis propias decisiones sin que alguien me esté supervisando.", weights: { autonomia: 1, liderazgo: 0.3 } },
  // Estilo de aprendizaje
  { id: 45, section: "Estilo de aprendizaje", text: "Aprendo mejor con ejemplos visuales, diagramas o videos.", weights: { aprendizajeVisual: 1 } },
  { id: 46, section: "Estilo de aprendizaje", text: "Me gusta leer y entender bien la teoría antes de practicar.", weights: { aprendizajeTeorico: 1 } },
  // Motivaciones
  { id: 47, section: "Motivaciones", text: "Me motiva saber que mi trabajo ayuda a otras personas.", weights: { motivServicio: 1 } },
  { id: 48, section: "Motivaciones", text: "Me motiva ponerme metas altas y alcanzar el éxito profesional.", weights: { motivLogro: 1 } },
  { id: 49, section: "Motivaciones", text: "Me motiva crear o descubrir algo nuevo.", weights: { motivInnovacion: 1, creatividad: 0.3 } },
  { id: 50, section: "Motivaciones", text: "Para mí es importante tener un empleo estable y seguro.", weights: { motivEstabilidad: 1 } },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

/** Versión pública de las preguntas: sin los pesos de evaluación. */
export const PUBLIC_QUESTIONS = QUESTIONS.map(({ id, text, section }) => ({ id, text, section }));
export type PublicQuestion = (typeof PUBLIC_QUESTIONS)[number];
