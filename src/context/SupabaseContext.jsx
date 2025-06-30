import React, { useState, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE SETUP ---
const supabaseUrl = 'https://hxrznwmxaazhnysmytwz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cnpud214YWF6aG55c215dHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODk2MzMsImV4cCI6MjA2NTg2NTYzM30.hYniWFKWz9cgVwkBIQw1slQ2POil44q5mmWVbGSXKw0';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  // 1. O cliente é criado apenas uma vez aqui. Não precisamos mais de `setClient`.
  const [client] = useState(() => 
    createClient(supabaseUrl, supabaseAnonKey)
  );
  
  // 2. O `useEffect` inteiro que carregava o script foi REMOVIDO.
  // 3. O estado de `loading` também não é mais necessário, pois o cliente está disponível imediatamente.

  return (
    // 4. Passamos apenas o `client` no value.
    <SupabaseContext.Provider value={{ client }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => useContext(SupabaseContext);