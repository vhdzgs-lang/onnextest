import { useEffect, useState, type FormEvent } from "react";
import { TRPCClientError } from "@trpc/client";
import { Check, Copy, KeyRound, Loader2, LogOut, Plus, Trash2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { adminKey, trpc } from "@/lib/trpc";

type Filter = "all" | "available" | "used";

const dateFmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Mensaje listo para pegar en WhatsApp al vender un código. */
export function whatsappMessage(code: string, origin = window.location.origin): string {
  return `¡Gracias por tu compra! 🎓\nTu código de acceso a Onnex Test es: *${code}*\n\nEntra aquí para hacer tu test (toma de 10 a 15 minutos):\n${origin}/registro?codigo=${code}\n\nEl código sirve para un solo test.`;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1500);
        } catch {
          window.prompt("Copia el texto:", text);
        }
      }}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      {done ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />} {done ? "Copiado" : label}
    </button>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const utils = trpc.useUtils();

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setError(null);
    adminKey.set(password);
    try {
      await utils.admin.login.fetch(undefined, { staleTime: 0 });
      onDone();
    } catch (err) {
      adminKey.set("");
      setError(err instanceof TRPCClientError ? err.message : "No se pudo entrar. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60">
        <Logo size={36} />
        <h1 className="mt-6 text-xl font-extrabold text-ink">Panel de códigos</h1>
        <label htmlFor="password" className="mt-5 mb-1.5 block text-sm font-semibold text-slate-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-brand-indigo focus:ring-4 focus:ring-indigo-100"
        />
        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <button disabled={busy || !password} className="bg-brand-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-bold text-white disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
        </button>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const utils = trpc.useUtils();
  const codesQuery = trpc.admin.codes.useQuery();
  const create = trpc.admin.createCodes.useMutation({ onSuccess: () => utils.admin.codes.invalidate() });
  const remove = trpc.admin.removeCode.useMutation({ onSuccess: () => utils.admin.codes.invalidate() });
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [fresh, setFresh] = useState<string[]>([]);

  useEffect(() => {
    if (codesQuery.error?.data?.code === "UNAUTHORIZED") onLogout();
  }, [codesQuery.error, onLogout]);

  const rows = codesQuery.data ?? [];
  const used = rows.filter((r) => r.redeemedAt).length;
  const shown = rows.filter((r) => (filter === "all" ? true : filter === "used" ? r.redeemedAt : !r.redeemedAt));

  const onCreate = async (ev: FormEvent) => {
    ev.preventDefault();
    const n = Math.max(1, Math.min(50, Number(quantity) || 1));
    const created = await create.mutateAsync({ quantity: n, note: note.trim() || undefined });
    setFresh(created.map((c) => c.code));
    setNote("");
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo size={30} />
          <button onClick={onLogout} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-ink">
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            ["Disponibles", rows.length - used],
            ["Usados", used],
            ["Total", rows.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <KeyRound className="h-5 w-5 text-brand-indigo" /> Generar códigos
          </h2>
          <form onSubmit={onCreate} className="mt-4 grid gap-3 sm:grid-cols-[110px_1fr_auto]">
            <div>
              <label htmlFor="quantity" className="mb-1 block text-xs font-semibold text-slate-600">
                Cantidad
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                max={50}
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-brand-indigo"
              />
            </div>
            <div>
              <label htmlFor="note" className="mb-1 block text-xs font-semibold text-slate-600">
                Nota (opcional): a quién se lo vendiste
              </label>
              <input
                id="note"
                maxLength={200}
                placeholder="Ej. Juan Pérez · 833 123 4567"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-brand-indigo"
              />
            </div>
            <button disabled={create.isPending} className="bg-brand-gradient inline-flex items-center justify-center gap-2 self-end rounded-xl px-5 py-2.5 font-bold text-white disabled:opacity-60">
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Generar
            </button>
          </form>
          {create.isError && <p className="mt-2 text-sm text-red-600">{create.error.message}</p>}
          {fresh.length > 0 && (
            <div className="mt-4 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200" data-testid="fresh-codes">
              <p className="text-sm font-semibold text-emerald-800">Códigos nuevos. Copia el mensaje y pégalo en WhatsApp:</p>
              <ul className="mt-3 space-y-2">
                {fresh.map((c) => (
                  <li key={c} className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-base font-bold tracking-wider text-ink">{c}</span>
                    <CopyButton text={whatsappMessage(c)} label="Copiar mensaje" />
                    <CopyButton text={c} label="Copiar código" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
            <h2 className="text-lg font-bold text-ink">Todos los códigos</h2>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
              {(
                [
                  ["all", "Todos"],
                  ["available", "Disponibles"],
                  ["used", "Usados"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-3 py-1.5 ${filter === value ? "bg-white text-ink shadow-sm" : "text-slate-600"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {codesQuery.isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-indigo" />
            </div>
          ) : codesQuery.isError ? (
            <p className="p-6 text-sm text-red-600">No se pudieron cargar los códigos. {codesQuery.error.message}</p>
          ) : shown.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No hay códigos todavía. Genera el primero arriba.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {shown.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold tracking-wider text-ink">{r.code}</span>
                      {r.redeemedAt ? (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">Usado</span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Disponible</span>
                      )}
                    </div>
                    {r.note && <p className="mt-0.5 text-sm text-slate-600">{r.note}</p>}
                    <p className="mt-0.5 text-xs text-slate-500">
                      {r.redeemedAt
                        ? `Usado por ${r.redeemedByName ?? "?"} (${r.redeemedByEmail ?? "sin correo"}) el ${dateFmt.format(new Date(r.redeemedAt))}`
                        : `Creado el ${dateFmt.format(new Date(r.createdAt))}`}
                    </p>
                  </div>
                  {!r.redeemedAt && (
                    <div className="flex shrink-0 gap-2">
                      <CopyButton text={whatsappMessage(r.code)} label="Copiar mensaje" />
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Borrar el código ${r.code}? Ya no se podrá usar.`)) remove.mutate({ code: r.code });
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Borrar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(() => Boolean(adminKey.get()));
  const logout = () => {
    adminKey.set("");
    setLoggedIn(false);
  };
  return loggedIn ? <Dashboard onLogout={logout} /> : <Login onDone={() => setLoggedIn(true)} />;
}
