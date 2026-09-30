import { Suspense } from "react";
import { LoginCard } from "@/features/auth/components/login-card";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4">
      <div className="glass-backdrop fixed inset-0 -z-10" />

      <Suspense
        fallback={
          <div className="glass-panel h-64 w-full max-w-sm animate-pulse rounded-2xl" />
        }
      >
        {searchParams.then((sp) => {
          const callbackURL = sp.callbackUrl ?? "/workspaces";
          return <LoginCard callbackURL={callbackURL} />;
        })}
      </Suspense>
    </div>
  );
}
