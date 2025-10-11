import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
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
const mockClientes = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    dataCadastro: '2024-01-15',
    status: 'Ativo'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@email.com',
    telefone: '(11) 88888-8888',
    dataCadastro: '2024-01-20',
    status: 'Ativo'
  },
  {
    id: 3,
    nome: 'Pedro Oliveira',
    email: 'pedro@email.com',
    telefone: '(11) 77777-7777',
    dataCadastro: '2024-01-25',
    status: 'Inativo'
  }
]

export default function ClientesList() {
  const [clientes] = useState(mockClientes)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm)
  )

  const handleDelete = (id: number) => {
    // Implementar lógica de exclusão
    console.log('Excluir cliente:', id)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Clientes</h1>
          <p className='text-muted-foreground'>
            Gerencie os dados dos seus clientes
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link to='/cadastros/clientes/novo'>
            <Plus className='mr-2 h-4 w-4' />
            Novo Cliente
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className='flex items-center space-x-2'>
        <div className='flex-1'>
          <SearchBar
            placeholder='Buscar por nome, email ou telefone...'
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className='font-medium'>{cliente.nome}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell>{cliente.telefone}</TableCell>
                <TableCell>
                  {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      cliente.status === 'Ativo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cliente.status}
                  </span>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end space-x-2'>
                    <Button variant='ghost' size='sm'>
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' asChild>
                      <Link to={`/cadastros/clientes/editar/${cliente.id}`}>
                        <Edit className='h-4 w-4' />
                      </Link>
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(cliente.id)}
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
      {filteredClientes.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>
            {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
          </p>
        </div>
      )}
    </div>
  )
}
