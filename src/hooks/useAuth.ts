import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [user, setUser] = useState<any>(supabase.auth.user());
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function fetchProfile(u: any) {
      if (!u) return setProfile(null);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', u.id).single();
      if (error) {
        console.error('fetchProfile error', error);
        setProfile(null);
      } else {
        if (mounted) setProfile(data);
      }
    }

    fetchProfile(user).finally(() => { if (mounted) setLoading(false); });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      fetchProfile(session?.user);
    });

    return () => {
      mounted = false;
      sub?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Enforce account status
    if (!loading && profile) {
      if (profile.account_status === 'suspended' || profile.account_status === 'banned') {
        navigate('/suspended', { replace: true });
      }
    }
  }, [loading, profile, navigate]);

  return { user, profile, loading };
}
