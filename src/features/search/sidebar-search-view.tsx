"use client";

import { Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Search } from "@/features/search/components/serach";
import {
  SearchResults,
  SearchResultsSkeleton,
} from "./components/search-results";
import { EmptyState } from "./components/empty-state";

function SearchContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return <EmptyState title="Search files" body="Type something to search." />;
  }

  return <SearchResults query={q} workspaceId={workspaceId} />;
}

export default function SearchView() {
  return (
    <main className="flex flex-col gap-4">
      <Search />

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchContent />
      </Suspense>
    </main>
  );
}
