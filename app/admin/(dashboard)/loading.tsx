export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-3 w-32 rounded-full bg-white/10" />
        <div className="mt-4 h-10 w-72 rounded-xl bg-white/10" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded-full bg-white/10" />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-xl border border-gray-200 bg-white/5" />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-xl border border-gray-200 bg-white/5" />
        ))}
      </section>
    </div>
  );
}
