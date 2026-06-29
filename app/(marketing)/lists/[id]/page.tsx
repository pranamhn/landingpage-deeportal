import { getList, getLists } from "@/lib/api/companiesService";
import CompanyCard from "@/components/company/CompanyCard";
import Card from "@/components/ui/Card";
import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const result = await getLists();
  if (!result.success) return [];
  return result.data.map((list: any) => ({ id: list.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getList(id);
  return { title: result.success && result.data ? `${result.data.name} — List | Deeportal` : "List not found" };
}

export default async function ListDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getList(id);

  if (!result.success || !result.data) {
    return <Card className="py-16 text-center"><h1 className="font-display text-heading-card font-bold">List not found</h1><Link href="/lists" className="mt-4 inline-block text-brand-600 hover:underline">← Back</Link></Card>;
  }

  const list = result.data;
  return (
    <div>
      <Link href="/lists" className="mb-4 inline-block text-sm text-muted hover:text-brand-600">← Lists</Link>
      <section className="card mb-6">
        <h1 className="font-display text-display-page font-bold">{list.name}</h1>
        {list.description && <p className="mt-2 text-muted">{list.description}</p>}
        <span className="mt-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">{list.companies?.length || 0} company</span>
      </section>
      <div className="grid gap-3 md:grid-cols-2">
        {(list.companies || []).map((c: any) => (
          <CompanyCard key={c.id} company={c} />
        ))}
      </div>
    </div>
  );
}
