import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { 
  FaSave, FaStore, FaCalendarAlt, FaMoneyBillWave, 
  FaShoppingCart, FaUsers, FaPercentage, FaChartLine,
  FaSpinner
} from 'react-icons/fa'
import { Session } from '@supabase/supabase-js'

interface Loja {
  id: number
  nome: string
}

interface FormData {
  loja_id: string
  data_inicio: string
  data_fim: string
  faturamento: string
  ticket_medio: string
  total_clientes: string
  clientes_enriquecer: string
  clientes_novos: string
  taxa_retencao: string
  taxa_recompra_1_2: string
  taxa_recompra_2_3: string
  taxa_recompra_3_4: string
  taxa_recompra_4_5: string
}

const formInicial: FormData = {
  loja_id: '',
  data_inicio: new Date().toISOString().split('T')[0],
  data_fim: new Date().toISOString().split('T')[0],
  faturamento: '',
  ticket_medio: '',
  total_clientes: '',
  clientes_enriquecer: '',
  clientes_novos: '',
  taxa_retencao: '',
  taxa_recompra_1_2: '',
  taxa_recompra_2_3: '',
  taxa_recompra_3_4: '',
  taxa_recompra_4_5: '',
}

export default function CadastroAnalista() {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [formData, setFormData] = useState<FormData>(formInicial)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        carregarLojas();
      } else {
        toast.error('Usuário não autenticado');
      }
    };
    
    checkAuth();
  }, []);

  const carregarLojas = async () => {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .select('id, nome')
        .order('nome')

      if (error) {
        console.error('Erro detalhado:', error)
        throw error
      }
      
      if (data) {
        console.log('Lojas carregadas:', data)
        setLojas(data)
      }
    } catch (error: any) {
      console.error('Erro completo:', error)
      toast.error('Erro ao carregar lojas: ' + (error.message || 'Erro desconhecido'))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSalvando(true)
      
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('dashboard')
        .insert([{
          loja_id: Number(formData.loja_id),
          user_id: user?.id,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          faturamento: Number(formData.faturamento),
          ticket_medio: Number(formData.ticket_medio),
          total_clientes: Number(formData.total_clientes),
          clientes_enriquecer: Number(formData.clientes_enriquecer),
          clientes_novos: Number(formData.clientes_novos),
          taxa_retencao: Number(formData.taxa_retencao),
          taxa_recompra_1_2: Number(formData.taxa_recompra_1_2),
          taxa_recompra_2_3: Number(formData.taxa_recompra_2_3),
          taxa_recompra_3_4: Number(formData.taxa_recompra_3_4),
          taxa_recompra_4_5: Number(formData.taxa_recompra_4_5)
        }])

      if (error) throw error

      toast.success('KPIs cadastrados com sucesso!')
      setFormData(formInicial)
    } catch (error: any) {
      toast.error('Erro ao cadastrar KPIs: ' + error.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FaChartLine className="text-primary text-2xl" />
        <h1 className="text-2xl font-bold text-secondary">Registro de Análise de Dados</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        {/* Grid principal */}
        <div className="space-y-6">
          {/* Primeira linha: Loja e Datas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaStore className="text-primary" />
                Loja
              </label>
              <select
                name="loja_id"
                value={formData.loja_id}
                onChange={handleChange}
                required
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecione uma loja</option>
                {lojas.map(loja => (
                  <option key={loja.id} value={loja.id}>{loja.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaCalendarAlt className="text-primary" />
                Data Inicial
              </label>
              <input
                type="date"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleChange}
                required
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaCalendarAlt className="text-primary" />
                Data Final
              </label>
              <input
                type="date"
                name="data_fim"
                value={formData.data_fim}
                onChange={handleChange}
                required
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Segunda linha: Faturamento e Ticket Médio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaMoneyBillWave className="text-primary" />
                Faturamento (R$)
              </label>
              <input
                type="number"
                name="faturamento"
                value={formData.faturamento}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaShoppingCart className="text-primary" />
                Ticket Médio (R$)
              </label>
              <input
                type="number"
                name="ticket_medio"
                value={formData.ticket_medio}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Terceira linha: Pedidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaUsers className="text-primary" />
                Total de Clientes
              </label>
              <input
                type="number"
                name="total_clientes"
                value={formData.total_clientes}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaUsers className="text-primary" />
                Clientes para Enriquecer
              </label>
              <input
                type="number"
                name="clientes_enriquecer"
                value={formData.clientes_enriquecer}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaUsers className="text-primary" />
                Clientes Novos
              </label>
              <input
                type="number"
                name="clientes_novos"
                value={formData.clientes_novos}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Quarta linha: Taxas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaPercentage className="text-primary" />
                Taxa de Retenção (%)
              </label>
              <input
                type="number"
                name="taxa_retencao"
                value={formData.taxa_retencao}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="0.01"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Taxas de Recompra */}
            {['1_2', '2_3', '3_4', '4_5'].map((taxa, index) => (
              <div key={taxa}>
                <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                  <FaPercentage className="text-primary" />
                  Taxa de Recompra {index + 1}ª para {index + 2}ª (%)
                </label>
                <input
                  type="number"
                  name={`taxa_recompra_${taxa}`}
                  value={formData[`taxa_recompra_${taxa}` as keyof FormData]}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Submit */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando ? (
              <>
                <FaSpinner className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <FaSave />
                Cadastrar Análise
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 