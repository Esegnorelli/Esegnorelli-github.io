import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaStore, 
  FaClipboardList, 
  FaChartBar,
  FaSignOutAlt,
  FaChartLine,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaUsers
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logoImg from '../assets/logo.png';

interface SidebarProps {
  onSignOut: () => void;
}

export default function Sidebar({ onSignOut }: SidebarProps) {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao fazer logout: ' + error.message);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
      <div className="p-6">
        <div className="flex justify-center mb-8">
          <img src={logoImg} alt="Logo" className="h-12" />
        </div>

        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-primary text-white'
                : 'text-secondary hover:bg-gray-100'
            }`}
          >
            <FaTachometerAlt />
            Dashboard
          </Link>

          {/* Departamentos */}
          <li className="pt-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Departamentos
            </span>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  to="/cadastro-analista"
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    isActive('/cadastro-analista')
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:bg-gray-100'
                  }`}
                >
                  <FaChartLine />
                  Analista
                </Link>
              </li>
              <li>
                <Link
                  to="/marketing"
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    isActive('/marketing')
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:bg-gray-100'
                  }`}
                >
                  <FaMoneyBillWave />
                  Marketing
                </Link>
              </li>
              <li>
                <Link
                  to="/operacional"
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    isActive('/operacional')
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:bg-gray-100'
                  }`}
                >
                  <FaClipboardCheck />
                  Operacional
                </Link>
              </li>
            </ul>
          </li>

          {/* Cadastros e Consultas */}
          <li className="pt-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Gestão
            </span>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  to="/cadastro-loja"
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    isActive('/cadastro-loja')
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:bg-gray-100'
                  }`}
                >
                  <FaStore />
                  Cadastro de Loja
                </Link>
              </li>
              <li>
                <Link
                  to="/consulta"
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    isActive('/consulta')
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:bg-gray-100'
                  }`}
                >
                  <FaChartBar />
                  Consulta Registros
                </Link>
              </li>
            </ul>
          </li>

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-8"
          >
            <FaSignOutAlt />
            Sair
          </button>
        </nav>
      </div>
    </div>
  );
} 