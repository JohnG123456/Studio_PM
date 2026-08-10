export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-muted">
      <span>{children}</span>
      {hint && <span className="text-[10px] font-normal text-muted-dim">{hint}</span>}
    </label>
  );
}

const fieldClass =
  "w-full rounded-xl border border-border bg-background-elevated px-3 py-2.5 text-sm text-foreground placeholder:text-muted-dim focus:border-accent focus:outline-none";

export function PlainInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function PlainTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} min-h-20 resize-y ${props.className ?? ""}`} />;
}

export function PlainSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-background disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}

export function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground ${props.className ?? ""}`}
    />
  );
}
