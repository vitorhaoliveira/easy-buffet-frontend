import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react'
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
const mockPackages = [
  {
    id: 1,
    nome: 'Pacote Básico',
    tipo: 'Pacote',
    descricao: 'Buffet completo para até 50 pessoas',
    preco: 2500.00,
    duracao: '4 horas',
    status: 'Ativo',
    dataCadastro: '2024-01-15'
  },
  {
    id: 2,
    nome: 'Serviço de DJ',
    tipo: 'Serviço',
    descricao: 'DJ com equipamento completo',
    preco: 800.00,
    duracao: '6 horas',
    status: 'Ativo',
    dataCadastro: '2024-01-20'
  },
  {
    id: 3,
    nome: 'Decoração Premium',
    tipo: 'Serviço',
    descricao: 'Decoração completa para eventos especiais',
    preco: 1200.00,
    duracao: '8 horas',
    status: 'Inativo',
    dataCadastro: '2024-01-25'
  }
]

export default function PackageList() {
  const [packages] = useState(mockPackages)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('todos')

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'todos' || pkg.tipo === filterType
    return matchesSearch && matchesType
  })

  const handleDelete = (id: number) => {
    // Implementar lógica de exclusão
    console.log('Excluir pacote:', id)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Pacotes e Serviços</h1>
          <p className='text-muted-foreground'>
            Gerencie os pacotes de buffet e serviços avulsos
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link to='/cadastros/pacotes/novo'>
            <Plus className='mr-2 h-4 w-4' />
            Novo Pacote/Serviço
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className='flex items-center space-x-2'>
        <div className='flex-1'>
          <SearchBar
            placeholder='Buscar por nome ou descrição...'
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className='flex h-10 w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <option value='todos'>Todos os tipos</option>
          <option value='Pacote'>Pacotes</option>
          <option value='Serviço'>Serviços</option>
        </select>
      </div>

      {/* Tabela */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className='font-medium'>
                  <div className='flex items-center space-x-2'>
                    <Package className='h-4 w-4 text-muted-foreground' />
                    <span>{pkg.nome}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      pkg.tipo === 'Pacote'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {pkg.tipo}
                  </span>
                </TableCell>
                <TableCell className='max-w-xs truncate'>{pkg.descricao}</TableCell>
                <TableCell className='font-medium'>{formatCurrency(pkg.preco)}</TableCell>
                <TableCell>{pkg.duracao}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      pkg.status === 'Ativo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pkg.status}
                  </span>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end space-x-2'>
                    <Button variant='ghost' size='sm'>
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' asChild>
                      <Link to={`/cadastros/pacotes/editar/${pkg.id}`}>
                        <Edit className='h-4 w-4' />
                      </Link>
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(pkg.id)}
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
      {filteredPackages.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>
            {searchTerm ? 'Nenhum pacote/serviço encontrado.' : 'Nenhum pacote/serviço cadastrado.'}
          </p>
        </div>
      )}
    </div>
  )
}
