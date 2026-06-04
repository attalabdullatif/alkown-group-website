import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserRole } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUserRole(session) {
    if (!session?.user) {
      setUser(null);
      setRole(null);
      return;
    }
    setUser(session.user);
    try {
      const roleData = await getUserRole(session.user.id);
      setRole(roleData?.role ?? null);
    } catch {
      setRole(null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      loadUserRole(data.session).finally(() => setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserRole(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useRequireRole(allowed) {
  const { role } = useAuth();
  if (!allowed) return true;
  return allowed.includes(role);
}
