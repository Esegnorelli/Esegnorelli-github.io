import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import ConsultaRegistros from '../pages/ConsultaRegistros'

describe('ConsultaRegistros', () => {
  it('deve renderizar corretamente', () => {
    render(
      <BrowserRouter>
        <ConsultaRegistros />
      </BrowserRouter>
    )
    expect(screen.getByText('Consulta de Registros')).toBeInTheDocument()
  })
}) 