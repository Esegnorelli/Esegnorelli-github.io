import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Dashboard } from '../types'
import { FaSpinner } from 'react-icons/fa'

interface Props {
  registro: Dashboard | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function EditarKPIModal({ registro, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<Dashboard>>({})
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (registro) {
      setFormData(registro)
    }
  }, [registro])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSalvando(true)
      const { error } = await supabase
        .from('dashboard')
        .update(formData)
        .eq('id', registro?.id)

      if (error) throw error

      onSave()
    } catch (error: any) {
      console.error('Erro ao atualizar registro:', error)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Editar Registro</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Adicione os campos do formulário aqui */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faturamento
                </label>
                <input
                  type="number"
                  name="faturamento"
                  value={formData.faturamento}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              {/* Adicione os outros campos seguindo o mesmo padrão */}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {salvando ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 