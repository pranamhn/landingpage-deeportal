export default function AdminDataQualityLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-3 w-32 rounded-full bg-white/10" />
        <div className="mt-4 h-10 w-72 rounded-xl bg-white/10" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded-full bg-white/10" />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white/5" />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-56 animate-pulse rounded-xl border border-gray-200 bg-white/5" />
        ))}
      </section>
    </div>
  );
}
