export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-3xl flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm leading-relaxed text-slate-600">{description}</p>}
      </div>
      {children && <div className="no-print flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}

export function ReadOnlyNote() {
  return (
    <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      Ai acces doar pentru citire. Cere unui administrator drepturi de editare.
    </p>
  );
}
