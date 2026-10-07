import { Search as SearchIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  body: string;
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="border-border bg-muted/40 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border">
        <SearchIcon className="text-muted-foreground h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{body}</p>
    </div>
  );
}
