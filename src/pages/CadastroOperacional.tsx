import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { 
  FaSave, FaStore, FaCalendarAlt, 
  FaUsers, FaStar, FaClipboardCheck,
  FaSpinner, FaChartLine, FaExclamationTriangle, FaUserTie
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
  atendente_dia: string
  atendente_noite: string
  cozinha_dia: string
  cozinha_noite: string
  gerente: string
  erros_operacionais: string
  nota_ifood: string
  nota_google: string
  nota_consultoria: string
  pedidos_total: string
}

const formInicial: FormData = {
  loja_id: '',
  data_inicio: new Date().toISOString().split('T')[0],
  data_fim: new Date().toISOString().split('T')[0],
  atendente_dia: '',
  atendente_noite: '',
  cozinha_dia: '',
  cozinha_noite: '',
  gerente: '',
  erros_operacionais: '',
  nota_ifood: '',
  nota_google: '',
  nota_consultoria: '',
  pedidos_total: '',
}

export default function CadastroOperacional() {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [formData, setFormData] = useState<FormData>(formInicial)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarLojas()
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
      toast.error('Erro ao carregar lojas: ' + error.message)
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
      
      const { data: { user } } = await supabase.auth.getUser()

      // Validar nota consultoria (deve ser entre 0 e 100)
      const notaConsultoria = Number(formData.nota_consultoria);
      if (notaConsultoria < 0 || notaConsultoria > 100) {
        throw new Error('A nota da consultoria deve estar entre 0 e 100%');
      }

      const { error } = await supabase
        .from('operacional')
        .insert([{
          loja_id: Number(formData.loja_id),
          user_id: user?.id,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          atendente_dia: Number(formData.atendente_dia),
          atendente_noite: Number(formData.atendente_noite),
          cozinha_dia: Number(formData.cozinha_dia),
          cozinha_noite: Number(formData.cozinha_noite),
          gerente: Number(formData.gerente),
          erros_operacionais: Number(formData.erros_operacionais),
          nota_ifood: Number(formData.nota_ifood),
          nota_google: Number(formData.nota_google),
          nota_consultoria: Number(formData.nota_consultoria).toFixed(2)
        }])

      if (error) throw error

      toast.success('Dados operacionais registrados com sucesso!')
      setFormData(formInicial)
    } catch (error: any) {
      toast.error('Erro ao registrar dados: ' + error.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FaChartLine className="text-primary text-2xl" />
        <h1 className="text-2xl font-bold text-secondary">Registro Operacional</h1>
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

          {/* Segunda linha: Funcionários */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaUsers className="text-primary" />
                Atendente Dia
              </label>
              <input
                type="number"
                name="atendente_dia"
                value={formData.atendente_dia}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaUsers className="text-primary" />
                Atendente Noite
              </label>
              <input
                type="number"
                name="atendente_noite"
                value={formData.atendente_noite}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaUsers className="text-primary" />
                Cozinha Dia
              </label>
              <input
                type="number"
                name="cozinha_dia"
                value={formData.cozinha_dia}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaUsers className="text-primary" />
                Cozinha Noite
              </label>
              <input
                type="number"
                name="cozinha_noite"
                value={formData.cozinha_noite}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaUserTie className="text-primary" />
                Gerente
              </label>
              <input
                type="number"
                name="gerente"
                value={formData.gerente}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Terceira linha: Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaExclamationTriangle className="text-primary" />
                Erros Operacionais
              </label>
              <input
                type="number"
                name="erros_operacionais"
                value={formData.erros_operacionais}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaStar className="text-primary" />
                Nota Consultoria (%)
              </label>
              <input
                type="number"
                name="nota_consultoria"
                value={formData.nota_consultoria}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="0.01"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaStar className="text-primary" />
                Nota iFood
              </label>
              <input
                type="number"
                name="nota_ifood"
                value={formData.nota_ifood}
                onChange={handleChange}
                required
                min="0"
                max="5"
                step="0.1"
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
                <FaStar className="text-primary" />
                Nota Google
              </label>
              <input
                type="number"
                name="nota_google"
                value={formData.nota_google}
                onChange={handleChange}
                required
                min="0"
                max="5"
                step="0.1"
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
                Cadastrar Registro
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 