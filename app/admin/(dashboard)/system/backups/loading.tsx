export default function AdminBackupsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-3 w-28 rounded-full bg-gray-200" />
      <div className="h-8 w-48 rounded-xl bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-gray-200 bg-gray-50" />
        ))}
      </div>
      <div className="h-64 rounded-xl border border-gray-200 bg-gray-50" />
    </div>
  );
}
