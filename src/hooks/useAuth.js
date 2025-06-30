import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../context/SupabaseContext';

export const useAuth = () => {
  const { client } = useSupabase();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user) => {
    if (!client || !user) {
      setProfile(null);
      return;
    }
    const { data, error } = await client
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } else {
      setProfile(data);
    }
  }, [client]);

  useEffect(() => {
    if (client) {
      setLoading(true);
      client.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user);
        } else {
          setProfile(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [client, fetchProfile]);

  return { session, profile, loadingAuth: loading, fetchProfile };
};