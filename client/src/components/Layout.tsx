import type { ReactNode } from "react";
import { Link } from "wouter";
import { BRAND } from "@shared/brand";
import { Logo } from "./Logo";

export function Navbar({ right }: { right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="Onnex Test, ir al inicio" className="min-w-0">
          <Logo size={36} />
        </Link>
        {right}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
        <Logo size={28} />
        <p className="text-center">
          Orientación vocacional para estudiantes de preparatoria · Informes: <a className="whitespace-nowrap font-semibold text-slate-700" href={BRAND.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp {BRAND.contactPhone}</a>
        </p>
      </div>
    </footer>
  );
}
