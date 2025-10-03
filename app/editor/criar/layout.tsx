import { Suspense } from 'react';

export default function EditorCriarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="w-full pt-14 p-4 sm:p-6 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-300 mx-auto mb-4"></div>
          <p className="text-slate-200 text-lg">Carregando editor...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}
