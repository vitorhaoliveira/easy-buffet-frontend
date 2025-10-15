import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, DollarSign, Calendar, User, CheckCircle } from 'lucide-react'
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
import { mockInstallments } from '../mockData'

export default function InstallmentsList() {
  const [installments] = useState(mockInstallments)
  const [searchTerm, setSearchTerm] = useState('')

  // Debug: verificar se os dados estão sendo carregados
  console.log('Total de parcelas carregadas:', installments.length)
  console.log('Primeiras 3 parcelas:', installments.slice(0, 3))

  // Filtro simples apenas por busca
  const filteredInstallments = installments.filter(installment => {
    if (!searchTerm) return true
    
    return (
      installment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.contractId.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  console.log('Parcelas filtradas:', filteredInstallments.length)

  const handleMarkAsPaid = (id: string) => {
    // Implementar lógica de marcação como pago
    console.log('Marcar como pago:', id)
    
    // Simular atualização local (mock)
    const installment = installments.find(inst => inst.id === id)
    if (installment) {
      installment.status = 'paid'
      installment.paymentDate = new Date().toISOString().split('T')[0]
    }
  }

  const handleDelete = (id: string) => {
    // Implementar lógica de exclusão
    console.log('Excluir parcela:', id)
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
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago'
      case 'pending':
        return 'Pendente'
      case 'overdue':
        return 'Vencido'
      default:
        return status
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Parcelas de Entrada</h1>
          <p className='text-muted-foreground'>
            Gerencie as parcelas recebidas dos contratos
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link to='/financeiro/parcelas/nova'>
            <Plus className='mr-2 h-4 w-4' />
            Nova Parcela
          </Link>
        </Button>
      </div>

      {/* Debug Info */}
      <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
        <h3 className='font-semibold text-blue-800 mb-2'>Debug Info</h3>
        <p className='text-sm text-blue-700'>
          Total de parcelas: {installments.length} | 
          Parcelas filtradas: {filteredInstallments.length} | 
          Termo de busca: "{searchTerm}"
        </p>
      </div>

      {/* Filtros */}
      <div className='flex items-center space-x-2'>
        <div className='flex-1'>
          <SearchBar
            placeholder='Buscar por cliente, evento ou contrato...'
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
              <TableHead>Cliente</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Parcela</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className='text-right'>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstallments.map((installment) => (
              <TableRow key={installment.id}>
                <TableCell className='font-medium'>
                  <div className='flex items-center space-x-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <span>{installment.clientName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='max-w-[200px] truncate' title={installment.eventName}>
                    {installment.eventName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <DollarSign className='h-4 w-4 text-muted-foreground' />
                    <span>{installment.contractId}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span>{installment.installmentNumber}/{installment.totalInstallments}</span>
                  </div>
                </TableCell>
                <TableCell className='font-medium'>{formatCurrency(installment.amount)}</TableCell>
                <TableCell>{formatDate(installment.dueDate)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(installment.status)}`}
                  >
                    {getStatusLabel(installment.status)}
                  </span>
                </TableCell>
                <TableCell>
                  {installment.paymentDate ? (
                    <div className='flex items-center space-x-2'>
                      <CheckCircle className='h-4 w-4 text-green-600' />
                      <span className='text-sm'>{formatDate(installment.paymentDate)}</span>
                    </div>
                  ) : (
                    <span className='text-gray-400'>-</span>
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end space-x-2'>
                    <Button variant='ghost' size='sm' asChild>
                      <Link to={`/financeiro/parcelas/visualizar/${installment.id}`}>
                        <Eye className='h-4 w-4' />
                      </Link>
                    </Button>
                    
                    {installment.status !== 'paid' && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleMarkAsPaid(installment.id)}
                        className='text-green-600 hover:text-green-700'
                      >
                        <CheckCircle className='h-4 w-4' />
                      </Button>
                    )}
                    
                    <Button variant='ghost' size='sm' asChild>
                      <Link to={`/financeiro/parcelas/editar/${installment.id}`}>
                        <Edit className='h-4 w-4' />
                      </Link>
                    </Button>
                    
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(installment.id)}
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
      {filteredInstallments.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>
            {searchTerm ? 'Nenhuma parcela encontrada.' : 'Nenhuma parcela cadastrada.'}
          </p>
        </div>
      )}
    </div>
  )
}