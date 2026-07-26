'use client';

import { useState, useMemo } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface PremiumTableProps<T extends { id?: number | string }> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDesc?: string;
  onExportCSV?: () => void;
  loading?: boolean;
  headerAction?: React.ReactNode;
}

export default function PremiumTable<T extends { id?: number | string }>({
  columns,
  data,
  searchPlaceholder = 'Search…',
  searchKeys = [],
  pageSize = 10,
  emptyIcon = '📭',
  emptyTitle = 'No data found',
  emptyDesc = 'Nothing to display at the moment.',
  onExportCSV,
  loading,
  headerAction,
}: PremiumTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter(row =>
      searchKeys.some(key => {
        const val = row[key];
        return String(val ?? '').toLowerCase().includes(term);
      })
    );
  }, [data, search, searchKeys]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String((a as any)[sortKey] ?? '').toLowerCase();
      const bv = String((b as any)[sortKey] ?? '').toLowerCase();
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="dash-table-wrap">
        <div style={{ padding: 24 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dash-table-wrap">
      {/* Table toolbar */}
      <div
        className="flex flex-col sm:flex-row gap-3 p-4"
        style={{ borderBottom: '1px solid var(--dash-border)' }}
      >
        {/* Search */}
        <div className="dash-topnav-search flex-1" style={{ minWidth: 0 }}>
          <span style={{ color: 'rgba(148,163,184,0.5)', fontSize: 14 }}>⌕</span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 13, width: '100%' }}
          />
          {search && (
            <button onClick={() => handleSearch('')} style={{ color: 'rgba(148,163,184,0.5)', fontSize: 14 }}>
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {headerAction}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="dash-btn dash-btn-secondary dash-btn-sm"
            >
              ↓ Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <div
        style={{
          padding: '8px 16px',
          fontSize: 12,
          color: 'rgba(148,163,184,0.5)',
          borderBottom: filtered.length ? 'none' : '1px solid var(--dash-border)',
        }}
      >
        {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        {search && <span> for &quot;<strong style={{ color: '#94a3b8' }}>{search}</strong>&quot;</span>}
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">{emptyIcon}</div>
          <p className="dash-empty-title">{emptyTitle}</p>
          <p className="dash-empty-desc">{emptyDesc}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="dash-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th
                    key={String(col.key)}
                    style={{ width: col.width }}
                    onClick={() => col.sortable !== false && handleSort(String(col.key))}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable !== false && (
                        <span style={{ fontSize: 10, opacity: 0.5 }}>
                          {sortKey === String(col.key)
                            ? sortDir === 'asc' ? '↑' : '↓'
                            : '⇅'}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, ri) => (
                <tr key={row.id ?? ri} className="animate-fade-up" style={{ animationDelay: `${ri * 0.03}s`, animationFillMode: 'both' }}>
                  {columns.map(col => (
                    <td key={String(col.key)}>
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between p-4"
          style={{ borderTop: '1px solid var(--dash-border)' }}
        >
          <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)' }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="dash-btn dash-btn-secondary dash-btn-sm"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5) {
                if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="dash-btn dash-btn-sm"
                  style={{
                    background: page === p ? 'rgba(99,102,241,0.2)' : 'var(--dash-surface-3)',
                    color: page === p ? '#a5b4fc' : '#94a3b8',
                    border: `1px solid ${page === p ? 'rgba(99,102,241,0.3)' : 'var(--dash-border-md)'}`,
                    minWidth: 32,
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="dash-btn dash-btn-secondary dash-btn-sm"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
