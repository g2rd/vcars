import Link from "next/link";
import { site } from "@/config/site";

/** Znak: biały kwadrat z literą „V" + słowny znak. Do użycia na czarnej belce. */
export function Logo({ href = "/", label }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center gap-2.5 text-paper"
      aria-label={label ?? `${site.name} – strona główna`}
    >
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="6" fill="#fff" />
        <path d="M7.5 9h4.1l4.4 10.4L20.4 9h4.1l-6.6 15h-3.8z" fill="#000" />
      </svg>
      <span className="text-subheading font-medium tracking-tight">{site.name}</span>
    </Link>
  );
}
