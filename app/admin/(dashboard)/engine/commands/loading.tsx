export default function AdminCommandsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-3 w-28 rounded-full bg-gray-200" />
      <div className="h-8 w-48 rounded-xl bg-gray-200" />
      <div className="h-4 w-96 rounded-full bg-gray-200" />
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g} className="space-y-3">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl border border-gray-200 bg-gray-50" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
