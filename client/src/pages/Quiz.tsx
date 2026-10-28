import { useEffect, useRef, useState } from "react";
import { TRPCClientError } from "@trpc/client";
import { Redirect, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";
import { Logo } from "@/components/Logo";
import { session } from "@/lib/session";
import { trpc } from "@/lib/trpc";
import { studentSchema } from "@shared/validation";

export function ProcessingScreen() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <Logo size={44} />
      <Loader2 className="h-12 w-12 animate-spin text-brand-indigo" aria-hidden="true" />
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Procesando tu evaluación…</h1>
        <p className="mt-2 max-w-sm text-slate-600">Estamos analizando tus respuestas. Esto puede tardar unos segundos, no cierres esta página.</p>
      </div>
    </div>
  );
}

export default function Quiz() {
  const [, navigate] = useLocation();
  const student = session.getStudent();
  const questionsQuery = trpc.test.questions.useQuery(undefined, { staleTime: Infinity, retry: 2 });
  const submit = trpc.test.submit.useMutation();
  const [answers, setAnswers] = useState<Record<number, number>>(() => session.getAnswers());
  const [index, setIndex] = useState(() => session.getIndex());
  const [showRequired, setShowRequired] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const advanceTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  if (!student || !studentSchema.safeParse(student).success) return <Redirect to="/registro" />;

  if (questionsQuery.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-brand-indigo" aria-label="Cargando preguntas" />
      </div>
    );
  }
  if (questionsQuery.isError || !questionsQuery.data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-ink">No pudimos cargar el cuestionario.</p>
        <button className="rounded-xl bg-ink px-5 py-3 font-semibold text-white" onClick={() => questionsQuery.refetch()}>
          Reintentar
        </button>
      </div>
    );
  }

  const { questions, scale } = questionsQuery.data;
  const total = questions.length;
  const current = Math.min(index, total - 1);
  const question = questions[current]!;
  const selected = answers[question.id];
  const answeredCount = Object.keys(answers).length;
  const isLast = current === total - 1;
  const progress = Math.round((answeredCount / total) * 100);

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(total - 1, i));
    setIndex(next);
    session.setIndex(next);
    setShowRequired(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const choose = (value: number) => {
    const firstTime = answers[question.id] === undefined;
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    session.setAnswers(next);
    setShowRequired(false);
    // Avanza solo la primera vez que se responde, para que el estudiante pueda corregir sin saltos.
    window.clearTimeout(advanceTimer.current);
    if (firstTime && !isLast) advanceTimer.current = window.setTimeout(() => goTo(current + 1), 280);
  };

  const onNext = async () => {
    if (selected === undefined) {
      setShowRequired(true);
      return;
    }
    if (!isLast) return goTo(current + 1);
    const missing = questions.findIndex((q) => answers[q.id] === undefined);
    if (missing !== -1) {
      goTo(missing);
      setShowRequired(true);
      return;
    }
    setSubmitError(null);
    try {
      await submit.mutateAsync({
        student,
        answers: questions.map((q) => ({ questionId: q.id, value: answers[q.id]! })),
      });
      session.clearTest();
      session.markDone();
      navigate("/listo", { replace: true });
    } catch (err) {
      // Solo se muestra el mensaje del servidor cuando es el aviso controlado para el estudiante.
      const isServerNotice = err instanceof TRPCClientError && err.data?.code === "INTERNAL_SERVER_ERROR";
      setSubmitError(
        isServerNotice
          ? `${err.message} Tus respuestas siguen guardadas.`
          : "No pudimos enviar tu evaluación. Revisa tu conexión e inténtalo de nuevo. Tus respuestas siguen guardadas.",
      );
    }
  };

  if (submit.isPending) return <ProcessingScreen />;

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Logo size={30} />
          <span className="whitespace-nowrap text-sm font-semibold text-slate-600" aria-live="polite">
            Pregunta {current + 1} de {total}
          </span>
        </div>
        <div
          className="h-1.5 w-full bg-slate-100"
          role="progressbar"
          aria-label="Progreso del cuestionario"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="bg-brand-gradient h-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-32 pt-6 sm:pt-10">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-indigo">
          <span>{question.section}</span>
          <span className="text-slate-500">{progress}% completado</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-snug text-ink sm:text-3xl" id="question-text">
          {question.text}
        </h1>

        <div role="radiogroup" aria-labelledby="question-text" className="mt-6 grid gap-3">
          {scale.map((opt) => {
            const active = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => choose(opt.value)}
                className={`flex min-h-14 w-full items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left text-base font-semibold transition ${
                  active
                    ? "border-brand-indigo bg-indigo-50 text-ink shadow-md shadow-indigo-500/10"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-brand-indigo bg-brand-indigo" : "border-slate-300"}`}
                  aria-hidden="true"
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>

        {showRequired && (
          <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
            Selecciona una respuesta para continuar.
          </p>
        )}
        {submitError && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {submitError}
          </p>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 sm:flex-none sm:px-6"
          >
            <ArrowLeft className="h-5 w-5" /> Anterior
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-disabled={selected === undefined}
            className={`bg-brand-gradient flex flex-[1.6] items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/25 transition sm:ml-auto sm:flex-none sm:px-8 ${
              selected === undefined ? "opacity-50" : "hover:brightness-110"
            }`}
          >
            {isLast ? (
              <>
                Enviar respuestas <Send className="h-5 w-5" />
              </>
            ) : (
              <>
                Siguiente <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
