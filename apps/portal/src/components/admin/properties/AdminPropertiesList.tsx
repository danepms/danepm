import React, { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { api } from '@/lib/api';
import { AdminPropertyCard } from './AdminPropertyCard';

interface ListProps {
  adminId: string;
  filter: string;
  onNavigate: (view: 'detail', id: string) => void;
}

export const AdminPropertiesList = ({ adminId, filter, onNavigate }: ListProps) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const loadProperties = useCallback(async (pageNum: number, searchQuery: string) => {
    setIsLoading(true);
    const res = await api.get<any>(`/admin/properties?adminId=${adminId}&filter=${filter}&page=${pageNum}&search=${searchQuery}`);
    if (res.success) {
      setProperties(res.properties || []);
      setTotal(res.total || 0);
      setHasMore(res.hasMore || false);
    }
    setIsLoading(false);
  }, [adminId, filter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPage(1);
      loadProperties(1, search);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [search, filter, loadProperties]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadProperties(newPage, search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFilterTitle = () => {
    switch (filter) {
      case 'live': return 'Live Houses';
      case 'setup': return 'In Setup';
      case 'unowned': return 'Unowned Houses';
      default: return 'All Houses';
    }
  };

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Home className="text-[var(--admin-accent)]" /> {getFilterTitle()}
          </h2>
          <p className="text-sm text-[var(--text-muted)] font-mono">{total} records found</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl py-2 pl-10 pr-4 font-mono text-sm focus:border-[var(--admin-accent)] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[280px] bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[var(--bg-base)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border)] text-[var(--text-muted)]">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tighter mb-2">No houses found</h3>
          <p className="text-[var(--text-muted)] text-sm">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map(property => (
            <AdminPropertyCard 
              key={property.id} 
              property={property} 
              onClick={() => onNavigate('detail', property.id)} 
            />
          ))}
        </div>
      )}

      {total > 12 && (
        <div className="flex items-center justify-between bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
          <button 
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isLoading}
            className="p-2 border border-[var(--border)] rounded-lg hover:text-[var(--admin-accent)] hover:border-[var(--admin-accent)] transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-mono text-sm font-bold">
            Page {page}
          </span>
          <button 
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasMore || isLoading}
            className="p-2 border border-[var(--border)] rounded-lg hover:text-[var(--admin-accent)] hover:border-[var(--admin-accent)] transition-colors disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
