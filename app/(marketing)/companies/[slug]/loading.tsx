export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="card">
        <div className="flex gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-4 w-64 rounded bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="mt-3 flex gap-2">
              <div className="h-6 w-20 rounded-full bg-gray-200" />
              <div className="h-6 w-28 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="h-5 w-24 rounded bg-gray-200" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-5 w-32 rounded bg-gray-100" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="h-5 w-28 rounded bg-gray-200" />
          <div className="mt-3 space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded bg-gray-100" />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="h-5 w-28 rounded bg-gray-200" />
          <div className="mt-3 space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
