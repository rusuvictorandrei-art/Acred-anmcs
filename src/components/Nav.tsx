"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

export function Nav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
      {items.map((it) => {
        const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
        return (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center whitespace-nowrap rounded-lg px-3 py-3 min-h-11 text-sm font-medium ${
                active ? "bg-navy-light text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {it.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
