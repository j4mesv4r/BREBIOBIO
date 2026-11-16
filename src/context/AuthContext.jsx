import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Obtener sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de estado (login, logout, OAuth)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId, reintentos = 5) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setLoading(false);
      } else if (reintentos > 0) {
        // Reintentar si el trigger de Supabase aún está creando el perfil de Google
        setTimeout(() => {
          fetchProfile(userId, reintentos - 1);
        }, 600);
      } else {
        // Si tras los reintentos no existe el perfil, intentamos crearlo manualmente al vuelo
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const nuevoPerfil = {
            id: currentUser.id,
            email: currentUser.email,
            nombre_completo: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Postulante Nuevo',
            rol: 'usuario',
            estado_validacion: 'pendiente'
          };
          await supabase.from('perfiles').upsert([nuevoPerfil]);
          setProfile(nuevoPerfil);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error obteniendo perfil:', error.message);
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);