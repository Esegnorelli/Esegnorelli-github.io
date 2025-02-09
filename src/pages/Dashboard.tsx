import React, { useState, useEffect } from 'react';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaMoneyBillWave, 
  FaShoppingCart,
  FaChartLine,
  FaPercentage,
  FaCalendarAlt,
  FaStar,
  FaStore,
  FaSpinner,
  FaBullhorn
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Loja {
  id: number;
  nome: string;
}

interface AnalistaData {
  id: number;
  loja_id: number;
  data_inicio: string;
  data_fim: string;
  faturamento: number;
  ticket_medio: number;
  total_clientes: number;
  clientes_enriquecer: number;
  clientes_novos: number;
  taxa_retencao: number;
  taxa_recompra_1_2: number;
  taxa_recompra_2_3: number;
  taxa_recompra_3_4: number;
  taxa_recompra_4_5: number;
}

interface MarketingData {
  id: number;
  loja_id: number;
  data_inicio: string;
  data_fim: string;
  investimento: number;
  descricao: string;
}

interface DashboardData {
  faturamentoTotal: number;
  ticketMedio: number;
  totalClientes: number;
  clientesRecorrentes: number;
  clientesNovos: number;
  taxaRetencao: number;
  clientesEnriquecer: number;
  investimentoMarketing: number;
  avaliacaoMedia: number;
  taxasRecompra: {
    taxa_1_2: number;
    taxa_2_3: number;
    taxa_3_4: number;
    taxa_4_5: number;
  };
  evolucaoFaturamento: Array<{
    data: string;
    valor: number;
  }>;
  evolucaoRecompra: Array<{
    data: string;
    taxa: number;
  }>;
  dadosOperacionais: {
    atendenteDia: number;
    atendenteNoite: number;
    cozinhaDia: number;
    cozinhaNoite: number;
    gerente: number;
    errosOperacionais: number;
    notaIfood: number;
    notaGoogle: number;
    notaConsultoria: number;
  };
}

const CORES = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

const formInicial: DashboardData = {
  faturamentoTotal: 0,
  ticketMedio: 0,
  totalClientes: 0,
  clientesRecorrentes: 0,
  clientesNovos: 0,
  taxaRetencao: 0,
  clientesEnriquecer: 0,
  investimentoMarketing: 0,
  avaliacaoMedia: 0,
  taxasRecompra: {
    taxa_1_2: 0,
    taxa_2_3: 0,
    taxa_3_4: 0,
    taxa_4_5: 0
  },
  evolucaoFaturamento: [],
  evolucaoRecompra: [],
  dadosOperacionais: {
    atendenteDia: 0,
    atendenteNoite: 0,
    cozinhaDia: 0,
    cozinhaNoite: 0,
    gerente: 0,
    errosOperacionais: 0,
    notaIfood: 0,
    notaGoogle: 0,
    notaConsultoria: 0
  }
};

export default function Dashboard() {
  // Função auxiliar para pegar o primeiro e último dia do mês atual
  const getDatasPadrao = () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    return {
      dataInicial: primeiroDia.toISOString().split('T')[0],
      dataFinal: ultimoDia.toISOString().split('T')[0]
    };
  };

  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    loja: '',
    ...getDatasPadrao() // Usar datas padrão em vez de data atual
  });
  const [dashboardData, setDashboardData] = useState<DashboardData>(formInicial);

  useEffect(() => {
    const loadData = async () => {
      await carregarLojas();
      await carregarDados();
    };
    loadData();
  }, [filtros.loja, filtros.dataInicial, filtros.dataFinal]);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validar datas antes de atualizar o estado
    if ((name === 'dataInicial' || name === 'dataFinal') && !value) {
      const datasPadrao = getDatasPadrao();
      setFiltros(prev => ({ 
        ...prev, 
        [name]: name === 'dataInicial' ? datasPadrao.dataInicial : datasPadrao.dataFinal 
      }));
      return;
    }

    // Atualizar estado com novo valor
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const carregarLojas = async () => {
    try {
      // Verificar conexão antes de fazer a requisição
      if (!navigator.onLine) {
        throw new Error('Sem conexão com a internet');
      }

      const { data, error } = await supabase
        .from('lojas')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setLojas(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar lojas: ' + error.message);
      // Tentar novamente após 5 segundos em caso de erro de conexão
      if (!navigator.onLine) {
        setTimeout(carregarLojas, 5000);
      }
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      setDashboardData(formInicial);

      // Verificar conexão antes de fazer a requisição
      if (!navigator.onLine) {
        throw new Error('Sem conexão com a internet');
      }

      // Validar datas antes da consulta
      if (!filtros.dataInicial || !filtros.dataFinal) {
        const datasPadrao = getDatasPadrao();
        setFiltros(prev => ({
          ...prev,
          dataInicial: datasPadrao.dataInicial,
          dataFinal: datasPadrao.dataFinal
        }));
        return;
      }

      // Carregar dados analíticos com retry em caso de falha
      const carregarDadosComRetry = async (tentativas = 3) => {
        try {
          let query = supabase
            .from('dashboard')
            .select(`
              id,
              loja_id,
              data_inicio,
              data_fim,
              faturamento,
              ticket_medio,
              total_clientes,
              clientes_enriquecer,
              clientes_novos,
              taxa_retencao,
              taxa_recompra_1_2,
              taxa_recompra_2_3,
              taxa_recompra_3_4,
              taxa_recompra_4_5
            `)
            .gte('data_inicio', filtros.dataInicial)
            .lte('data_fim', filtros.dataFinal)
            .order('data_inicio', { ascending: true });

          if (filtros.loja) {
            query = query.eq('loja_id', parseInt(filtros.loja));
          }

          const { data, error } = await query;
          
          if (error) throw error;
          return data;
        } catch (error) {
          if (tentativas > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return carregarDadosComRetry(tentativas - 1);
          }
          throw error;
        }
      };

      const analistaData = await carregarDadosComRetry();

      // Gerar array de datas entre data inicial e final
      const gerarDatasIntervalo = (dataInicio: string, dataFim: string) => {
        const datas = [];
        const dataAtual = new Date(dataInicio);
        const dataFinal = new Date(dataFim);

        while (dataAtual <= dataFinal) {
          datas.push(new Date(dataAtual));
          dataAtual.setDate(dataAtual.getDate() + 1);
        }

        return datas;
      };

      // Processar dados apenas se houver resultados
      if (analistaData && analistaData.length > 0) {
        // Pegar o registro mais recente para os dados de clientes
        const registroRecente = analistaData[analistaData.length - 1];
        
        const faturamentoTotal = analistaData.reduce((sum, item) => sum + Number(item.faturamento), 0);
        
        // Usar os valores do registro mais recente em vez de somar todos
        const totalClientes = Number(registroRecente.total_clientes);
        const clientesNovos = Number(registroRecente.clientes_novos);
        const clientesEnriquecer = Number(registroRecente.clientes_enriquecer);
        const clientesRecorrentes = totalClientes - clientesNovos - clientesEnriquecer;
        
        // Corrigir cálculo do ticket médio
        const ticketMedio = analistaData.reduce((sum, item) => sum + Number(item.ticket_medio), 0) / analistaData.length;
        
        const taxaRetencao = analistaData.reduce((sum, item) => sum + Number(item.taxa_retencao), 0) / analistaData.length;

        // Calcular evolução do faturamento com datas completas
        const datasIntervalo = gerarDatasIntervalo(filtros.dataInicial, filtros.dataFinal);
        const evolucaoFaturamento = datasIntervalo.map(data => {
          const registroDoDia = analistaData.find(item => 
            new Date(item.data_inicio).toISOString().split('T')[0] === data.toISOString().split('T')[0]
          );

          return {
            data: data.toLocaleDateString('pt-BR'),
            valor: registroDoDia ? Number(registroDoDia.faturamento) : 0
          };
        });

        // Calcular médias das taxas de recompra
        const taxasRecompra = {
          taxa_1_2: analistaData.reduce((sum, item) => sum + Number(item.taxa_recompra_1_2), 0) / analistaData.length,
          taxa_2_3: analistaData.reduce((sum, item) => sum + Number(item.taxa_recompra_2_3), 0) / analistaData.length,
          taxa_3_4: analistaData.reduce((sum, item) => sum + Number(item.taxa_recompra_3_4), 0) / analistaData.length,
          taxa_4_5: analistaData.reduce((sum, item) => sum + Number(item.taxa_recompra_4_5), 0) / analistaData.length
        };

        // Carregar dados de marketing
        let queryMarketing = supabase
          .from('marketing')
          .select('investimento')
          .gte('data_inicio', filtros.dataInicial)
          .lte('data_fim', filtros.dataFinal);

        if (filtros.loja) {
          queryMarketing = queryMarketing.eq('loja_id', parseInt(filtros.loja));
        }

        const { data: marketingData, error: marketingError } = await queryMarketing;

        if (marketingError) throw marketingError;

        const investimentoMarketing = marketingData?.reduce((sum, item) => 
          sum + Number(item.investimento), 0) || 0;

        // Carregar dados operacionais
        let queryOperacional = supabase
          .from('operacional')
          .select(`
            atendente_dia,
            atendente_noite,
            cozinha_dia,
            cozinha_noite,
            gerente,
            erros_operacionais,
            nota_ifood,
            nota_google,
            nota_consultoria
          `)
          .gte('data_inicio', filtros.dataInicial)
          .lte('data_fim', filtros.dataFinal);

        if (filtros.loja) {
          queryOperacional = queryOperacional.eq('loja_id', parseInt(filtros.loja));
        }

        const { data: operacionalData, error: operacionalError } = await queryOperacional;

        if (operacionalError) throw operacionalError;

        // Calcular médias dos dados operacionais
        const dadosOperacionais = operacionalData?.length ? {
          atendenteDia: operacionalData.reduce((sum, item) => sum + Number(item.atendente_dia), 0) / operacionalData.length,
          atendenteNoite: operacionalData.reduce((sum, item) => sum + Number(item.atendente_noite), 0) / operacionalData.length,
          cozinhaDia: operacionalData.reduce((sum, item) => sum + Number(item.cozinha_dia), 0) / operacionalData.length,
          cozinhaNoite: operacionalData.reduce((sum, item) => sum + Number(item.cozinha_noite), 0) / operacionalData.length,
          gerente: operacionalData.reduce((sum, item) => sum + Number(item.gerente), 0) / operacionalData.length,
          errosOperacionais: operacionalData.reduce((sum, item) => sum + Number(item.erros_operacionais), 0) / operacionalData.length,
          notaIfood: operacionalData.reduce((sum, item) => sum + Number(item.nota_ifood), 0) / operacionalData.length,
          notaGoogle: operacionalData.reduce((sum, item) => sum + Number(item.nota_google), 0) / operacionalData.length,
          notaConsultoria: operacionalData.reduce((sum, item) => sum + Number(item.nota_consultoria), 0) / operacionalData.length
        } : {
          atendenteDia: 0,
          atendenteNoite: 0,
          cozinhaDia: 0,
          cozinhaNoite: 0,
          gerente: 0,
          errosOperacionais: 0,
          notaIfood: 0,
          notaGoogle: 0,
          notaConsultoria: 0
        };

        setDashboardData({
          faturamentoTotal,
          ticketMedio,
          totalClientes,
          clientesRecorrentes,
          clientesNovos,
          taxaRetencao,
          clientesEnriquecer,
          investimentoMarketing,
          avaliacaoMedia: 0,
          taxasRecompra,
          evolucaoFaturamento,
          evolucaoRecompra: [],
          dadosOperacionais
        });
      }

    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message);
      setDashboardData(formInicial);
      
      // Tentar novamente após 5 segundos em caso de erro de conexão
      if (!navigator.onLine) {
        setTimeout(carregarDados, 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Adicionar listener para mudanças no estado da conexão
  useEffect(() => {
    const handleOnline = () => {
      toast.success('Conexão restabelecida');
      carregarDados();
    };

    const handleOffline = () => {
      toast.error('Sem conexão com a internet');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaTachometerAlt className="text-primary text-3xl" />
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        </div>
        
        {/* Filtros */}
        <div className="flex gap-4">
          <select
            name="loja"
            value={filtros.loja}
            onChange={handleFiltroChange}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todas as Lojas</option>
            {lojas.map(loja => (
              <option key={loja.id} value={loja.id}>{loja.nome}</option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <input
              type="date"
              name="dataInicial"
              value={filtros.dataInicial}
              onChange={handleFiltroChange}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="date"
              name="dataFinal"
              value={filtros.dataFinal}
              onChange={handleFiltroChange}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <FaSpinner className="animate-spin text-primary text-4xl" />
        </div>
      ) : (
        <>
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <MetricCard
              title="Faturamento Total"
              value={formatarMoeda(dashboardData.faturamentoTotal)}
              icon={<FaMoneyBillWave />}
              trend={10}
            />
            <MetricCard
              title="Ticket Médio"
              value={formatarMoeda(dashboardData.ticketMedio)}
              icon={<FaShoppingCart />}
              trend={5}
            />
            <MetricCard
              title="Total de Clientes"
              value={dashboardData.totalClientes}
              icon={<FaUsers />}
              trend={15}
            />
            <MetricCard
              title="Taxa de Retenção"
              value={`${dashboardData.taxaRetencao.toFixed(1)}%`}
              icon={<FaChartLine />}
              trend={-2}
            />
            <MetricCard
              title="Investimento Marketing"
              value={formatarMoeda(dashboardData.investimentoMarketing)}
              icon={<FaBullhorn />}
              trend={8}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição de Clientes */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Distribuição de Clientes</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { 
                        name: 'Novos', 
                        value: dashboardData.clientesNovos,
                        percentual: ((dashboardData.clientesNovos / dashboardData.totalClientes) * 100).toFixed(1)
                      },
                      { 
                        name: 'RFV',
                        value: dashboardData.clientesRecorrentes,
                        percentual: ((dashboardData.clientesRecorrentes / dashboardData.totalClientes) * 100).toFixed(1)
                      },
                      { 
                        name: 'Para Enriquecer', 
                        value: dashboardData.clientesEnriquecer,
                        percentual: ((dashboardData.clientesEnriquecer / dashboardData.totalClientes) * 100).toFixed(1)
                      }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                      percentual,
                      name
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = 25 + innerRadius + (outerRadius - innerRadius);
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#374151"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          className="text-xs"
                        >
                          {`${name}: ${value} (${percentual}%)`}
                        </text>
                      );
                    }}
                  >
                    {CORES.map((cor, index) => (
                      <Cell key={`cell-${index}`} fill={cor} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} (${props.payload.percentual}%)`,
                      name
                    ]}
                  />
                  <Legend 
                    formatter={(value, entry) => {
                      const { payload } = entry;
                      return `${value}: ${payload.value} (${payload.percentual}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Evolução do Faturamento */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Evolução do Faturamento</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.evolucaoFaturamento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="data"
                    interval="preserveStartEnd"
                    tickFormatter={(value) => value}
                    minTickGap={50}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatarMoeda(value)}
                  />
                  <Tooltip 
                    formatter={(value) => formatarMoeda(Number(value))}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    name="Faturamento"
                    dataKey="valor" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Evolução das Taxas de Recompra */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Evolução das Taxas de Recompra</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { nome: '1ª para 2ª', taxa: dashboardData.taxasRecompra.taxa_1_2 },
                  { nome: '2ª para 3ª', taxa: dashboardData.taxasRecompra.taxa_2_3 },
                  { nome: '3ª para 4ª', taxa: dashboardData.taxasRecompra.taxa_3_4 },
                  { nome: '4ª para 5ª', taxa: dashboardData.taxasRecompra.taxa_4_5 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="taxa" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ROI vs Investimento em Marketing */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">ROI vs Investimento em Marketing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <h3 className="text-sm text-gray-500 mb-2">Investimento em Marketing</h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatarMoeda(dashboardData.investimentoMarketing)}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-500 mb-2">ROI Novos Clientes</h3>
                  <p className="text-2xl font-bold text-green-500">
                    {formatarMoeda(dashboardData.clientesNovos * dashboardData.ticketMedio)}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-500 mb-2">ROI Atual</h3>
                  <p className="text-2xl font-bold text-green-500">
                    {((dashboardData.faturamentoTotal / 
                      (dashboardData.investimentoMarketing || 1) - 1) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-500 mb-2">ROI Projetado (Anual)</h3>
                  <p className="text-2xl font-bold text-green-500">
                    {formatarMoeda(
                      dashboardData.investimentoMarketing + 
                      (dashboardData.taxaRetencao / 100 * dashboardData.faturamentoTotal) * 12
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dashboardData.evolucaoFaturamento}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        name="Faturamento"
                        dataKey="valor" 
                        stroke="#10B981" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Dados Operacionais */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Dados Operacionais</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <h3 className="text-sm text-gray-500 mb-2">Atendentes</h3>
                  <p className="text-lg">Dia: {dashboardData.dadosOperacionais.atendenteDia.toFixed(0)}</p>
                  <p className="text-lg">Noite: {dashboardData.dadosOperacionais.atendenteNoite.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-500 mb-2">Cozinha</h3>
                  <p className="text-lg">Dia: {dashboardData.dadosOperacionais.cozinhaDia.toFixed(0)}</p>
                  <p className="text-lg">Noite: {dashboardData.dadosOperacionais.cozinhaNoite.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-500 mb-2">Gerente</h3>
                  <p className="text-lg">{dashboardData.dadosOperacionais.gerente.toFixed(0)}</p>
                </div>
                <div className="text-center col-span-3">
                  <h3 className="text-sm text-gray-500 mb-2">Erros Operacionais</h3>
                  <p className="text-xl font-bold text-red-500">
                    {dashboardData.dadosOperacionais.errosOperacionais.toFixed(0)}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-500 mb-2">Nota iFood</h3>
                  <p className="text-lg font-semibold">
                    {dashboardData.dadosOperacionais.notaIfood.toFixed(1)}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-500 mb-2">Nota Google</h3>
                  <p className="text-lg font-semibold">
                    {dashboardData.dadosOperacionais.notaGoogle.toFixed(1)}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-500 mb-2">Nota Consultoria</h3>
                  <p className="text-lg font-semibold">
                    {dashboardData.dadosOperacionais.notaConsultoria.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Componente de Card de Métrica
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
}

function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 font-medium">{title}</h3>
        <div className="text-primary opacity-80 text-xl">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className={`flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      </div>
    </div>
  );
}
