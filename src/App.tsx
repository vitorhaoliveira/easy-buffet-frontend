import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import Dashboard from './pages/dashboard/Dashboard'
import './index.css'
import ClientesList from './pages/register/clients/ClientList'
import ClienteForm from './pages/register/clients/ClientForm'
import PacotesList from './pages/register/packages/PackageList'
import PacoteForm from './pages/register/packages/PackageForm'
import EventosList from './pages/register/events/EventsList'
import EventoForm from './pages/register/events/EventsForm'
import UsuariosList from './pages/register/users/UserList'
import UserForm from './pages/register/users/UserForm'
import ContractsList from './pages/register/contracts/ContractsList'
import ContractForm from './pages/register/contracts/ContractForm'
import ContractDetail from './pages/register/contracts/ContractDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path='/' element={<Dashboard />} />
          
          {/* Rotas de Clientes */}
          <Route path='/cadastros/clientes' element={<ClientesList />} />
          <Route path='/cadastros/clientes/novo' element={<ClienteForm />} />
          <Route path='/cadastros/clientes/editar/:id' element={<ClienteForm />} />
          
          {/* Rotas de Pacotes */}
          <Route path='/cadastros/pacotes' element={<PacotesList />} />
          <Route path='/cadastros/pacotes/novo' element={<PacoteForm />} />
          <Route path='/cadastros/pacotes/editar/:id' element={<PacoteForm />} />
          
          {/* Rotas de Eventos */}
          <Route path='/cadastros/eventos' element={<EventosList />} />
          <Route path='/cadastros/eventos/novo' element={<EventoForm />} />
          <Route path='/cadastros/eventos/editar/:id' element={<EventoForm />} />
          
          {/* Rotas de Usuários */}
          <Route path='/cadastros/usuarios' element={<UsuariosList />} />
          <Route path='/cadastros/usuarios/novo' element={<UserForm />} />
          <Route path='/cadastros/usuarios/editar/:id' element={<UserForm />} />
          
          {/* Rotas de Contratos */}
          <Route path='/cadastros/contratos' element={<ContractsList />} />
          <Route path='/cadastros/contratos/novo' element={<ContractForm />} />
          <Route path='/cadastros/contratos/editar/:id' element={<ContractForm />} />
          <Route path='/cadastros/contratos/visualizar/:id' element={<ContractDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
