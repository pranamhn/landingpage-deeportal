"use client";

export default function DataError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20 text-center">
      <h2 className="text-lg font-bold text-gray-900">Data page error</h2>
      <p className="mt-2 text-sm text-gray-500">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Try again
      </button>
    </div>
  );
}
