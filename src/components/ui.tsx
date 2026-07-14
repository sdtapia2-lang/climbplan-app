"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-[var(--color-surface)] rounded-[32px] p-[13px] shadow-[var(--shadow-organic-sm)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardKicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.1em] uppercase text-[var(--color-accent-500)] m-0">{children}</p>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <p className="font-[family-name:var(--font-heading)] text-[17px] leading-tight m-0">{children}</p>;
}

export function CardBody({ children }: { children: ReactNode }) {
  return <p className="text-[13px] opacity-80 m-0">{children}</p>;
}

export function CardMeta({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-[var(--color-text)]/50 m-0">{children}</p>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs mb-1 text-[var(--color-text)]/70">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full min-h-[36px] px-[14px] py-1.5 text-sm text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-divider)] rounded-full placeholder:text-[var(--color-text)]/50 hover:border-[var(--color-text)]/45 focus:outline-none focus-visible:border-[var(--color-accent-500)] transition-colors";

const textAreaClass =
  "w-full min-h-[90px] px-[14px] py-2 text-sm text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-divider)] rounded-[16px] placeholder:text-[var(--color-text)]/50 hover:border-[var(--color-text)]/45 focus:outline-none focus-visible:border-[var(--color-accent-500)] transition-colors resize-y";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${textAreaClass} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const variants: Record<string, string> = {
    primary: "bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-600)] active:bg-[var(--color-accent-700)] text-[var(--color-bg)]",
    secondary:
      "border border-[var(--color-divider)] hover:bg-[var(--color-text)]/[0.07] active:bg-[var(--color-text)]/[0.14] text-[var(--color-text)]",
    danger: "text-red-700 hover:bg-red-100",
    ghost: "text-[var(--color-accent-500)] hover:bg-[var(--color-accent-500)]/10 active:bg-[var(--color-accent-500)]/[0.18] px-1",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-[7px] font-[family-name:var(--font-heading)] text-[13px] leading-tight disabled:opacity-45 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${className}`}
    />
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "orange" | "red" | "green" }) {
  const tones: Record<string, string> = {
    neutral: "bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)]",
    orange: "bg-[var(--color-accent-100)] text-[var(--color-accent-800)]",
    green: "bg-[var(--color-accent-2-100)] text-[var(--color-accent-2-800)]",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center text-[11px] tracking-wide px-2.5 py-0.5 rounded-full ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-[var(--color-neutral-900)]/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-[32px] max-w-lg w-full max-h-[85vh] overflow-y-auto p-[17.6px] relative shadow-[var(--shadow-organic-lg)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-[family-name:var(--font-heading)] text-xl m-0">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text)]/50 hover:text-[var(--color-text)]"
            aria-label="Cerrar"
          >
            <X size={20} strokeWidth={2.75} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="text-center py-16 text-[var(--color-text)]/55">
      <p className="mb-4">{text}</p>
      {action}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-[var(--color-neutral-300)] border-t-[var(--color-accent-500)] rounded-full animate-spin" />
    </div>
  );
}
