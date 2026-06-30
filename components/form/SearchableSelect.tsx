"use client";

import Select from "react-select";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";

/* ================= TYPES ================= */

export interface LocalOption {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  value?: string;
  options: LocalOption[];

  onChange: (opt?: LocalOption | null) => void;
  onReset?: () => void;

  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
  className?: string;
}

/* ================= COMPONENT ================= */

export default function SearchableSelect({
  value,
  options,
  onChange,
  onReset,

  placeholder = "Select one...",
  isClearable = true,
  isDisabled = false,
  className,
}: SearchableSelectProps) {
  const mappedOptions = useMemo(
    () =>
      options.map((o) => ({
        value: o.id,
        label: o.label,
      })),
    [options]
  );

  const selected =
    mappedOptions.find((o) => o.value === value) || null;

  return (
    <Select
      options={mappedOptions}
      value={selected}
      isClearable={isClearable}
      isDisabled={isDisabled}
      placeholder={placeholder}
      onChange={(opt) => {
        if (!opt) {
          onReset?.();
          onChange(null);
          return;
        }

        const found = options.find(
          (o) => o.id === opt.value
        );
        onChange(found);
      }}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? "No results found" : "No options"
      }
      className={className}
      styles={{
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        control: (base, state) => ({
          ...base,
          minHeight: 38,
          borderRadius: 10,
          fontSize: 14,
          marginTop: 2,
          borderColor: className?.includes("border-red-500") ? "#ef4444" : base.borderColor,
          boxShadow: state.isFocused
            ? (className?.includes("border-red-500") ? "0 0 0 1px #ef4444" : "0 0 0 1px #4f46e5")
            : base.boxShadow,
          "&:hover": {
            borderColor: className?.includes("border-red-500") ? "#ef4444" : (state.isFocused ? "#4f46e5" : "#9ca3af"),
          }
        }),
        option: (base) => ({
          ...base,
          fontSize: 14,
        }),
        singleValue: (base) => ({
          ...base,
          fontSize: 14,
        }),
        placeholder: (base) => ({
          ...base,
          fontSize: 14,
        }),
      }}
      menuPortalTarget={
        typeof document !== "undefined"
          ? document.body
          : null
      }
      components={{
        LoadingIndicator: () => (
          <Loader2
            size={16}
            className="animate-spin text-indigo-600"
          />
        ),
      }}
    />
  );
}
