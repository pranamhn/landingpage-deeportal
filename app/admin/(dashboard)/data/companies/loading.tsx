export default function AdminCompaniesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-3 w-28 rounded-full bg-gray-200" />
      <div className="h-8 w-48 rounded-xl bg-gray-200" />
      <div className="h-4 w-96 rounded-full bg-gray-200" />
      <div className="h-10 w-full rounded-xl bg-gray-200" />
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 w-full rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
