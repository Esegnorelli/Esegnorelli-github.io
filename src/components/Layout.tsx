import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loading from './Loading';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular tempo de carregamento mínimo
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast.error('Erro ao sair: ' + error.message);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onSignOut={handleSignOut} />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
} 