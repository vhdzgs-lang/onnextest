import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../server/routers";

export const trpc = createTRPCReact<AppRouter>();

export function createTrpcClient() {
  return trpc.createClient({
    links: [httpBatchLink({ url: "/api/trpc", transformer: superjson, headers: adminHeaders })],
  });
}

const ADMIN_KEY = "onnex.adminKey";

/** La contraseña del panel solo vive en la pestaña del navegador (se borra al cerrarla). */
export const adminKey = {
  get: () => {
    try {
      return sessionStorage.getItem(ADMIN_KEY) ?? "";
    } catch {
      return "";
    }
  },
  set: (v: string) => {
    try {
      if (v) sessionStorage.setItem(ADMIN_KEY, v);
      else sessionStorage.removeItem(ADMIN_KEY);
    } catch {
      /* sin almacenamiento */
    }
  },
};

function adminHeaders(): Record<string, string> {
  const key = adminKey.get();
  return key ? { "x-admin-key": key } : {};
}

/** Cliente sin React, para llamadas puntuales (por ejemplo, revisar un código de acceso). */
const vanilla = createTRPCClient<AppRouter>({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] });

export async function checkAccessCode(code: string): Promise<{ ok: true; code: string } | { ok: false; message: string }> {
  try {
    return await vanilla.access.check.query({ code });
  } catch {
    return { ok: false, message: "No pudimos revisar tu código. Revisa tu conexión e inténtalo de nuevo." };
  }
}
