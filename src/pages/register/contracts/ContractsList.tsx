import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, FileText, Calendar, DollarSign, User } from 'lucide-react'
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
const mockContratos = [
  {
    id: 1,
    evento: 'Casamento João & Maria',
    cliente: 'João Silva',
    valorTotal: 5000.00,
    parcelas: 5,
    primeiroVencimento: '2025-10-15',
    periodicidade: 'Mensal',
    comissaoPercentual: 10,
    comissaoTotal: 500.00,
    status: 'Ativo',
    dataCadastro: '2025-10-15',
    parcelasPagas: 2,
    parcelasPendentes: 3
  },
  {
    id: 2,
    evento: 'Aniversário Pedro',
    cliente: 'Pedro Oliveira',
    valorTotal: 2500.00,
    parcelas: 3,
    primeiroVencimento: '2025-10-01',
    periodicidade: 'Mensal',
    comissaoPercentual: 8,
    comissaoTotal: 200.00,
    status: 'Ativo',
    dataCadastro: '2025-10-20',
    parcelasPagas: 1,
    parcelasPendentes: 2
  },
  {
    id: 3,
    evento: 'Formatura Ana',
    cliente: 'Ana Santos',
    valorTotal: 8000.00,
    parcelas: 8,
    primeiroVencimento: '2025-10-10',
    periodicidade: 'Mensal',
    comissaoPercentual: 12,
    comissaoTotal: 960.00,
    status: 'Finalizado',
    dataCadastro: '2025-11-25',
    parcelasPagas: 8,
    parcelasPendentes: 0
  }
]

export default function ContractsList() {
  const [contratos] = useState(mockContratos)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

  const filteredContratos = contratos.filter(contrato => {
    const matchesSearch = contrato.evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contrato.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || contrato.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleDelete = (id: number) => {
    // Implementar lógica de exclusão
    console.log('Excluir contrato:', id)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800'
      case 'Finalizado':
        return 'bg-blue-100 text-blue-800'
      case 'Cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (pagas: number, total: number) => {
    return total > 0 ? Math.round((pagas / total) * 100) : 0
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Contratos</h1>
          <p className='text-muted-foreground'>
            Gerencie os contratos e parcelamentos dos eventos
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link to='/cadastros/contratos/novo'>
            <Plus className='mr-2 h-4 w-4' />
            Novo Contrato
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className='flex items-center space-x-2'>
        <div className='flex-1'>
          <SearchBar
            placeholder='Buscar por evento ou cliente...'
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='flex h-10 w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <option value='todos'>Todos os status</option>
          <option value='Ativo'>Ativo</option>
          <option value='Finalizado'>Finalizado</option>
          <option value='Cancelado'>Cancelado</option>
        </select>
      </div>

      {/* Tabela */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Parcelas</TableHead>
              <TableHead>1º Vencimento</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContratos.map((contrato) => (
              <TableRow key={contrato.id}>
                <TableCell className='font-medium'>
                  <div className='flex items-center space-x-2'>
                    <FileText className='h-4 w-4 text-muted-foreground' />
                    <span>{contrato.evento}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <span>{contrato.cliente}</span>
                  </div>
                </TableCell>
                <TableCell className='font-medium'>{formatCurrency(contrato.valorTotal)}</TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span>{contrato.parcelas}x</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(contrato.primeiroVencimento)}</TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <DollarSign className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <div className='text-sm font-medium'>{formatCurrency(contrato.comissaoTotal)}</div>
                      <div className='text-xs text-muted-foreground'>{contrato.comissaoPercentual}%</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='space-y-1'>
                    <div className='flex justify-between text-xs'>
                      <span>{contrato.parcelasPagas}/{contrato.parcelas}</span>
                      <span>{getProgressPercentage(contrato.parcelasPagas, contrato.parcelas)}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full'
                        style={{ width: `${getProgressPercentage(contrato.parcelasPagas, contrato.parcelas)}%` }}
                      ></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(contrato.status)}`}
                  >
                    {contrato.status}
                  </span>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end space-x-2'>
                    <Button variant='ghost' size='sm' asChild>
                      <Link to={`/cadastros/contratos/visualizar/${contrato.id}`}>
                        <Eye className='h-4 w-4' />
                      </Link>
                    </Button>
                    
                    <Button variant='ghost' size='sm' asChild>
                      <Link to={`/cadastros/contratos/editar/${contrato.id}`}>
                        <Edit className='h-4 w-4' />
                      </Link>
                    </Button>
                    
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(contrato.id)}
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
      {filteredContratos.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>
            {searchTerm ? 'Nenhum contrato encontrado.' : 'Nenhum contrato cadastrado.'}
          </p>
        </div>
      )}
    </div>
  )
}
