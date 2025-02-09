// App.tsx
import { useState, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import logoImg from './assets/logo.png';
import Dashboard from './pages/Dashboard';
import CadastroLoja from './pages/CadastroLoja';
import ConsultaRegistros from './pages/ConsultaRegistros';
import CadastroAnalista from './pages/cadastroanalista';
import CadastroMarketing from './pages/CadastroMarketing'
import CadastroOperacional from './pages/CadastroOperacional'
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Inicialize o cliente Supabase com as variáveis de ambiente definidas no Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Componente de Login separado para usar o useNavigate
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Ocorreu um erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all duration-300 ease-in-out hover:shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-32 h-32 mb-4 flex items-center justify-center">
            <img
              src={logoImg}
              alt="Logo Hora do Pastel"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 text-center">Bem-vindo</h2>
          <p className="text-gray-500 mt-2 text-center">Faça login para continuar</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </>
            ) : (
              <span className="flex items-center">
                Entrar
                <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </span>
            )}
          </button>

          {/* Feedback de sucesso */}
          {!error && loading && (
            <div className="mt-4 text-center animate-pulse">
              <p className="text-sm text-blue-600">Verificando suas credenciais...</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<LoginPage />} />
        
        {/* Rotas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastro-analista"
          element={
            <ProtectedRoute>
              <Layout>
                <CadastroAnalista />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastro-loja"
          element={
            <ProtectedRoute>
              <Layout>
                <CadastroLoja />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/consulta"
          element={
            <ProtectedRoute>
              <Layout>
                <ConsultaRegistros />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing"
          element={
            <ProtectedRoute>
              <Layout>
                <CadastroMarketing />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/operacional"
          element={
            <ProtectedRoute>
              <Layout>
                <CadastroOperacional />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
