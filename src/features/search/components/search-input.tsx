"use client";

import { LoaderCircle } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";

interface SearchInputProps {
  isStale?: boolean;
}

export function SearchInput({ isStale = false }: SearchInputProps) {
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
        // Update the URL without a server round trip; the query is read only by
        // client components. Next syncs this with useSearchParams.
        window.history.replaceState(
          null,
          "",
          nextQuery ? `${pathname}?${nextQuery}` : pathname,
        );
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, q, searchParams, startTransition, value]);

  const isBusy = isPending || isStale;

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      <span className="relative block">
        <input
          type="search"
          id={inputId}
          name="q"
          placeholder="Search documents..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-busy={isBusy}
          className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 pr-8 text-sm outline-none focus:ring-2"
        />
        {isBusy && (
          <LoaderCircle
            className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 animate-spin"
            aria-hidden="true"
          />
        )}
      </span>
    </label>
  );
}
