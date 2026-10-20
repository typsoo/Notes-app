"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { HighlightedText } from "./highlighted-text";

interface SearchResultsProps {
  query: string;
  tokens: string[];
  workspaceId: string;
}

export function SearchResults({
  query,
  tokens,
  workspaceId,
}: SearchResultsProps) {
  const [results] = api.documents.search.useSuspenseQuery({
    workspaceId,
    query,
  });
  const { id: activeDocumentId } = useParams<{ id?: string }>();

  if (results.length === 0) {
    return (
      <p
        className="text-muted-foreground px-2 py-8 text-center text-sm"
        aria-live="polite"
      >
        No documents match &quot;{query}&quot;
      </p>
    );
  }

  return (
    <section aria-label={`Search results for ${query}`}>
      <p className="text-muted-foreground mb-2 px-2 text-xs" aria-live="polite">
        {results.length} {results.length === 1 ? "document" : "documents"}
      </p>
      <ul className="flex flex-col gap-1">
        {results.map((result) => {
          const isActive = result.id === activeDocumentId;
          const href = `/workspaces/${workspaceId}/editor/${result.id}?${new URLSearchParams(
            { q: query },
          ).toString()}`;

          return (
            <li key={result.id}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "hover:bg-muted focus-visible:ring-ring flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  isActive && "bg-muted",
                )}
              >
                <FileText className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    <HighlightedText text={result.title} tokens={tokens} />
                  </span>
                  {result.folderPath && (
                    <span className="text-muted-foreground block truncate text-xs">
                      <HighlightedText
                        text={result.folderPath}
                        tokens={tokens}
                      />
                    </span>
                  )}
                  {result.snippet && (
                    <span className="text-muted-foreground mt-1 line-clamp-2 block text-xs">
                      <HighlightedText text={result.snippet} tokens={tokens} />
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-2" aria-busy="true">
      <div className="bg-muted h-3 w-28 rounded" />
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="border-border flex items-start gap-3 rounded-md border p-2"
        >
          <div className="bg-muted mt-0.5 size-4 shrink-0 rounded" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="bg-muted h-4 w-3/4 rounded" />
            <div className="bg-muted h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
