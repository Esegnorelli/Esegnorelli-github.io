import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'

describe('Dashboard', () => {
  it('deve renderizar corretamente', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
}) 