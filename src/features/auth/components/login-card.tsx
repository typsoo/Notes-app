"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/server/better-auth/clients";
import { Button } from "@/components/ui/button";

interface LoginCardProps {
  callbackURL: string;
}

export function LoginCard({ callbackURL }: LoginCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await authClient.signIn.social({
      provider: "github",
      callbackURL,
    });
  };

  return (
    <div className="glass-panel relative flex w-full max-w-sm flex-col gap-6 rounded-2xl p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.25),0_10px_20px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2)] transition-all duration-300">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to access your workspaces and notes
        </p>
      </div>

      <Button
        size="lg"
        onClick={handleSignIn}
        disabled={loading}
        className="w-full gap-2 shadow-md transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <svg className="size-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        )}
        Sign in with GitHub
      </Button>
    </div>
  );
}
