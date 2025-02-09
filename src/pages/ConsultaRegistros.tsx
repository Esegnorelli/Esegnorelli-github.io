import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { 
  FaChartBar, FaSearch, FaEdit, FaTrash, 
  FaSpinner, FaCalendarAlt, FaFilter 
} from 'react-icons/fa'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import EditarRegistroModal from '../components/EditarRegistroModal'
import { Session } from '@supabase/supabase-js'

interface Loja {
  id: number
  nome: string
}

interface BaseRegistro {
  id: number
  loja: {
    id: number
    nome: string
  }
  data: string
}

interface RegistroKPI extends BaseRegistro {
  tipo: 'kpi'
  data_inicio: string
  data_fim: string
  faturamento: number
  ticket_medio: number
  total_clientes: number
  clientes_enriquecer: number
  clientes_novos: number
  taxa_retencao: number
  taxa_recompra_1_2: number
  taxa_recompra_2_3: number
  taxa_recompra_3_4: number
  taxa_recompra_4_5: number
}

interface RegistroMarketing extends BaseRegistro {
  tipo: 'marketing'
  data_inicio: string
  data_fim: string
  investimento: number
  descricao: string
}

interface RegistroOperacional extends BaseRegistro {
  tipo: 'operacional'
  data_inicio: string
  data_fim: string
  atendente_dia: number
  atendente_noite: number
  cozinha_dia: number
  cozinha_noite: number
  gerente: number
  total_funcionarios: number
  nota_ifood: number
  nota_google: number
  nota_consultoria: number
  erros_operacionais: number
  media_avaliacoes: number
}

type Registro = RegistroKPI | RegistroMarketing | RegistroOperacional

interface Error {
  message: string
}

export default function ConsultaRegistros() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [lojas, setLojas] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    loja: '',
    dataInicial: '',
    dataFinal: '',
    tipo: ''
  })
  const [registroParaEditar, setRegistroParaEditar] = useState<Registro | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [filtros])

  const carregarDados = async () => {
    try {
      setLoading(true)

      // Primeiro, carregar lojas
      const { data: lojas, error: lojasError } = await supabase
        .from('lojas')
        .select('id, nome')
        .order('nome')

      if (lojasError) throw new Error('Erro ao carregar lojas: ' + lojasError.message)
      setLojas(lojas || [])

      // Preparar query base para Analista (antiga KPI)
      let queryAnalista = supabase
        .from('dashboard')
        .select(`
          id,
          loja:loja_id(id, nome),
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

      // Preparar query base para Marketing
      let queryMarketing = supabase
        .from('marketing')
        .select(`
          id,
          loja:loja_id(id, nome),
          data_inicio,
          data_fim,
          investimento,
          descricao
        `)

      // Preparar query base para Operacional
      let queryOperacional = supabase
        .from('operacional')
        .select(`
          id,
          loja:loja_id(id, nome),
          data_inicio,
          data_fim,
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

      // Aplicar filtros
      if (filtros.loja) {
        queryAnalista = queryAnalista.eq('loja_id', filtros.loja)
        queryMarketing = queryMarketing.eq('loja_id', filtros.loja)
        queryOperacional = queryOperacional.eq('loja_id', filtros.loja)
      }

      if (filtros.dataInicial) {
        queryAnalista = queryAnalista.gte('data_inicio', filtros.dataInicial)
        queryMarketing = queryMarketing.gte('data_inicio', filtros.dataInicial)
        queryOperacional = queryOperacional.gte('data_inicio', filtros.dataInicial)
      }

      if (filtros.dataFinal) {
        queryAnalista = queryAnalista.lte('data_fim', filtros.dataFinal)
        queryMarketing = queryMarketing.lte('data_fim', filtros.dataFinal)
        queryOperacional = queryOperacional.lte('data_fim', filtros.dataFinal)
      }

      // Executar as queries
      const [analistaResult, marketingResult, operacionalResult] = await Promise.all([
        queryAnalista,
        queryMarketing,
        queryOperacional
      ])

      if (analistaResult.error) throw new Error('Erro ao carregar Análise: ' + analistaResult.error.message)
      if (marketingResult.error) throw new Error('Erro ao carregar Marketing: ' + marketingResult.error.message)
      if (operacionalResult.error) throw new Error('Erro ao carregar Operacional: ' + operacionalResult.error.message)

      // Processar os resultados
      const todosRegistros = [
        ...(analistaResult.data || []).map(k => ({ 
          ...k, 
          tipo: 'kpi' as const,
          data: k.data_inicio // Usar data_inicio como data para exibição
        })),
        ...(marketingResult.data || []).map(m => ({ 
          ...m, 
          tipo: 'marketing' as const,
          data: m.data_inicio 
        })),
        ...(operacionalResult.data || []).map(o => ({ 
          ...o, 
          tipo: 'operacional' as const,
          data: o.data_inicio,
          media_avaliacoes: (Number(o.nota_ifood) + Number(o.nota_google) + Number(o.nota_consultoria)) / 3 
        }))
      ]

      setRegistros(todosRegistros)
    } catch (error: any) {
      console.error('Erro detalhado:', error)
      toast.error('Erro ao carregar registros: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const registrosFiltrados = registros.filter(registro => {
    if (filtros.tipo !== '' && registro.tipo !== filtros.tipo) {
      return false
    }
    return true
  })

  const renderColunas = (registro: Registro) => {
    if (registro.tipo === 'kpi') {
      return (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.loja.nome}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatarData(registro.data_inicio)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatarData(registro.data_fim)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatarMoeda(registro.faturamento)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatarMoeda(registro.ticket_medio)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.total_clientes}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.clientes_enriquecer}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.clientes_novos}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.taxa_retencao}%
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.taxa_recompra_1_2}%
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.taxa_recompra_2_3}%
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.taxa_recompra_3_4}%
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.taxa_recompra_4_5}%
          </td>
        </>
      )
    }

    if (registro.tipo === 'marketing') {
      return (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.loja.nome}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatarMoeda(registro.investimento)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatarData(registro.data_inicio)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatarData(registro.data_fim)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {registro.descricao}
          </td>
        </>
      )
    }

    // Operacional
    return (
      <>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {registro.loja.nome}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatarData(registro.data_inicio)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatarData(registro.data_fim)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {registro.atendente_dia}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {registro.atendente_noite}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {registro.cozinha_dia}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {registro.cozinha_noite}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {registro.gerente}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {registro.erros_operacionais}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {registro.nota_ifood}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {registro.nota_google}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {registro.nota_consultoria}%
        </td>
      </>
    )
  }

  const handleExcluir = async (id: number, tipo: string) => {
    confirmAlert({
      title: 'Confirmar exclusão',
      message: 'Tem certeza que deseja excluir este registro?',
      buttons: [
        {
          label: 'Sim',
          onClick: async () => {
            try {
              const tabela = tipo === 'kpi' ? 'dashboard' : 
                            tipo === 'marketing' ? 'marketing' : 'operacional';
              
              const { error } = await supabase
                .from(tabela)
                .delete()
                .eq('id', id);

              if (error) throw error;

              toast.success('Registro excluído com sucesso!');
              carregarDados();
            } catch (error: any) {
              toast.error('Erro ao excluir registro: ' + error.message);
            }
          }
        },
        {
          label: 'Não',
          onClick: () => {}
        }
      ]
    });
  };

  const handleEditar = (registro: Registro) => {
    setRegistroParaEditar(registro)
    setModalAberto(true)
  }

  const handleSalvarEdicao = async (registroAtualizado: Registro) => {
    try {
      const tabela = registroAtualizado.tipo === 'kpi' ? 'dashboard' : 
                     registroAtualizado.tipo === 'marketing' ? 'marketing' : 'operacional';
      
      const { error } = await supabase
        .from(tabela)
        .update(registroAtualizado)
        .eq('id', registroAtualizado.id);

      if (error) throw error;

      toast.success('Registro atualizado com sucesso!');
      carregarDados();
    } catch (error: any) {
      toast.error('Erro ao atualizar registro: ' + error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FaChartBar className="text-primary text-2xl" />
        <h1 className="text-2xl font-bold text-secondary">Consulta de Registros</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaFilter className="text-primary" />
          Filtros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              <FaFilter className="inline mr-2" />
              Tipo de Registro
            </label>
            <select
              name="tipo"
              value={filtros.tipo}
              onChange={handleFiltroChange}
              className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Selecione o departamento</option>
              <option value="kpi">Analista</option>
              <option value="marketing">Marketing</option>
              <option value="operacional">Operacional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Loja
            </label>
            <select
              name="loja"
              value={filtros.loja}
              onChange={handleFiltroChange}
              className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todas as Lojas</option>
              {lojas.map(loja => (
                <option key={loja.id} value={loja.id}>{loja.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Data Inicial
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="dataInicial"
                value={filtros.dataInicial}
                onChange={handleFiltroChange}
                className="w-full pl-10 p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Data Final
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="dataFinal"
                value={filtros.dataFinal}
                onChange={handleFiltroChange}
                className="w-full pl-10 p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <FaSpinner className="animate-spin text-primary text-2xl" />
              <span className="ml-2 text-secondary">Carregando registros...</span>
            </div>
          ) : filtros.tipo === '' ? (
            <div className="flex items-center justify-center p-8 text-gray-500">
              Selecione um departamento para visualizar os registros
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {filtros.tipo === 'kpi' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Inicial</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Final</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faturamento (R$)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket Médio (R$)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total de Clientes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clientes para Enriquecer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clientes Novos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa de Retenção (%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa Recompra 1ª para 2ª (%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa de Recompra 2ª para 3ª (%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa de Recompra 3ª para 4ª (%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa de Recompra 4ª para 5ª (%)</th>
                    </>
                  )}
                  {filtros.tipo === 'marketing' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor do Investimento (R$)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Início</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Fim</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição da Campanha</th>
                    </>
                  )}
                  {filtros.tipo === 'operacional' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Início</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Fim</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atendente Dia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atendente Noite</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cozinha Dia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cozinha Noite</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gerente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Erros Operacionais</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota iFood</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota Google</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota Consultoria (%)</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrosFiltrados.map((registro) => (
                  <tr key={`${registro.tipo}-${registro.id}`} className="hover:bg-gray-50">
                    {renderColunas(registro)}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-primary hover:text-primary-dark mr-3"
                        onClick={() => handleEditar(registro)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleExcluir(registro.id, registro.tipo)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <EditarRegistroModal
        registro={registroParaEditar}
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false)
          setRegistroParaEditar(null)
        }}
        onSave={handleSalvarEdicao}
      />
    </div>
  )
} 