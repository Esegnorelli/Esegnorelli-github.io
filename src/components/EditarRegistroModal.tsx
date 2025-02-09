import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';

interface Registro {
  id: number;
  loja: {
    id: number;
    nome: string;
  };
  data: string;
  faturamento: number;
  ticket_medio: number;
  total_clientes: number;
  clientes_novos: number;
  taxa_retencao: number;
  roi_marketing: number;
}

interface Props {
  registro: Registro | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (registro: Registro) => Promise<void>;
}

export default function EditarRegistroModal({ registro, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Registro | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (registro) {
      setFormData(registro);
    }
  }, [registro]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setSalvando(true);
      await onSave(formData);
      onClose();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Editar Registro</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket Médio
                </label>
                <input
                  type="number"
                  name="ticket_medio"
                  value={formData.ticket_medio}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total de Clientes
                </label>
                <input
                  type="number"
                  name="total_clientes"
                  value={formData.total_clientes}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clientes Novos
                </label>
                <input
                  type="number"
                  name="clientes_novos"
                  value={formData.clientes_novos}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Retenção (%)
                </label>
                <input
                  type="number"
                  name="taxa_retencao"
                  value={formData.taxa_retencao}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ROI Marketing (%)
                </label>
                <input
                  type="number"
                  name="roi_marketing"
                  value={formData.roi_marketing}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {salvando ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 