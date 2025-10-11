import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Calendar, Clock, MapPin } from 'lucide-react'
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
const mockEvents = [
  {
    id: 1,
    cliente: 'João Silva',
    pacote: 'Pacote Básico',
    data: '2024-02-15',
    horario: '19:00',
    local: 'Salão de Festas ABC',
    convidados: 50,
    status: 'Confirmado',
    valor: 2500.00,
    dataCadastro: '2024-01-15'
  },
  {
    id: 2,
    cliente: 'Maria Santos',
    pacote: 'Pacote Premium + DJ',
    data: '2024-02-20',
    horario: '20:00',
    local: 'Espaço Eventos XYZ',
    convidados: 100,
    status: 'Pendente',
    valor: 4500.00,
    dataCadastro: '2024-01-20'
  },
  {
    id: 3,
    cliente: 'Pedro Oliveira',
    pacote: 'Serviço de DJ',
    data: '2024-02-25',
    horario: '21:00',
    local: 'Casa do Cliente',
    convidados: 30,
    status: 'Cancelado',
    valor: 800.00,
    dataCadastro: '2024-01-25'
  }
]

export default function EventsList() {
  const [events] = useState(mockEvents)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.pacote.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.local.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || event.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleDelete = (id: number) => {
    // Implementar lógica de exclusão
    console.log('Excluir evento:', id)
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
      case 'Confirmado':
        return 'bg-green-100 text-green-800'
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Eventos e Reservas</h1>
          <p className='text-muted-foreground'>
            Gerencie os eventos e reservas dos clientes
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link to='/cadastros/eventos/novo'>
            <Plus className='mr-2 h-4 w-4' />
            Nova Reserva
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className='flex items-center space-x-2'>
        <div className='flex-1'>
          <SearchBar
            placeholder='Buscar por cliente, pacote ou local...'
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
          <option value='Confirmado'>Confirmado</option>
          <option value='Pendente'>Pendente</option>
          <option value='Cancelado'>Cancelado</option>
        </select>
      </div>

      {/* Tabela */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Pacote</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Convidados</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((evento) => (
              <TableRow key={evento.id}>
                <TableCell className='font-medium'>{evento.cliente}</TableCell>
                <TableCell>{evento.pacote}</TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span>{formatDate(evento.data)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                    <span>{evento.horario}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    <span className='max-w-xs truncate'>{evento.local}</span>
                  </div>
                </TableCell>
                <TableCell>{evento.convidados} pessoas</TableCell>
                <TableCell className='font-medium'>{formatCurrency(evento.valor)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(evento.status)}`}
                  >
                    {evento.status}
                  </span>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end space-x-2'>
                    <Button variant='ghost' size='sm'>
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' asChild>
                      <Link to={`/cadastros/eventos/editar/${evento.id}`}>
                        <Edit className='h-4 w-4' />
                      </Link>
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(evento.id)}
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
      {filteredEvents.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>
            {searchTerm ? 'Nenhum evento encontrado.' : 'Nenhum evento cadastrado.'}
          </p>
        </div>
      )}
    </div>
  )
}
