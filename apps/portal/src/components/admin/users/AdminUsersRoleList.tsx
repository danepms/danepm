"use client";

import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, UserX } from 'lucide-react';
import { AdminUserCard } from './AdminUserCard';
import { api } from '@/lib/api';

interface RoleListProps {
  adminId: string;
  role: string;
  onNavigateDetail: (userId: string) => void;
  onBack: () => void;
}

export const AdminUsersRoleList = ({ adminId, role, onNavigateDetail, onBack }: RoleListProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadUsers = async (pageNum: number, search: string) => {
    setIsLoading(true);
    const res = await api.get<any>(`/admin/users?adminId=${adminId}&role=${role}&page=${pageNum}&search=${search}`);
    if (res.success) {
      setUsers(res.users || []);
      setTotal(res.total || 0);
      setHasMore(res.hasMore || false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers(1, debouncedSearch);
    setPage(1);
  }, [role, debouncedSearch, adminId]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadUsers(newPage, debouncedSearch);
  };

  const roleTitle = role === 'manager' ? 'Managers' : 
                    role === 'owner' ? 'Owners' : 
                    role === 'admin' ? 'Admins' : 
                    role === 'suspended' ? 'Suspended Accounts' : 'All People';

  return (
    <div className="space-y-6 animate-reveal flex flex-col min-h-full">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            onClick={onBack}
            className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--admin-accent)] transition-colors mb-2 flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Back to Overview
          </button>
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            {roleTitle} <span className="text-sm font-mono font-normal text-[var(--text-muted)] bg-[var(--bg-base)] px-2 py-0.5 rounded-full border border-[var(--border)]">{total}</span>
          </h2>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[var(--admin-accent)] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-[var(--bg-base)] rounded-full flex items-center justify-center mb-4 text-[var(--text-muted)]">
            <UserX size={32} />
          </div>
          <h3 className="text-lg font-bold">No people found</h3>
          <p className="text-[var(--text-muted)] mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map(user => (
              <AdminUserCard 
                key={user.id} 
                user={user} 
                onClick={() => onNavigateDetail(user.id)} 
              />
            ))}
          </div>

          {/* Pagination */}
          {(page > 1 || hasMore) && (
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-6 mt-6">
              <span className="text-sm text-[var(--text-muted)]">
                Showing {((page - 1) * 12) + 1} to {Math.min(page * 12, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasMore}
                  className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
