import React, { useState, useEffect } from 'react';
import { AdminPropertiesSummary } from './AdminPropertiesSummary';
import { AdminPropertiesList } from './AdminPropertiesList';
import { AdminPropertyDetail } from './AdminPropertyDetail';
import { useRouter } from 'next/navigation';

export const AdminPropertiesTab = ({ adminId }: { adminId: string }) => {
  const router = useRouter();
  
  // URL sync state
  const [view, setView] = useState<'summary' | 'list' | 'detail'>('summary');
  const [filter, setFilter] = useState<string>('live');
  const [propertyId, setPropertyId] = useState<string | null>(null);

  useEffect(() => {
    // Read from URL on mount
    const searchParams = new URLSearchParams(window.location.search);
    const urlFilter = searchParams.get('filter');
    const urlProperty = searchParams.get('property');

    if (urlProperty) {
      setView('detail');
      setPropertyId(urlProperty);
    } else if (urlFilter) {
      setView('list');
      setFilter(urlFilter);
    } else {
      setView('summary');
    }
  }, []);

  const updateUrl = (newView: string, newFilter?: string, newProperty?: string) => {
    const url = new URL(window.location.href);
    if (newView === 'summary') {
      url.searchParams.delete('filter');
      url.searchParams.delete('property');
    } else if (newView === 'list' && newFilter) {
      url.searchParams.set('filter', newFilter);
      url.searchParams.delete('property');
    } else if (newView === 'detail' && newProperty) {
      url.searchParams.set('property', newProperty);
      url.searchParams.delete('filter');
    }
    window.history.pushState({}, '', url);
  };

  const handleNavigate = (newView: 'summary' | 'list' | 'detail', idOrFilter?: string) => {
    setView(newView);
    if (newView === 'list' && idOrFilter) {
      setFilter(idOrFilter);
      updateUrl(newView, idOrFilter, undefined);
    } else if (newView === 'detail' && idOrFilter) {
      setPropertyId(idOrFilter);
      updateUrl(newView, undefined, idOrFilter);
    } else if (newView === 'summary') {
      updateUrl('summary');
    }
  };

  const navigateToPerson = (userId: string) => {
    // Navigate to the people tab with the user selected
    router.push(`/dashboard/admin/users?user=${userId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-24">
      <div className="mb-8">
        {view !== 'summary' && (
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
            <button onClick={() => handleNavigate('summary')} className="hover:text-[var(--admin-accent)] transition-colors">Houses</button>
            <span>/</span>
            {view === 'list' && <span className="text-[var(--text-base)]">{filter}</span>}
            {view === 'detail' && (
              <>
                <button onClick={() => handleNavigate('list', filter)} className="hover:text-[var(--admin-accent)] transition-colors">{filter}</button>
                <span>/</span>
                <span className="text-[var(--text-base)]">Detail</span>
              </>
            )}
          </div>
        )}
        
        {view === 'summary' && (
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Property Overview</h1>
            <p className="font-mono text-xs uppercase text-[var(--text-muted)] tracking-widest mt-2">Platform-wide asset intelligence</p>
          </div>
        )}
      </div>

      {view === 'summary' && <AdminPropertiesSummary adminId={adminId} onNavigate={handleNavigate} />}
      {view === 'list' && <AdminPropertiesList adminId={adminId} filter={filter} onNavigate={handleNavigate} />}
      {view === 'detail' && propertyId && (
        <AdminPropertyDetail 
          adminId={adminId} 
          propertyId={propertyId} 
          onBack={() => handleNavigate('list', filter)} 
          onNavigateToPerson={navigateToPerson}
        />
      )}
    </div>
  );
};
