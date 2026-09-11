"use client";

import { authClient } from "@/server/better-auth/clients";

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="p-8">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <h1 className="text-xl font-bold">Signed in successfully</h1>
        <pre className="rounded bg-zinc-900 p-4 text-sm text-green-400">
          {JSON.stringify(session, null, 2)}
        </pre>
        <button
          onClick={() => authClient.signOut()}
          className="w-fit rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => authClient.signIn.social({ provider: "github" })}
        className="rounded bg-black px-4 py-2 font-medium text-white hover:bg-zinc-800"
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
