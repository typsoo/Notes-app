"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

export function Search() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const inputId = useId();
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [value, setValue] = useState(q);

  useEffect(() => {
    setValue(q);
  }, [q]);

  useEffect(() => {
    const nextValue = value.trim();

    if (nextValue === q.trim()) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextSearchParams = new URLSearchParams(searchParams.toString());

      if (nextValue) {
        nextSearchParams.set("q", nextValue);
      } else {
        nextSearchParams.delete("q");
      }

      const nextQuery = nextSearchParams.toString();

      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
          scroll: false,
        });
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, q, router, searchParams, startTransition, value]);

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      <input
        type="search"
        id={inputId}
        ref={inputRef}
        name="q"
        placeholder="Search files..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-busy={isPending}
        className="border-input bg-background focus:ring-ring rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
      />
    </label>
  );
}
