import { CheckCircle2 } from "lucide-react";
import { Redirect } from "wouter";
import { Logo } from "@/components/Logo";
import { session } from "@/lib/session";

export const CONFIRMATION_MESSAGE =
  "Tu evaluación fue completada correctamente. Nuestro equipo revisará tus resultados y se pondrá en contacto contigo para compartirte información sobre tu orientación vocacional.";

export default function Done() {
  if (!session.isDone()) return <Redirect to="/" />;
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60 sm:p-10">
        <div className="flex justify-center">
          <Logo size={40} />
        </div>
        <CheckCircle2 className="mx-auto mt-8 h-16 w-16 text-emerald-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">¡Gracias por completar Onnex Test!</h1>
        <p className="mt-4 text-lg text-slate-600" data-testid="confirmation">
          {CONFIRMATION_MESSAGE}
        </p>
        <p className="mt-6 text-sm text-slate-500">
          ¿Dudas? Escríbenos o llámanos al{" "}
          <a href="tel:+528333435410" className="whitespace-nowrap font-semibold text-slate-700">
            833 343 5410
          </a>
          .
        </p>
        <a href="/" onClick={() => session.clearAll()} className="mt-8 inline-flex rounded-2xl bg-ink px-6 py-3 font-semibold text-white hover:bg-slate-800">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
