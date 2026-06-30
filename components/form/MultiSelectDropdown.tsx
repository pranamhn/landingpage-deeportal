"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import {
  useCacheStore,
  getValidCache,
} from "@/store/useCacheStore";

interface Option {
  id: string;
  label: string;
  subLabel?: string;
  raw?: any;
}

interface MultiSelectDropdownProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: Option[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  searchPlaceholder?: string;
  className?: string;
  
  // Lazy loading props
  loading?: boolean;
  page?: number;
  hasNextPage?: boolean;
  onMount?: (enable: boolean) => void;
  updateParams?: (params: { page: number; search?: string }) => void;
  searchDelay?: number;
  autoFetch?: boolean;
  useCache?: boolean;
  cacheKey?: string;
  resetCacheOnSearch?: boolean;
  menuPosition?: "fixed" | "absolute";
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  required = false,
  placeholder = "Select items...",
  options,
  selectedIds,
  onChange,
  searchPlaceholder = "Search...",
  className = "",
  
  // Lazy loading props with defaults
  loading = false,
  page = 1,
  hasNextPage = false,
  onMount,
  updateParams,
  searchDelay = 500,
  autoFetch = false,
  useCache = false,
  cacheKey = "multi-select",
  resetCacheOnSearch = true,
  menuPosition = "fixed",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allOptions, setAllOptions] = useState<Option[]>([]);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(false);
  const optionsReadyRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);


  /* ================= CACHE ================= */
  const resolvedKey = `${cacheKey}::${searchTerm || "all"}`;
  const expiredFetchedRef = useRef(false);

  const {
    setCache,
    appendToCache,
    clearCache,
    hasHydrated,
  } = useCacheStore();

  const cached = useCache && hasHydrated
    ? getValidCache(resolvedKey)
    : null;

  const effectivePage = cached?.page ?? page;
  const effectiveHasNext = cached?.hasNextPage ?? hasNextPage;

  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  useEffect(() => {
    const all = (updateParams ? allOptions : options);
    setSelectedOptions((prev) => {
      const map = new Map<string, Option>();
      // prev first, then all overwrites — so real data always wins over N/A fallbacks
      prev.forEach(opt => map.set(opt.id, opt));
      all.forEach(opt => map.set(opt.id, opt));
      return selectedIds.map(id => {
        const opt = map.get(id);
        if (opt) return opt;
        const fallback = options.find(o => o.id === id) || allOptions.find(o => o.id === id);
        if (fallback) return fallback;
        return { id, label: 'N/A' };
      });
    });
  }, [selectedIds, options, allOptions, updateParams]);

  // Filter options berdasarkan search (untuk mode non-lazy)
  const filteredOptions = useMemo(() => {
    if (updateParams) {
      // Lazy loading mode: gunakan allOptions
      return allOptions;
    }
    // Static mode: filter lokal
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [updateParams, allOptions, options, searchTerm]);

  /* ================= EFFECTS ================= */

  /** 🔥 hydrate from cache */
  useEffect(() => {
    if (!useCache) {
      optionsReadyRef.current = true;
      return;
    }
    if (!hasHydrated) return;
    
    if (!cached || !cached.data?.length) {
      optionsReadyRef.current = true;
      return;
    }

    setAllOptions(cached.data);
    optionsReadyRef.current = true;
  }, [hasHydrated, cached, useCache]);

  /** 🔥 auto fetch when cache expired */
  useEffect(() => {
    if (!useCache || !updateParams) return;
    if (!autoFetch) return;

    // tunggu hydration
    if (!hasHydrated) return;

    // cache masih valid → pakai cache
    if (cached?.data?.length) return;

    // sudah pernah fetch karena expired → stop
    if (expiredFetchedRef.current) return;

    // jangan fetch kalau sedang loading
    if (loading) return;

    expiredFetchedRef.current = true;

    // aktifkan parent hook
    if (!mountedRef.current) {
      mountedRef.current = true;
      onMount?.(true);
    }

    updateParams({
      page: 1,
      search: searchTerm,
    });
  }, [
    useCache,
    autoFetch,
    hasHydrated,
    cached,
    loading,
    searchTerm,
    updateParams,
  ]);

  /** reset expired flag when key changes */
  useEffect(() => {
    expiredFetchedRef.current = false;
  }, [resolvedKey]);

  /** 🔥 merge API result */
  useEffect(() => {
    if (!updateParams) {
      // Mode static, gunakan options langsung
      setAllOptions(options);
      return;
    }

    optionsReadyRef.current = true;
    if (!options.length) return;

    setAllOptions(prev => {
      if (page === 1) return options;

      const ids = new Set(prev.map(o => o.id));
      return [...prev, ...options.filter(o => !ids.has(o.id))];
    });

    if (useCache) {
      const payload = { data: options, page, hasNextPage };

      page === 1
        ? setCache(resolvedKey, payload)
        : appendToCache(resolvedKey, payload);
    }
  }, [options, page, hasNextPage, updateParams, useCache]);

  /** cleanup debounce */
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  /* ================= HANDLERS ================= */

  const handleMenuOpen = () => {
    if (!updateParams) return;

    // TUNGGU hydration
    if (useCache && !hasHydrated) {
      return;
    }

    // aktifkan hook parent SEKALI
    if (!mountedRef.current && !allOptions.length) {
      mountedRef.current = true;
      onMount?.(true);
    }

    // jika cache ada → render cache saja
    if (useCache && cached?.data?.length) {
      setAllOptions(cached.data);
      return;
    }

    // tidak ada data sama sekali
    if (!allOptions.length) {
      updateParams({ page: 1, search: searchTerm });
    }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!updateParams || !hasNextPage || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isNearBottom) {
      onMount?.(true);
      updateParams({
        page: effectivePage + 1,
        search: searchTerm,
      });
    }
  }, [updateParams, hasNextPage, loading, effectivePage, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setSearchTerm(input);

    if (!updateParams) return; // Static mode

    setAllOptions([]);

    debounceRef.current && clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (useCache && resetCacheOnSearch) {
        clearCache(resolvedKey);
      }

      updateParams({
        page: 1,
        search: input || undefined,
      });
    }, searchDelay);
  };

  const handleClear = () => {
    setSearchTerm("");
    if (updateParams) {
      setAllOptions([]);
      expiredFetchedRef.current = false;
      clearCache(resolvedKey);
      updateParams({ page: 1, search: "" });
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    onChange(newSelected);
  };

  // Remove single item
  const removeItem = (id: string) => {
    onChange(selectedIds.filter((selectedId) => selectedId !== id));
  };

  // Clear all
  const clearAll = () => {
    onChange([]);
  };

  // Recalculate dropdown position anchored to button
  const DROPDOWN_HEIGHT = 260;
  const updateDropdownPosition = useCallback(() => {
    if (menuPosition !== "fixed") return;
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < DROPDOWN_HEIGHT && rect.top > DROPDOWN_HEIGHT;
    setDropdownStyle({
      position: "fixed",
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, [menuPosition]);

  // Keep dropdown anchored on scroll / resize while open
  useEffect(() => {
    if (menuPosition !== "fixed") return;
    if (!isDropdownOpen) return;
    const handler = () => updateDropdownPosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [isDropdownOpen, updateDropdownPosition, menuPosition]);

  // Open dropdown handler
  const handleDropdownToggle = () => {
    if (!isDropdownOpen) {
      handleMenuOpen();
      if (menuPosition === "fixed") {
        updateDropdownPosition();
      }
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        // Dropdown menu
        const dropdownMenu = document.querySelector('.dropdown-menu-multiselect');
        if (dropdownMenu && dropdownMenu.contains(event.target as Node)) return;
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Selected Items Tags */}
      {selectedIds.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedOptions.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium"
            >
              {item.label}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="ml-1 hover:text-blue-900 focus:outline-none"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleDropdownToggle}
          className={`w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between ${className}`}
        >
          <span className="text-gray-700">
            {selectedIds.length === 0
              ? placeholder
              : `${selectedIds.length} selected`}
          </span>
          <div className="flex items-center gap-2">
            {loading && updateParams && (
              <Loader2 size={16} className="animate-spin text-indigo-600" />
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isDropdownOpen ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            style={menuPosition === "fixed" ? dropdownStyle : undefined}
            className={`bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col dropdown-menu-multiselect ${
              menuPosition === "fixed"
                ? ""
                : "absolute top-full mt-1 left-0 w-full z-50"
            }`}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options List */}
            <div 
              ref={scrollContainerRef}
              className="max-h-48 overflow-y-auto"
              onScroll={handleScroll}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  {loading && updateParams ? "Loading..." : "No items found"}
                </div>
              ) : (
                <>
                  {filteredOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(opt.id)}
                        onChange={() => toggleSelection(opt.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 flex flex-col">
                        <span className="text-sm text-gray-700">{opt.label}</span>
                        {opt.subLabel && (
                          <span className="text-xs text-gray-400 mt-0.5">{opt.subLabel}</span>
                        )}
                      </span>
                    </label>
                  ))}
                  {loading && updateParams && effectiveHasNext && (
                    <div className="px-3 py-2 text-center">
                      <Loader2 size={16} className="animate-spin text-indigo-600 mx-auto" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Actions - sticky bottom */}
            <div className="p-2 border-t border-gray-200 bg-gray-50 flex justify-between sticky bottom-0 left-0 z-20">
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(false)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectDropdown;
