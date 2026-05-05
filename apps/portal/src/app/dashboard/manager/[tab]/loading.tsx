export default function DashboardLoading() {
  return (
    <div className="h-full flex items-center justify-center py-32 animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="w-48 h-1 bg-[var(--border)] bg-opacity-10 rounded-full loading-bar" />
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-50">
          Loading...
        </p>
      </div>
    </div>
  );
}
