import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { 
  FaSave, FaStore, FaMapMarkerAlt, 
  FaPhone, FaUser, FaSpinner
} from 'react-icons/fa'

interface FormData {
  nome: string
  endereco: string
  telefone: string
  responsavel: string
}

const formInicial: FormData = {
  nome: '',
  endereco: '',
  telefone: '',
  responsavel: ''
}

export default function CadastroLoja() {
  const [formData, setFormData] = useState<FormData>(formInicial)
  const [salvando, setSalvando] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSalvando(true)
      
      const { error } = await supabase
        .from('lojas')
        .insert([{
          nome: formData.nome,
          endereco: formData.endereco,
          telefone: formData.telefone,
          responsavel: formData.responsavel
        }])

      if (error) throw error

      toast.success('Loja cadastrada com sucesso!')
      setFormData(formInicial)
    } catch (error: any) {
      toast.error('Erro ao cadastrar loja: ' + error.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FaStore className="text-primary text-2xl" />
        <h1 className="text-2xl font-bold text-secondary">Cadastro de Loja</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
              <FaStore className="text-primary" />
              Nome da Loja
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nome da loja"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
              <FaMapMarkerAlt className="text-primary" />
              Endereço
            </label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              required
              className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Endereço completo"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
              <FaPhone className="text-primary" />
              Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-secondary mb-1">
              <FaUser className="text-primary" />
              Responsável
            </label>
            <input
              type="text"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleChange}
              required
              className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nome do responsável"
            />
          </div>
        </div>

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
                Cadastrar Loja
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 