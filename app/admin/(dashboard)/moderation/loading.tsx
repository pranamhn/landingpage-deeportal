export default function AdminModerationLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-3 w-32 rounded-full bg-white/10" />
        <div className="mt-4 h-10 w-72 rounded-xl bg-white/10" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded-full bg-white/10" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-xl border border-gray-200 bg-white/5" />
        ))}
      </div>
    </div>
  );
}
