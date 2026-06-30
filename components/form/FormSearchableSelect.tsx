"use client";

import { useRef } from "react";
import SearchableSelect from "@/components/form/SearchableSelect";
import type { LocalOption } from "@/components/form/SearchableSelect";

interface FormSearchableSelectProps {
  name: string;
  defaultValue?: string;
  options: LocalOption[];
  placeholder?: string;
  className?: string;
}

export default function FormSearchableSelect({
  name,
  defaultValue = "",
  options,
  placeholder,
  className,
}: FormSearchableSelectProps) {
  const hiddenRef = useRef<HTMLSelectElement>(null);

  return (
    <>
      <SearchableSelect
        value={defaultValue || undefined}
        options={options}
        placeholder={placeholder}
        className={className}
        onChange={(opt) => {
          if (hiddenRef.current) {
            hiddenRef.current.value = opt?.id || "";
            hiddenRef.current.form?.requestSubmit();
          }
        }}
        onReset={() => {
          if (hiddenRef.current) {
            hiddenRef.current.value = "";
            hiddenRef.current.form?.requestSubmit();
          }
        }}
      />
      <select ref={hiddenRef} name={name} defaultValue={defaultValue} className="hidden" aria-hidden>
        <option value="">{placeholder || "All"}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </>
  );
}
