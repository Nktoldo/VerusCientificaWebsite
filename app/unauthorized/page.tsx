'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Acesso Negado</h1>
          <p className="text-slate-300 mb-6">
            Você não tem permissão para acessar esta área. Apenas administradores podem acessar o painel de edição.
          </p>
        </div>

        <div className="space-y-4">
          {user && (
            <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-slate-300 text-sm mb-2">
                Logado como: <span className="font-medium text-blue-400">{user.email}</span>
              </p>
              <p className="text-slate-400 text-xs">
                Este email não está na lista de administradores autorizados.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Voltar ao Site
            </button>
            
            {user && (
              <button
                onClick={logout}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition"
              >
                Fazer Logout
              </button>
            )}
            
            {!user && (
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                Fazer Login
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-500">
          <p>Se você acredita que deveria ter acesso, entre em contato com o administrador.</p>
        </div>
      </div>
    </div>
  );
}
