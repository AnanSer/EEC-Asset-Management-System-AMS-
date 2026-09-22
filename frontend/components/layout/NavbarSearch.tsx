'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Loader2,
  Package,
  User,
  Building2,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import searchService, { GlobalSearchResults } from '@/services/search.service';
import StatusBadge from '@/components/ui/StatusBadge';

export default function NavbarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResults>({
    assets: [],
    employees: [],
    departments: [],
    maintenance: [],
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch search results with debouncing
  useEffect(() => {
    const trimmed = query.trim();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (trimmed.length < 2) {
      setResults({
        assets: [],
        employees: [],
        departments: [],
        maintenance: [],
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchService.globalSearch(trimmed);
        setResults(data);
      } catch (err) {
        console.error('Global search error:', err);
        setResults({
          assets: [],
          employees: [],
          departments: [],
          maintenance: [],
        });
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setResults({
      assets: [],
      employees: [],
      departments: [],
      maintenance: [],
    });
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const totalResults =
    results.assets.length +
    results.employees.length +
    results.departments.length +
    results.maintenance.length;

  const showDropdown = isOpen && query.trim().length >= 2;

  return (
    <div ref={wrapperRef} className="relative hidden sm:block">
      {/* ─── Search Input Bar ─── */}
      <div className="relative group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-eec-accent transition-colors"
          size={15}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder="Search assets, employees, tickets…"
          className="pl-8 pr-8 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg w-64 md:w-80 focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent transition-all placeholder:text-slate-400"
          aria-label="Global search across system"
          aria-expanded={showDropdown}
        />

        {/* Loading Spinner or Clear Button */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
          {isLoading ? (
            <Loader2 size={14} className="text-slate-400 animate-spin" />
          ) : query ? (
            <button
              onClick={handleClear}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              aria-label="Clear search query"
            >
              <X size={13} />
            </button>
          ) : null}
        </div>
      </div>

      {/* ─── Search Results Dropdown Overlay ─── */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-[460px] bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden z-50">
          {/* Header Summary */}
          <div className="px-3.5 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {isLoading ? (
                'Searching EEC database…'
              ) : (
                <>
                  Results for <span className="font-semibold text-slate-700">"{query.trim()}"</span>
                </>
              )}
            </span>
            {!isLoading && (
              <span className="text-[11px] font-medium bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded">
                {totalResults} found
              </span>
            )}
          </div>

          <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-100">
            {/* Loading Skeleton */}
            {isLoading && totalResults === 0 && (
              <div className="p-6 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-eec-accent" size={24} />
                <span>Searching enterprise assets, employees, departments & tickets…</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && totalResults === 0 && (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <Search size={18} />
                </div>
                <p className="text-sm font-medium text-slate-700">No results found</p>
                <p className="text-xs text-slate-400 mt-1">
                  We couldn't find any matches for &ldquo;{query}&rdquo;.
                </p>
              </div>
            )}

            {/* 1. ASSETS SECTION */}
            {results.assets.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Package size={13} className="text-blue-500" />
                  <span>Assets ({results.assets.length})</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {results.assets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => handleNavigate(`/assets/${asset.id}`)}
                      className="w-full text-left p-2 rounded-lg hover:bg-blue-50/50 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Package size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                            {asset.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            <span className="font-mono text-slate-600">{asset.assetCode}</span>
                            <span className="mx-1">•</span>
                            <span>{asset.category}</span>
                            {asset.departmentName && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="truncate">{asset.departmentName}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={asset.status.toLowerCase()} />
                        <ArrowRight
                          size={14}
                          className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-blue-600 transition-all -translate-x-1 group-hover:translate-x-0"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. EMPLOYEES SECTION */}
            {results.employees.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <User size={13} className="text-emerald-500" />
                  <span>Employees ({results.employees.length})</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {results.employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleNavigate(`/employees/${emp.id}`)}
                      className="w-full text-left p-2 rounded-lg hover:bg-emerald-50/50 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <User size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                            {emp.fullName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            <span className="font-mono text-slate-600">{emp.employeeId}</span>
                            {emp.departmentName && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="truncate">{emp.departmentName}</span>
                              </>
                            )}
                            {emp.jobTitle && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="truncate">{emp.jobTitle}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={emp.isActive ? 'active' : 'inactive'} />
                        <ArrowRight
                          size={14}
                          className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-emerald-600 transition-all -translate-x-1 group-hover:translate-x-0"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DEPARTMENTS SECTION */}
            {results.departments.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Building2 size={13} className="text-purple-500" />
                  <span>Departments ({results.departments.length})</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {results.departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => handleNavigate(`/departments/${dept.id}`)}
                      className="w-full text-left p-2 rounded-lg hover:bg-purple-50/50 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-purple-100/60 text-purple-700 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <Building2 size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-purple-700 transition-colors">
                            {dept.departmentName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            <span className="font-mono text-slate-600">{dept.departmentCode}</span>
                            {dept.location && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="truncate">{dept.location}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={dept.isActive ? 'active' : 'inactive'} />
                        <ArrowRight
                          size={14}
                          className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-purple-600 transition-all -translate-x-1 group-hover:translate-x-0"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. MAINTENANCE TICKETS SECTION */}
            {results.maintenance.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Wrench size={13} className="text-amber-500" />
                  <span>Maintenance ({results.maintenance.length})</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {results.maintenance.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleNavigate(`/maintenance/${m.id}`)}
                      className="w-full text-left p-2 rounded-lg hover:bg-amber-50/50 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-100/60 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                          <Wrench size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-amber-700 transition-colors">
                            <span className="font-mono text-amber-700 font-bold mr-1">
                              {m.ticketNumber}
                            </span>
                            — {m.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            <span className="font-medium text-slate-700">Asset:</span> {m.assetName}
                            <span className="mx-1">•</span>
                            <span className="truncate">{m.employeeName}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={m.status.toLowerCase()} />
                        <ArrowRight
                          size={14}
                          className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-amber-600 transition-all -translate-x-1 group-hover:translate-x-0"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
