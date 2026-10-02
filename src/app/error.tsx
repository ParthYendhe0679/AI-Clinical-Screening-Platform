"use client";
import { ErrorState } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg place-items-center px-4">
      <ErrorState title="This screen hit an error" body={error.message || "Unexpected error."} onRetry={reset} />
    </main>
  );
}
