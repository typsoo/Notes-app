"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="border-border bg-muted/40 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border">
        <AlertCircle className="text-destructive h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
        An unexpected error occurred while loading this page.
      </p>
      <div className="mt-6 flex items-center justify-center">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
