"use client";

import { FileText } from "lucide-react";
import { api } from "@/trpc/react";

interface SearchResultItem {
  id: string;
  title: string;
  folderName?: string | null;
  snippet?: string | null;
}

interface SearchResultsProps {
  query: string;
  workspaceId: string;
}

export function SearchResults({ query, workspaceId }: SearchResultsProps) {
  const [documents] = api.documents.getAll.useSuspenseQuery({ workspaceId });

  const normalizedQuery = query.toLocaleLowerCase();
  const results: SearchResultItem[] = documents
    .filter((document) =>
      document.title.toLocaleLowerCase().includes(normalizedQuery),
    )
    .map((document) => ({
      id: document.id,
      title: document.title,
    }));

  if (results.length === 0) {
    return (
      <div className="text-muted-foreground px-2 py-8 text-center text-sm">
        No results for &quot;{query}&quot;
      </div>
    );
  }

  return (
    <section aria-label={`Search results for ${query}`}>
      <p className="text-muted-foreground mb-2 px-2 text-xs">
        Results for &quot;{query}&quot;
      </p>
      <ul className="flex flex-col gap-1">
        {results.map((result) => (
          <li key={result.id}>
            <button
              type="button"
              className="hover:bg-muted flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors"
            >
              <FileText className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {result.title}
                </span>
                {result.folderName && (
                  <span className="text-muted-foreground block truncate text-xs">
                    {result.folderName}
                  </span>
                )}
                {result.snippet && (
                  <span className="text-muted-foreground mt-1 line-clamp-2 block text-xs">
                    {result.snippet}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
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
