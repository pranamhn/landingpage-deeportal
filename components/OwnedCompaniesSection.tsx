"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getOwnedCompanies, updateOwnedCompany, type OwnedCompany } from "@/lib/api/ownedCompaniesService";

function EditForm({ company, onDone }: { company: OwnedCompany; onDone: () => void }) {
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const result = await updateOwnedCompany(company.id, { description, website });
    setSaving(false);
    if (result.success) onDone();
    else setError(result.message);
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-gray-200 p-3">
      {error && <p className="text-xs text-danger-600">{error}</p>}
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Official website</label>
        <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        <Button variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}

export default function OwnedCompaniesSection() {
  const [companies, setCompanies] = useState<OwnedCompany[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getOwnedCompanies().then((r) => {
      if (r.success) setCompanies(r.data);
      setLoaded(true);
    });
  }, []);

  if (!loaded || companies.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 font-display text-heading-section font-bold">Companies you manage</h2>
      <Card className="space-y-2">
        {companies.map((c) => (
          <div key={c.id} className="rounded-lg p-2">
            <div className="flex items-center justify-between">
              <a href={`/companies/${c.slug}`} className="font-semibold hover:text-brand-600">{c.name}</a>
              {editingId !== c.id && (
                <Button variant="ghost" onClick={() => setEditingId(c.id)}>Edit profile</Button>
              )}
            </div>
            {editingId === c.id && <EditForm company={c} onDone={() => setEditingId(null)} />}
          </div>
        ))}
      </Card>
    </section>
  );
}
