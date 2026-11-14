import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-4 w-4' }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

// Loading indicator for a section of a page
export function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <Spinner className="h-8 w-8 text-blue-600" />
      <p className="mt-3 text-sm">{text}</p>
    </div>
  );
}

// Loading indicator covering the whole screen (used while restoring the session)
export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <PageLoader />
    </div>
  );
}
