"use client";

import { Suspense, useDeferredValue } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { EmptyState } from "./components/empty-state";
import { SearchInput } from "./components/search-input";
import {
  SearchResults,
  SearchResultsSkeleton,
} from "./components/search-results";
import { tokenizeQuery } from "./lib/query";

function SearchPanel() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const deferredQuery = useDeferredValue(query);
  const tokens = tokenizeQuery(deferredQuery);

  return (
    <main className="flex flex-col gap-4">
      <SearchInput isStale={query !== deferredQuery} />

      {!query ? (
        <EmptyState
          title="Search documents"
          body="Type to search documents by title, body, or folder."
        />
      ) : query.length < 2 ? (
        <p className="text-muted-foreground px-2 py-8 text-center text-sm">
          Type at least 2 characters to search.
        </p>
      ) : (
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults
            query={deferredQuery}
            tokens={tokens}
            workspaceId={workspaceId}
          />
        </Suspense>
      )}
    </main>
  );
}

export default function SearchView() {
  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchPanel />
    </Suspense>
  );
}
