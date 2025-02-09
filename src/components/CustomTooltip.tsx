import React from 'react'

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4">
      <p className="text-sm font-semibold text-secondary mb-2">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <span className="font-medium">{item.name}:</span>
          <span className="text-gray-600">
            {typeof item.value === 'number' 
              ? `R$ ${item.value.toLocaleString()}`
              : item.value}
          </span>
        </div>
      ))}
    </div>
  );
} 