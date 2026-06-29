import { formatStatus } from "@/lib/formatters/format";

export interface CompanyFactsData {
  status?: string | null;
  location?: string | null;
  founded_year?: string | null;
  employee_range?: string | null;
  funding_rounds?: unknown[];
}

export default function CompanyFacts({ company }: { company: CompanyFactsData }) {
  const facts = [
    { label: "Status", value: formatStatus(company.status), emphasize: false },
    { label: "Location", value: company.location || "—", emphasize: false },
    { label: "Founded", value: company.founded_year || "—", emphasize: false },
    { label: "Employees", value: company.employee_range || "—", emphasize: false },
    { label: "Funding rounds", value: String(company.funding_rounds?.length || 0), emphasize: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-5">
      {facts.map((item) => (
        <div key={item.label} className="min-w-0 rounded-2xl border border-black/10 bg-brand-50 p-5 shadow-sm">
          <span className="block truncate text-xs uppercase tracking-wide text-muted">{item.label}</span>
          <strong
            className={`mt-0.5 block truncate font-display ${item.emphasize ? "text-heading-section text-brand-700" : "text-gray-800"}`}
            title={item.value}
          >
            {item.value}
          </strong>
        </div>
      ))}
    </div>
  );
}
