import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { 
  FaSave, FaStore, FaCalendarAlt, 
  FaMoneyBillWave, FaSpinner, FaChartLine, FaClipboardList 
} from 'react-icons/fa'

interface Loja {
  id: number
  nome: string
}

interface FormData {
  loja_id: string
  data_inicio: string
  data_fim: string
  investimento: string
  descricao: string
}

const formInicial: FormData = {
  loja_id: '',
  data_inicio: new Date().toISOString().split('T')[0],
  data_fim: new Date().toISOString().split('T')[0],
  investimento: '',
  descricao: ''
}

export default function CadastroMarketing() {
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
  }, [])

  const carregarLojas = async () => {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .select('id, nome')
        .order('nome')

      if (error) throw error
      if (data) setLojas(data)
    } catch (error: any) {
      console.error('Erro ao carregar lojas:', error)
      toast.error('Erro ao carregar lojas: ' + error.message)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.loja_id) {
      toast.error('Selecione uma loja');
      return;
    }

    try {
      setSalvando(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Validar datas
      if (new Date(formData.data_fim) < new Date(formData.data_inicio)) {
        throw new Error('Data final não pode ser anterior à data inicial');
      }

      const { error } = await supabase
        .from('marketing') // Corrigido nome da tabela
        .insert([{
          loja_id: Number(formData.loja_id),
          user_id: user.id,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          investimento: Number(formData.investimento),
          descricao: formData.descricao
        }])

      if (error) throw error

      toast.success('Investimento registrado com sucesso!')
      setFormData(formInicial)
    } catch (error: any) {
      console.error('Erro completo:', error)
      toast.error('Erro ao registrar investimento: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FaChartLine className="text-primary text-2xl" />
        <h1 className="text-2xl font-bold text-secondary">Registro de Investimento em Marketing</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
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
                Data Início
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
                Data Fim
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

          {/* Segunda linha: Investimento e Descrição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaMoneyBillWave className="text-primary" />
                Valor do Investimento (R$)
              </label>
              <input
                type="number"
                name="investimento"
                value={formData.investimento}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaClipboardList className="text-primary" />
                Descrição da Campanha
              </label>
              <input
                type="text"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
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
                Cadastrar Investimento
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 