import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ConsultaRegistros from '../pages/ConsultaRegistros'
import CadastroLoja from '../pages/CadastroLoja'
import Registro from '../pages/Registro'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/consulta" element={<ConsultaRegistros />} />
        <Route path="/cadastro-loja" element={<CadastroLoja />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  )
} 