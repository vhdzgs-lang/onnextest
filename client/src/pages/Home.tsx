import { Link } from "wouter";
import { BarChart3, Brain, Compass, FileText, GraduationCap, Sparkles, Target, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { Footer, Navbar } from "@/components/Layout";

const BENEFITS = [
  { icon: Compass, title: "Evaluación vocacional personalizada", text: "50 preguntas pensadas para estudiantes de preparatoria que exploran tus intereses reales." },
  { icon: Brain, title: "Análisis de personalidad", text: "Conoce tu tipo de perfil, tus rasgos dominantes y lo que te motiva." },
  { icon: Sparkles, title: "Identificación de fortalezas", text: "Descubre en qué destacas y qué habilidades te conviene seguir desarrollando." },
  { icon: BarChart3, title: "Análisis de competencias", text: "Liderazgo, creatividad, lógica, comunicación, organización y más." },
  { icon: GraduationCap, title: "Carreras mexicanas recomendadas", text: "Tres carreras compatibles contigo, con su campo laboral y ventajas." },
  { icon: FileText, title: "Reporte profesional en PDF", text: "Nuestro equipo recibe un reporte detallado para orientarte personalmente." },
];

const STEPS = [
  { n: "1", title: "Regístrate", text: "Escribe tu nombre, edad, escuela y correo." },
  { n: "2", title: "Responde", text: "Contesta 50 preguntas con sinceridad. No hay respuestas buenas ni malas." },
  { n: "3", title: "Recibe orientación", text: "Nuestro equipo revisa tus resultados y te contacta para compartirlos." },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar
        right={
          <Link href="/registro" className="hidden rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:inline-flex">
            Comenzar test
          </Link>
        }
      />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="bg-brand-gradient absolute inset-0 opacity-[0.07]" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-indigo shadow-sm ring-1 ring-indigo-100">
                <Target className="h-3.5 w-3.5" /> Para estudiantes de preparatoria en México
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Descubre la carrera que <span className="text-brand-gradient">va contigo</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Onnex Test es una evaluación vocacional que te ayuda a identificar tus intereses, habilidades y las áreas profesionales más
                compatibles con tu forma de ser, para que elijas tu carrera con más claridad.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/registro"
                  className="bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
                >
                  Comenzar test <ArrowRight className="h-5 w-5" />
                </Link>
                <span className="inline-flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" /> Toma de 10 a 15 minutos
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-brand-gradient rounded-[2rem] p-6 text-white shadow-2xl shadow-indigo-500/30 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/75">Lo que evaluamos</p>
                <ul className="mt-5 space-y-3">
                  {["Intereses profesionales", "Habilidades y aptitudes", "Personalidad y motivaciones", "Estilo de trabajo y aprendizaje", "Carreras compatibles"].map((t) => (
                    <li key={t} className="flex items-center gap-3 rounded-xl bg-white/12 px-4 py-3 text-base font-semibold ring-1 ring-white/20">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-brand-indigo">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 flex items-start gap-2 text-sm text-white/85">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Tus datos son confidenciales. Un orientador de nuestro equipo te comparte los resultados.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink">¿Qué obtienes con Onnex Test?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Un análisis completo de tu perfil para ayudarte a tomar decisiones académicas con mayor seguridad.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-xl text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
                <p className="mt-1.5 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink">¿Cómo funciona?</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                  <span className="text-brand-gradient text-4xl font-black">{s.n}</span>
                  <h3 className="mt-2 text-lg font-bold text-ink">{s.title}</h3>
                  <p className="mt-1 text-slate-600">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/registro" className="bg-brand-gradient inline-flex items-center gap-2 rounded-2xl px-7 py-4 font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110">
                Comenzar test <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
