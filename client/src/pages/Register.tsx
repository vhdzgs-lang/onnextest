import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { ArrowRight, KeyRound, Loader2, Lock, MessageCircle } from "lucide-react";
import { BRAND } from "@shared/brand";
import { isWellFormedCode } from "@shared/accessCode";
import { validateStudent, MIN_AGE, MAX_AGE, type StudentInput } from "@shared/validation";
import { Logo } from "@/components/Logo";
import { session } from "@/lib/session";
import { checkAccessCode } from "@/lib/trpc";

/** El código puede venir en el enlace que se manda por WhatsApp: /registro?codigo=ONX-XXXX-XXXX */
function codeFromUrl(): string {
  try {
    return new URLSearchParams(window.location.search).get("codigo")?.trim() ?? "";
  } catch {
    return "";
  }
}

type Field = keyof StudentInput;

const FIELDS: { name: Field; label: string; type: string; placeholder: string; autoComplete: string; inputMode?: "numeric" | "email" | "text" }[] = [
  { name: "fullName", label: "Nombre completo", type: "text", placeholder: "Ej. María José Hernández López", autoComplete: "name" },
  { name: "age", label: "Edad", type: "number", placeholder: "Ej. 17", autoComplete: "off", inputMode: "numeric" },
  { name: "school", label: "Escuela", type: "text", placeholder: "Nombre de tu preparatoria", autoComplete: "organization" },
  { name: "email", label: "Correo electrónico", type: "email", placeholder: "nombre@correo.com", autoComplete: "email", inputMode: "email" },
];

export default function Register() {
  const [, navigate] = useLocation();
  const saved = session.getStudent();
  const [values, setValues] = useState<Record<Field, string>>({
    fullName: String(saved?.fullName ?? ""),
    age: saved?.age !== undefined ? String(saved.age) : "",
    school: String(saved?.school ?? ""),
    email: String(saved?.email ?? ""),
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [code, setCode] = useState(() => codeFromUrl() || session.getAccessCode() || "");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const check = (next: Record<Field, string>) => {
    const result = validateStudent({ ...next, age: next.age === "" ? undefined : next.age });
    return result.errors;
  };

  const onChange = (name: Field, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors(check(next));
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (checking) return;
    const result = validateStudent({ ...values, age: values.age === "" ? undefined : values.age });
    setTouched({ fullName: true, age: true, school: true, email: true });
    const codeFormatError = !code.trim()
      ? "Escribe tu código de acceso."
      : !isWellFormedCode(code)
        ? "Revisa tu código: tiene el formato ONX-XXXX-XXXX."
        : null;
    setCodeError(codeFormatError);
    if (!result.success) setErrors(result.errors);
    if (codeFormatError) {
      document.getElementById("accessCode")?.focus();
      return;
    }
    if (!result.success) {
      const first = FIELDS.find((f) => result.errors[f.name]);
      if (first) document.getElementById(first.name)?.focus();
      return;
    }
    setChecking(true);
    const check = await checkAccessCode(code);
    setChecking(false);
    if (!check.ok) {
      setCodeError(check.message);
      document.getElementById("accessCode")?.focus();
      return;
    }
    session.setAccessCode(check.code);
    session.setStudent(result.data);
    session.setAnswers({});
    session.setIndex(0);
    navigate("/test");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <div className="bg-brand-gradient absolute inset-x-0 top-0 h-72 opacity-[0.09]" aria-hidden="true" />
      <main className="relative mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:py-14">
        <div className="flex justify-center">
          <a href="/" aria-label="Onnex Test, ir al inicio">
            <Logo size={44} />
          </a>
        </div>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Antes de comenzar</h1>
          <p className="mt-2 text-slate-600">Compártenos algunos datos para que nuestro equipo pueda contactarte con tus resultados.</p>
          <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
            <div className="rounded-2xl bg-indigo-50/70 p-4 ring-1 ring-indigo-100">
              <label htmlFor="accessCode" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <KeyRound className="h-4 w-4 text-brand-indigo" /> Código de acceso
              </label>
              <input
                id="accessCode"
                name="accessCode"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="ONX-XXXX-XXXX"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setCodeError(null);
                }}
                aria-invalid={Boolean(codeError)}
                aria-describedby={codeError ? "accessCode-error" : "accessCode-help"}
                className={`block w-full rounded-xl border bg-white px-4 py-3.5 font-mono text-base tracking-wider text-ink outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                  codeError ? "border-red-400 focus:ring-red-100" : "border-slate-300 focus:border-brand-indigo focus:ring-indigo-100"
                }`}
              />
              {codeError ? (
                <p id="accessCode-error" role="alert" className="mt-1.5 text-sm font-medium text-red-600">
                  {codeError}
                </p>
              ) : (
                <p id="accessCode-help" className="mt-1.5 text-sm text-slate-600">
                  <MessageCircle className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />¿No tienes código? Pídelo por WhatsApp al{" "}
                  <a href={BRAND.whatsappUrl} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap font-semibold text-brand-indigo underline">
                    {BRAND.contactPhone}
                  </a>
                </p>
              )}
            </div>
            {FIELDS.map((f) => (
              <div key={f.name}>
                <label htmlFor={f.name} className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  inputMode={f.inputMode}
                  min={f.name === "age" ? MIN_AGE : undefined}
                  max={f.name === "age" ? MAX_AGE : undefined}
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                  value={values[f.name]}
                  onChange={(e) => onChange(f.name, e.target.value)}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, [f.name]: true }));
                    setErrors(check(values));
                  }}
                  aria-invalid={Boolean(touched[f.name] && errors[f.name])}
                  aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
                  className={`block w-full rounded-xl border bg-white px-4 py-3.5 text-base text-ink outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    touched[f.name] && errors[f.name] ? "border-red-400 focus:ring-red-100" : "border-slate-300 focus:border-brand-indigo focus:ring-indigo-100"
                  }`}
                />
                {touched[f.name] && errors[f.name] && (
                  <p id={`${f.name}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
                    {errors[f.name]}
                  </p>
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={checking}
              className="bg-brand-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-70"
            >
              Comenzar test {checking ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            </button>
            <p className="flex items-start gap-2 text-xs text-slate-500">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Tus datos son confidenciales y solo los usa el equipo de orientación de Onnex Test para contactarte.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
