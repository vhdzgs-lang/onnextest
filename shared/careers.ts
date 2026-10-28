import type { Dimension } from "./dimensions";

export interface Career {
  id: string;
  name: string;
  /** Área profesional a la que pertenece. */
  area: string;
  description: string;
  /** Perfil de estudiante al que suele irle bien. */
  recommendedProfile: string;
  skills: string[];
  jobField: string;
  advantages: string[];
  /** Perfiles vocacionales con los que es compatible (tipos de personalidad de Onnex Test). */
  compatibleProfiles: string[];
  /** Peso de cada dimensión para calcular la compatibilidad con el estudiante. */
  compatibility: Partial<Record<Dimension, number>>;
}

/** Carreras que se ofrecen en universidades de México. */
export const CAREERS: readonly Career[] = [
  {
    id: "sistemas",
    name: "Ingeniería en Sistemas Computacionales",
    area: "Ingeniería y tecnología",
    description:
      "Forma profesionales que diseñan, desarrollan y administran software, redes y sistemas de información para empresas, gobierno y startups.",
    recommendedProfile: "Personas curiosas por la tecnología, con pensamiento lógico y gusto por resolver problemas paso a paso.",
    skills: ["Programación", "Pensamiento lógico", "Análisis de sistemas", "Trabajo con datos", "Aprendizaje continuo"],
    jobField:
      "Desarrollo de software y aplicaciones, ciberseguridad, ciencia de datos, inteligencia artificial, infraestructura en la nube y consultoría tecnológica, en México o de forma remota para empresas extranjeras.",
    advantages: [
      "Alta demanda laboral en México y en el extranjero",
      "Posibilidad de trabajo remoto",
      "Salarios competitivos desde los primeros años",
      "Permite emprender con poca inversión",
    ],
    compatibleProfiles: ["Innovador tecnológico", "Investigador analítico"],
    compatibility: { tecnologica: 3, logica: 2, resolucion: 1.5, cientifica: 0.5, motivInnovacion: 1 },
  },
  {
    id: "industrial",
    name: "Ingeniería Industrial",
    area: "Ingeniería y tecnología",
    description:
      "Estudia cómo hacer más eficientes los procesos de producción y de servicios, combinando ingeniería, administración y análisis de datos.",
    recommendedProfile: "Personas organizadas, prácticas y analíticas a quienes les gusta mejorar cómo funcionan las cosas.",
    skills: ["Optimización de procesos", "Análisis de datos", "Gestión de calidad", "Planeación", "Liderazgo de equipos"],
    jobField:
      "Plantas manufactureras, logística y cadena de suministro, calidad, consultoría, sector automotriz y aeroespacial del norte y Bajío de México.",
    advantages: [
      "Campo laboral muy amplio en la industria mexicana",
      "Combina ingeniería con administración",
      "Crecimiento rápido hacia puestos de gerencia",
    ],
    compatibleProfiles: ["Organizador estratégico", "Realizador práctico"],
    compatibility: { tecnologica: 1, administrativa: 1.5, practica: 1, logica: 1.5, organizacion: 1.5, resolucion: 1 },
  },
  {
    id: "medicina",
    name: "Medicina",
    area: "Ciencias de la salud",
    description:
      "Prepara médicos capaces de prevenir, diagnosticar y tratar enfermedades, con una sólida base científica y un fuerte compromiso humano.",
    recommendedProfile: "Personas con vocación de servicio, interés por la biología y el cuerpo humano, disciplina y resistencia al estrés.",
    skills: ["Conocimiento biológico", "Toma de decisiones", "Empatía", "Disciplina", "Trabajo bajo presión"],
    jobField:
      "Hospitales públicos y privados, IMSS e ISSSTE, consultorio propio, investigación clínica, salud pública y especialidades médicas.",
    advantages: [
      "Profesión de alto impacto social",
      "Gran variedad de especialidades",
      "Reconocimiento y estabilidad a largo plazo",
    ],
    compatibleProfiles: ["Investigador analítico", "Social humanista"],
    compatibility: { cientifica: 3, social: 2, resolucion: 1, motivServicio: 1.5, organizacion: 0.5 },
  },
  {
    id: "psicologia",
    name: "Psicología",
    area: "Ciencias sociales y humanidades",
    description:
      "Estudia el comportamiento, las emociones y los procesos mentales de las personas para promover su bienestar en distintos contextos.",
    recommendedProfile: "Personas empáticas, buenas para escuchar y con interés genuino por entender a los demás.",
    skills: ["Escucha activa", "Empatía", "Análisis del comportamiento", "Comunicación", "Ética profesional"],
    jobField:
      "Psicología clínica, educativa, organizacional (recursos humanos), social y comunitaria, investigación y práctica privada.",
    advantages: [
      "Se aplica en salud, escuelas y empresas",
      "Creciente demanda de atención en salud mental",
      "Permite ejercer de forma independiente",
    ],
    compatibleProfiles: ["Social humanista", "Creativo expresivo"],
    compatibility: { social: 3, comunicacion: 1.5, cientifica: 0.5, motivServicio: 1, equipo: 0.5, aprendizajeTeorico: 0.5 },
  },
  {
    id: "derecho",
    name: "Derecho",
    area: "Ciencias sociales y humanidades",
    description:
      "Forma abogados que conocen, interpretan y aplican las leyes para defender derechos, resolver conflictos y asesorar a personas y organizaciones.",
    recommendedProfile: "Personas con buena expresión oral y escrita, sentido de justicia, capacidad de argumentar y gusto por la lectura.",
    skills: ["Argumentación", "Lectura analítica", "Negociación", "Redacción", "Pensamiento crítico"],
    jobField:
      "Despachos jurídicos, poder judicial, notarías, empresas, gobierno, organismos de derechos humanos y práctica independiente.",
    advantages: [
      "Carrera versátil con muchas ramas (penal, corporativo, fiscal, laboral)",
      "Permite ejercer de forma independiente",
      "Abre puertas al servicio público",
    ],
    compatibleProfiles: ["Emprendedor líder", "Social humanista"],
    compatibility: { comunicacion: 2, empresarial: 1, social: 1.5, logica: 1, administrativa: 1, liderazgo: 1 },
  },
  {
    id: "arquitectura",
    name: "Arquitectura",
    area: "Arte, diseño y construcción",
    description:
      "Combina arte, técnica y ciencia para diseñar espacios habitables, funcionales y estéticos, desde casas hasta ciudades.",
    recommendedProfile: "Personas creativas, con buena percepción espacial y gusto por el dibujo, el diseño y la construcción.",
    skills: ["Diseño espacial", "Dibujo y modelado 3D", "Creatividad", "Cálculo básico", "Gestión de proyectos"],
    jobField:
      "Despachos de arquitectura, constructoras, desarrollo inmobiliario, urbanismo, diseño de interiores y restauración de patrimonio.",
    advantages: [
      "Ves materializado tu trabajo",
      "Une creatividad con conocimiento técnico",
      "Posibilidad de tener tu propio despacho",
    ],
    compatibleProfiles: ["Creativo expresivo", "Realizador práctico"],
    compatibility: { artistica: 2, practica: 1.5, tecnologica: 1, creatividad: 1.5, logica: 1, aprendizajeVisual: 0.5 },
  },
  {
    id: "diseno",
    name: "Diseño Gráfico",
    area: "Arte, diseño y construcción",
    description:
      "Crea soluciones visuales para comunicar ideas: identidad de marca, publicidad, ilustración, diseño digital y experiencia de usuario.",
    recommendedProfile: "Personas con sensibilidad estética, imaginación y gusto por expresarse de forma visual.",
    skills: ["Composición visual", "Software de diseño", "Creatividad", "Comunicación visual", "Tipografía y color"],
    jobField:
      "Agencias de publicidad, estudios de diseño, empresas de tecnología (UX/UI), medios digitales, editoriales y trabajo freelance.",
    advantages: [
      "Mucho espacio para la creatividad",
      "Trabajo freelance y remoto",
      "Demanda creciente en el mundo digital",
    ],
    compatibleProfiles: ["Creativo expresivo", "Emprendedor líder"],
    compatibility: { artistica: 3, creatividad: 2.5, tecnologica: 1, aprendizajeVisual: 1 },
  },
  {
    id: "administracion",
    name: "Administración de Empresas",
    area: "Negocios y economía",
    description:
      "Prepara profesionales para planear, organizar, dirigir y controlar los recursos de una organización para que alcance sus metas.",
    recommendedProfile: "Personas organizadas, con iniciativa, capacidad de liderazgo y visión de negocio.",
    skills: ["Planeación estratégica", "Liderazgo", "Toma de decisiones", "Finanzas básicas", "Gestión de personas"],
    jobField:
      "Empresas de cualquier sector, áreas de recursos humanos, operaciones y ventas, consultoría, sector público y negocio propio.",
    advantages: [
      "Una de las carreras con más oportunidades de empleo",
      "Útil para emprender",
      "Permite trabajar en cualquier industria",
    ],
    compatibleProfiles: ["Organizador estratégico", "Emprendedor líder"],
    compatibility: { administrativa: 2.5, empresarial: 2, liderazgo: 1.5, organizacion: 1.5, comunicacion: 0.5 },
  },
  {
    id: "contaduria",
    name: "Contaduría Pública",
    area: "Negocios y economía",
    description:
      "Forma especialistas en registrar, analizar e interpretar la información financiera y fiscal de personas y empresas.",
    recommendedProfile: "Personas ordenadas, precisas, responsables y cómodas trabajando con números.",
    skills: ["Contabilidad", "Fiscal e impuestos", "Atención al detalle", "Análisis financiero", "Ética"],
    jobField:
      "Despachos contables, áreas de finanzas de empresas, auditoría, SAT y dependencias de gobierno, asesoría fiscal independiente.",
    advantages: [
      "Toda empresa necesita un contador",
      "Gran estabilidad laboral",
      "Posibilidad de tener despacho propio",
    ],
    compatibleProfiles: ["Organizador estratégico"],
    compatibility: { administrativa: 3, organizacion: 2, logica: 1.5, motivEstabilidad: 1 },
  },
  {
    id: "mercadotecnia",
    name: "Mercadotecnia",
    area: "Negocios y comunicación",
    description:
      "Estudia a los consumidores y crea estrategias para posicionar productos, servicios y marcas, tanto en medios tradicionales como digitales.",
    recommendedProfile: "Personas creativas, persuasivas, sociables y con interés por las tendencias y el comportamiento del consumidor.",
    skills: ["Estrategia de marca", "Marketing digital", "Creatividad", "Análisis de mercado", "Comunicación persuasiva"],
    jobField:
      "Agencias de marketing y publicidad, departamentos de mercadotecnia, comercio electrónico, redes sociales e investigación de mercados.",
    advantages: [
      "Combina creatividad con negocios",
      "Gran demanda en marketing digital",
      "Ambiente de trabajo dinámico",
    ],
    compatibleProfiles: ["Emprendedor líder", "Creativo expresivo"],
    compatibility: { empresarial: 2.5, comunicacion: 2, creatividad: 1.5, artistica: 1, social: 0.5 },
  },
  {
    id: "comunicacion",
    name: "Ciencias de la Comunicación",
    area: "Ciencias sociales y humanidades",
    description:
      "Forma profesionales que generan y gestionan mensajes en medios, periodismo, producción audiovisual, comunicación digital y relaciones públicas.",
    recommendedProfile: "Personas expresivas, curiosas, que disfrutan contar historias y conectar con el público.",
    skills: ["Redacción", "Expresión oral", "Producción audiovisual", "Creatividad", "Pensamiento crítico"],
    jobField:
      "Medios de comunicación, agencias, comunicación corporativa, relaciones públicas, creación de contenido y periodismo.",
    advantages: [
      "Carrera muy versátil",
      "Ideal para quienes disfrutan expresarse",
      "Crecimiento en medios digitales",
    ],
    compatibleProfiles: ["Creativo expresivo", "Emprendedor líder"],
    compatibility: { comunicacion: 3, artistica: 1.5, social: 1.5, creatividad: 1.5 },
  },
  {
    id: "enfermeria",
    name: "Enfermería",
    area: "Ciencias de la salud",
    description:
      "Prepara profesionales que brindan cuidado integral a pacientes, promueven la salud y colaboran de cerca con el equipo médico.",
    recommendedProfile: "Personas empáticas, pacientes, con vocación de servicio y gusto por el trabajo práctico en equipo.",
    skills: ["Cuidado del paciente", "Trabajo en equipo", "Empatía", "Atención al detalle", "Manejo de emergencias"],
    jobField:
      "Hospitales, clínicas, IMSS e ISSSTE, atención domiciliaria, salud comunitaria y oportunidades de trabajo en el extranjero.",
    advantages: [
      "Alta demanda laboral nacional e internacional",
      "Profesión de gran impacto humano",
      "Rápida inserción al trabajo",
    ],
    compatibleProfiles: ["Social humanista", "Realizador práctico"],
    compatibility: { cientifica: 2, social: 2.5, practica: 1.5, motivServicio: 2, equipo: 1 },
  },
  {
    id: "nutricion",
    name: "Nutrición",
    area: "Ciencias de la salud",
    description:
      "Estudia la relación entre alimentación y salud para prevenir y tratar enfermedades y mejorar la calidad de vida de las personas.",
    recommendedProfile: "Personas interesadas en la salud, la ciencia y el bienestar, con habilidades para orientar a otros.",
    skills: ["Bioquímica de los alimentos", "Orientación alimentaria", "Empatía", "Investigación", "Planeación de dietas"],
    jobField:
      "Consulta privada, hospitales, industria alimentaria, nutrición deportiva, salud pública y programas comunitarios.",
    advantages: [
      "Atiende un problema de salud prioritario en México",
      "Permite ejercer de forma independiente",
      "Áreas en crecimiento como la nutrición deportiva",
    ],
    compatibleProfiles: ["Investigador analítico", "Social humanista"],
    compatibility: { cientifica: 2.5, social: 1.5, practica: 1, motivServicio: 1, organizacion: 0.5 },
  },
  {
    id: "educacion",
    name: "Licenciatura en Educación",
    area: "Ciencias sociales y humanidades",
    description:
      "Forma profesionales que diseñan, imparten y evalúan procesos de enseñanza y aprendizaje en escuelas y otras organizaciones.",
    recommendedProfile: "Personas pacientes, comunicativas, a quienes les gusta enseñar y acompañar el crecimiento de otros.",
    skills: ["Didáctica", "Comunicación", "Planeación", "Empatía", "Creatividad para enseñar"],
    jobField:
      "Escuelas públicas y privadas, capacitación en empresas, diseño de materiales educativos, educación en línea y orientación educativa.",
    advantages: [
      "Profesión con propósito social",
      "Campo amplio: escuelas, empresas y plataformas digitales",
      "Estabilidad en el sector público",
    ],
    compatibleProfiles: ["Social humanista", "Creativo expresivo"],
    compatibility: { social: 3, comunicacion: 2, motivServicio: 1.5, organizacion: 0.5, creatividad: 0.5 },
  },
  {
    id: "biotecnologia",
    name: "Ingeniería en Biotecnología",
    area: "Ciencias exactas y naturales",
    description:
      "Aplica la biología, la química y la ingeniería para crear productos y procesos en salud, alimentos, agricultura y medio ambiente.",
    recommendedProfile: "Personas curiosas por la ciencia, con gusto por el laboratorio, la investigación y la innovación.",
    skills: ["Biología molecular", "Trabajo de laboratorio", "Método científico", "Análisis de datos", "Innovación"],
    jobField:
      "Industria farmacéutica y alimentaria, laboratorios de investigación, agrobiotecnología, centros de investigación y empresas de innovación.",
    advantages: [
      "Carrera de vanguardia científica",
      "Posibilidad de posgrados en México y el extranjero",
      "Contribuye a resolver retos de salud y alimentación",
    ],
    compatibleProfiles: ["Investigador analítico", "Innovador tecnológico"],
    compatibility: { cientifica: 3, tecnologica: 1.5, logica: 1.5, motivInnovacion: 1.5, aprendizajeTeorico: 0.5 },
  },
  {
    id: "economia",
    name: "Economía",
    area: "Negocios y economía",
    description:
      "Analiza cómo las sociedades producen, distribuyen y consumen recursos, y diseña políticas para mejorar el bienestar económico.",
    recommendedProfile: "Personas analíticas, con gusto por los números, la investigación y los temas sociales y de actualidad.",
    skills: ["Análisis cuantitativo", "Estadística", "Pensamiento crítico", "Investigación", "Interpretación de datos"],
    jobField:
      "Banco de México, Secretaría de Hacienda, bancos y financieras, consultoría, organismos internacionales e investigación.",
    advantages: [
      "Perfil muy valorado en sector público y privado",
      "Alta capacidad analítica",
      "Abre puertas a organismos internacionales",
    ],
    compatibleProfiles: ["Investigador analítico", "Organizador estratégico"],
    compatibility: { empresarial: 2, administrativa: 1.5, logica: 2.5, cientifica: 0.5, aprendizajeTeorico: 1 },
  },
  {
    id: "finanzas",
    name: "Licenciatura en Finanzas",
    area: "Negocios y economía",
    description:
      "Prepara especialistas en administrar el dinero de empresas y personas: inversiones, riesgos, créditos y planeación financiera.",
    recommendedProfile: "Personas analíticas, ambiciosas y con interés por el dinero, los mercados y la toma de decisiones.",
    skills: ["Análisis financiero", "Evaluación de inversiones", "Manejo de riesgos", "Excel y modelos", "Toma de decisiones"],
    jobField:
      "Bancos, casas de bolsa, aseguradoras, fintech, áreas financieras de empresas y asesoría patrimonial.",
    advantages: [
      "Salarios atractivos",
      "Sector fintech en crecimiento en México",
      "Útil para manejar tu propio patrimonio o negocio",
    ],
    compatibleProfiles: ["Emprendedor líder", "Organizador estratégico"],
    compatibility: { administrativa: 2, empresarial: 2.5, logica: 2, motivLogro: 1 },
  },
  {
    id: "relaciones",
    name: "Relaciones Internacionales",
    area: "Ciencias sociales y humanidades",
    description:
      "Estudia las relaciones políticas, económicas y culturales entre países y organismos para participar en la diplomacia y el comercio global.",
    recommendedProfile: "Personas interesadas en otras culturas, los idiomas, la política y la negociación.",
    skills: ["Negociación", "Idiomas", "Análisis político", "Comunicación intercultural", "Redacción"],
    jobField:
      "Servicio Exterior Mexicano, organismos internacionales, comercio exterior, ONG, consultoría y empresas multinacionales.",
    advantages: [
      "Visión global",
      "Posibilidad de vivir y trabajar en otros países",
      "Útil en comercio exterior y empresas multinacionales",
    ],
    compatibleProfiles: ["Creativo expresivo", "Emprendedor líder"],
    compatibility: { social: 1.5, comunicacion: 2.5, empresarial: 1, liderazgo: 1, aprendizajeTeorico: 1 },
  },
  {
    id: "turismo",
    name: "Administración Turística",
    area: "Negocios y servicios",
    description:
      "Prepara profesionales para planear, promover y administrar servicios turísticos, hoteleros y de entretenimiento.",
    recommendedProfile: "Personas sociables, con iniciativa, gusto por viajar, atender a otros y organizar experiencias.",
    skills: ["Atención al cliente", "Idiomas", "Organización de eventos", "Gestión hotelera", "Comunicación"],
    jobField:
      "Hoteles, agencias de viajes, aerolíneas, organización de eventos, gobierno (Secretaría de Turismo) y emprendimientos turísticos.",
    advantages: [
      "México es una potencia turística mundial",
      "Ambiente de trabajo dinámico y multicultural",
      "Oportunidades de emprender",
    ],
    compatibleProfiles: ["Emprendedor líder", "Social humanista"],
    compatibility: { empresarial: 1.5, social: 2, comunicacion: 1.5, practica: 1, equipo: 1 },
  },
  {
    id: "ambientales",
    name: "Ingeniería Ambiental",
    area: "Ciencias exactas y naturales",
    description:
      "Desarrolla soluciones para proteger el medio ambiente: manejo de agua y residuos, energías limpias y sustentabilidad.",
    recommendedProfile: "Personas comprometidas con la naturaleza, con interés científico y gusto por el trabajo de campo.",
    skills: ["Análisis ambiental", "Trabajo de campo", "Gestión de recursos", "Normatividad ambiental", "Resolución de problemas"],
    jobField:
      "Empresas de energía y manufactura, consultoría ambiental, dependencias como SEMARNAT, ONG y proyectos de sustentabilidad.",
    advantages: [
      "Carrera con futuro ante el cambio climático",
      "Combina ciencia y trabajo de campo",
      "Impacto positivo en el planeta",
    ],
    compatibleProfiles: ["Investigador analítico", "Realizador práctico"],
    compatibility: { cientifica: 2.5, practica: 2, social: 1, resolucion: 1 },
  },
  {
    id: "mecatronica",
    name: "Ingeniería Mecatrónica",
    area: "Ingeniería y tecnología",
    description:
      "Integra mecánica, electrónica y programación para diseñar robots, máquinas automatizadas y sistemas inteligentes.",
    recommendedProfile: "Personas prácticas e ingeniosas, que disfrutan armar, programar y entender cómo funcionan las máquinas.",
    skills: ["Electrónica", "Programación", "Diseño mecánico", "Automatización", "Resolución de problemas"],
    jobField:
      "Industria automotriz y aeroespacial, automatización industrial, robótica, mantenimiento de equipos y desarrollo de productos.",
    advantages: [
      "Muy demandada por la industria del norte y Bajío",
      "Une teoría y práctica",
      "Campo en crecimiento por la automatización",
    ],
    compatibleProfiles: ["Innovador tecnológico", "Realizador práctico"],
    compatibility: { tecnologica: 3, practica: 2, logica: 1.5, resolucion: 1, motivInnovacion: 0.5 },
  },
  {
    id: "civil",
    name: "Ingeniería Civil",
    area: "Ingeniería y tecnología",
    description:
      "Planea, diseña y construye obras de infraestructura como edificios, carreteras, puentes, presas y sistemas de agua.",
    recommendedProfile: "Personas prácticas, buenas en matemáticas, responsables y con gusto por ver resultados físicos.",
    skills: ["Cálculo estructural", "Gestión de obra", "Matemáticas aplicadas", "Planeación", "Trabajo en campo"],
    jobField:
      "Constructoras, dependencias de obra pública, consultoría de proyectos, supervisión de obra y desarrollo inmobiliario.",
    advantages: [
      "Infraestructura siempre necesaria en México",
      "Resultados visibles y duraderos",
      "Posibilidad de dirigir tu propia constructora",
    ],
    compatibleProfiles: ["Realizador práctico", "Organizador estratégico"],
    compatibility: { practica: 2.5, logica: 2, tecnologica: 1, organizacion: 1, resolucion: 1 },
  },
  {
    id: "gastronomia",
    name: "Gastronomía",
    area: "Arte y servicios",
    description:
      "Forma profesionales de la cocina que crean, dirigen y administran experiencias culinarias, rescatando también la cocina mexicana.",
    recommendedProfile: "Personas creativas, prácticas, que disfrutan cocinar, experimentar y trabajar con las manos.",
    skills: ["Técnicas culinarias", "Creatividad", "Trabajo bajo presión", "Administración de cocina", "Trabajo en equipo"],
    jobField:
      "Restaurantes, hoteles, banquetes, industria alimentaria, consultoría gastronómica y negocio propio.",
    advantages: [
      "La cocina mexicana es Patrimonio de la Humanidad",
      "Ideal para emprender",
      "Trabajo creativo y práctico",
    ],
    compatibleProfiles: ["Realizador práctico", "Creativo expresivo"],
    compatibility: { practica: 2.5, artistica: 1.5, creatividad: 1.5, empresarial: 0.5, aprendizajePractico: 0.5 },
  },
];
