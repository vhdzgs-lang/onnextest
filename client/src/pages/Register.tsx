import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Lock } from "lucide-react";
import { validateStudent, MIN_AGE, MAX_AGE, type StudentInput } from "@shared/validation";
import { Logo } from "@/components/Logo";
import { session } from "@/lib/session";

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

  const check = (next: Record<Field, string>) => {
    const result = validateStudent({ ...next, age: next.age === "" ? undefined : next.age });
    return result.errors;
  };

  const onChange = (name: Field, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors(check(next));
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const result = validateStudent({ ...values, age: values.age === "" ? undefined : values.age });
    setTouched({ fullName: true, age: true, school: true, email: true });
    if (!result.success) {
      setErrors(result.errors);
      const first = FIELDS.find((f) => result.errors[f.name]);
      if (first) document.getElementById(first.name)?.focus();
      return;
    }
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
            <button type="submit" className="bg-brand-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110">
              Comenzar test <ArrowRight className="h-5 w-5" />
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
