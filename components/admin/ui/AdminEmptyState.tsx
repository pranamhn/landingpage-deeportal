export function AdminEmptyState({
  title = "Belum ada data.",
  description = "Data untuk section ini belum tersedia atau masih kosong.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center dark:border-gray-700 dark:bg-gray-800">
      <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">{description}</p>
    </div>
  );
}
