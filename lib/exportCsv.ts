/** rules/plan_database.md — bulk action "export". Client-side saja (data
 * yang sedang ditampilkan/dipilih, tidak fetch ulang ke backend) — cukup
 * untuk kebutuhan "download row yang sedang dilihat/dipilih operator". */
export function exportRowsToCsv(
  rows: Record<string, unknown>[],
  columns: { key: string; label: string }[],
  filename: string,
) {
  if (!rows.length) return;
  const escape = (val: unknown) => {
    const s = val == null ? "" : String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => escape(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => escape(row[c.key])).join(","));
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
