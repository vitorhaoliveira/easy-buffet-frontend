import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Calendar, DollarSign, Tag } from 'lucide-react'
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
import { mockCosts } from '../mockData'

export default function CostsList() {
  const [costs] = useState(mockCosts)
  const [searchTerm, setSearchTerm] = useState('')

  // Debug: verificar se os dados estão sendo carregados
  console.log('Total de custos carregados:', costs.length)
  console.log('Primeiros 3 custos:', costs.slice(0, 3))

  // Filtro simples apenas por busca
  const filteredCosts = costs.filter(cost => {
    if (!searchTerm) return true
    
    return (
      cost.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.eventId.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  console.log('Custos filtrados:', filteredCosts.length)

  const handleDelete = (id: string) => {
    // Implementar lógica de exclusão
    console.log('Excluir custo:', id)
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'equipment':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'transport':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'other':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'food':
        return 'Alimentação'
      case 'staff':
        return 'Equipe'
      case 'equipment':
        return 'Equipamentos'
      case 'transport':
        return 'Transporte'
      case 'other':
        return 'Outros'
      default:
        return category
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Custos e Despesas</h1>
          <p className='text-muted-foreground'>
            Gerencie os custos operacionais dos eventos
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link to='/financeiro/custos/novo'>
            <Plus className='mr-2 h-4 w-4' />
            Novo Custo
          </Link>
        </Button>
      </div>

      {/* Debug Info */}
      <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
        <h3 className='font-semibold text-blue-800 mb-2'>Debug Info</h3>
        <p className='text-sm text-blue-700'>
          Total de custos: {costs.length} | 
          Custos filtrados: {filteredCosts.length} | 
          Termo de busca: "{searchTerm}"
        </p>
      </div>

      {/* Filtros */}
      <div className='flex items-center space-x-2'>
        <div className='flex-1'>
          <SearchBar
            placeholder='Buscar por evento ou descrição...'
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
              <TableHead>Evento</TableHead>
              <TableHead>Data do Evento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data do Gasto</TableHead>
              <TableHead className='text-right'>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCosts.map((cost) => (
              <TableRow key={cost.id}>
                <TableCell className='font-medium'>
                  <div className='max-w-[200px] truncate' title={cost.eventName}>
                    {cost.eventName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span>{formatDate(cost.eventDate)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='max-w-[200px] truncate' title={cost.description}>
                    {cost.description}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getCategoryColor(cost.category)}`}
                  >
                    <Tag className='h-3 w-3 mr-1' />
                    {getCategoryLabel(cost.category)}
                  </span>
                </TableCell>
                <TableCell className='font-medium text-red-600'>
                  <div className='flex items-center space-x-2'>
                    <DollarSign className='h-4 w-4 text-red-600' />
                    <span>{formatCurrency(cost.amount)}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(cost.createdAt)}</TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end space-x-2'>
                    <Button variant='ghost' size='sm' asChild>
                      <Link to={`/financeiro/custos/visualizar/${cost.id}`}>
                        <Eye className='h-4 w-4' />
                      </Link>
                    </Button>
                    
                    <Button variant='ghost' size='sm' asChild>
                      <Link to={`/financeiro/custos/editar/${cost.id}`}>
                        <Edit className='h-4 w-4' />
                      </Link>
                    </Button>
                    
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(cost.id)}
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
      {filteredCosts.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>
            {searchTerm ? 'Nenhum custo encontrado.' : 'Nenhum custo cadastrado.'}
          </p>
        </div>
      )}
    </div>
  )
}