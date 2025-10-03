import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase.mjs';
import { useRouter } from 'next/navigation';
import { isAdminEmail } from '@/lib/adminConfig';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user ? isAdminEmail(user.email) : false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    user,
    loading,
    isAdmin,
    logout
  };
}

// Hook para proteger rotas que requerem autenticação
export function useRequireAuth(redirectTo: string = '/login') {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading, isAdmin };
}

// Hook para proteger rotas que requerem admin
export function useRequireAdmin(redirectTo: string = '/login') {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (!isAdmin) {
        router.push('/unauthorized'); // Redirecionar para página de acesso negado
      }
    }
  }, [user, loading, isAdmin, router, redirectTo]);

  return { user, loading, isAdmin };
}
