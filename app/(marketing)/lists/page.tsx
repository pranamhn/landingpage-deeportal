import { getLists } from "@/lib/api/companiesService";

export default async function ListsPage() {
  const result = await getLists();
  const lists = result.success ? result.data : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-display-page font-bold">Lists</h1>
        <p className="mt-1 text-muted">Manually curated companies, grouped by theme.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lists.map((item: any) => (
          <a key={item.id} href={`/lists/${item.id}`} className="card group transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="font-semibold group-hover:text-brand-600">{item.name}</div>
            {item.description && <p className="mt-1 text-xs text-muted">{item.description}</p>}
            <span className="mt-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">{item.company_count} company</span>
          </a>
        ))}
        {lists.length === 0 && <div className="card py-12 text-center col-span-2"><p className="text-muted">No lists yet.</p></div>}
      </div>
    </div>
  );
}
