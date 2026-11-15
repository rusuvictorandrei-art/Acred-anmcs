"use client";

export function PrintButton({ label = "Tipărește / salvează PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary">
      {label}
    </button>
  );
}
