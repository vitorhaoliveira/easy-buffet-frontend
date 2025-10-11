import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, User, Shield, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import SearchBar from '@/components/ui/search-bar/SearchBar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/data-table/table'

// Mock data - substituir por dados reais da API
const mockUsuarios = [
  {
    id: 1,
    nome: 'Admin Sistema',
    email: 'admin@easybuffet.com',
    perfil: 'Administrador',
    status: 'Ativo',
    ultimoAcesso: '2024-01-15T10:30:00',
    dataCadastro: '2024-01-01'
  },
  {
    id: 2,
    nome: 'João Atendimento',
    email: 'joao@easybuffet.com',
    perfil: 'Atendimento',
    status: 'Ativo',
    ultimoAcesso: '2024-01-14T15:45:00',
    dataCadastro: '2024-01-05'
  },
  {
    id: 3,
    nome: 'Maria Vendas',
    email: 'maria@easybuffet.com',
    perfil: 'Vendedor',
    status: 'Inativo',
    ultimoAcesso: '2024-01-10T09:20:00',
    dataCadastro: '2024-01-08'
  }
]

export default function UsuariosList() {
  const [usuarios] = useState(mockUsuarios)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPerfil, setFilterPerfil] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPerfil = filterPerfil === 'todos' || usuario.perfil === filterPerfil
    const matchesStatus = filterStatus === 'todos' || usuario.status === filterStatus
    return matchesSearch && matchesPerfil && matchesStatus
  })

  const handleDelete = (id: number) => {
    // Implementar lógica de exclusão
    console.log('Excluir usuário:', id)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getPerfilIcon = (perfil: string) => {
    switch (perfil) {
      case 'Administrador':
        return <Shield className='h-4 w-4 text-red-600' />
      case 'Atendimento':
        return <UserCheck className='h-4 w-4 text-blue-600' />
      case 'Vendedor':
        return <User className='h-4 w-4 text-green-600' />
      default:
        return <User className='h-4 w-4 text-gray-600' />
    }
  }

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'Administrador':
        return 'bg-red-100 text-red-800'
      case 'Atendimento':
        return 'bg-blue-100 text-blue-800'
      case 'Vendedor':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Usuários</h1>
          <p className='text-muted-foreground'>
            Gerencie os usuários e perfis de acesso ao sistema
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link to='/cadastros/usuarios/novo'>
            <Plus className='mr-2 h-4 w-4' />
            Novo Usuário
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className='flex items-center space-x-2'>
        <div className='flex-1'>
          <SearchBar
            placeholder='Buscar por nome ou email...'
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <select
          value={filterPerfil}
          onChange={(e) => setFilterPerfil(e.target.value)}
          className='flex h-10 w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <option value='todos'>Todos os perfis</option>
          <option value='Administrador'>Administrador</option>
          <option value='Atendimento'>Atendimento</option>
          <option value='Vendedor'>Vendedor</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='flex h-10 w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <option value='todos'>Todos os status</option>
          <option value='Ativo'>Ativo</option>
          <option value='Inativo'>Inativo</option>
        </select>
      </div>

      {/* Tabela */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead>Data Cadastro</TableHead>
              <TableHead className='text-right'>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className='font-medium'>
                  <div className='flex items-center space-x-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <span>{usuario.nome}</span>
                  </div>
                </TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    {getPerfilIcon(usuario.perfil)}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPerfilColor(usuario.perfil)}`}
                    >
                      {usuario.perfil}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      usuario.status === 'Ativo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {usuario.status}
                  </span>
                </TableCell>
                <TableCell className='text-sm text-muted-foreground'>
                  {formatDateTime(usuario.ultimoAcesso)}
                </TableCell>
                <TableCell className='text-sm text-muted-foreground'>
                  {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end space-x-2'>
                    <Button variant='ghost' size='sm'>
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' asChild>
                      <Link to={`/cadastros/usuarios/editar/${usuario.id}`}>
                        <Edit className='h-4 w-4' />
                      </Link>
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(usuario.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação - implementar quando necessário */}
      {filteredUsuarios.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>
            {searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}
          </p>
        </div>
      )}
    </div>
  )
}
