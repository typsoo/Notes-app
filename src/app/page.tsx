import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="max-w-2xl space-y-4">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Notes App
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Your thoughts, organized.
        </h1>
        <p className="text-muted-foreground text-lg">
          Keep your notes, workspaces, and ideas in one focused place.
        </p>
      </div>
      <Link
        href="/login"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-3 font-medium transition-colors"
      >
        Get started
      </Link>
    </main>
  );
}
