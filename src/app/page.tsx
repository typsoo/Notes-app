import Link from "next/link";
import ParticleSphere from "@/features/particle-sphere/ParticleSphere";

export default function page() {
  return (
    <ParticleSphere>
      <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-8 text-center text-white">
        <h1 className="max-w-6xl text-6xl font-bold tracking-tight">
          Keep your thoughts, organized.
        </h1>
        <Link
          href="/login"
          className="pointer-events-auto rounded-md bg-white px-5 py-3 font-medium text-black transition-colors hover:bg-white/80"
        >
          Get started
        </Link>
      </main>
    </ParticleSphere>
  );
}
