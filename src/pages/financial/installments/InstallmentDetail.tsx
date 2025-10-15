import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, CheckCircle, DollarSign, User, FileText, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { mockInstallments } from '../mockData'

export default function InstallmentDetail() {
  const { id } = useParams()
  const [installment, setInstallment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      const foundInstallment = mockInstallments.find(inst => inst.id === id)
      setInstallment(foundInstallment)
      setLoading(false)
    }, 500)
  }, [id])

  const handleMarkAsPaid = () => {
    if (installment) {
      // Implementar lógica de marcação como pago
      console.log('Marcando parcela como paga:', installment.id)
      // Simular atualização
      setInstallment((prev: any) => prev ? {
        ...prev,
        status: 'paid',
        paymentDate: new Date().toISOString().split('T')[0]
      } : null)
    }
  }

  const handleDelete = () => {
    if (installment) {
      // Implementar lógica de exclusão
      console.log('Excluir parcela:', installment.id)
      // Redirecionar para lista após exclusão
      window.location.href = '/financeiro/parcelas'
    }
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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/financeiro/parcelas'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Carregando...</h1>
            <p className='text-muted-foreground'>Buscando informações da parcela</p>
          </div>
        </div>
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      </div>
    )
  }

  if (!installment) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/financeiro/parcelas'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Parcela não encontrada</h1>
            <p className='text-muted-foreground'>A parcela solicitada não foi encontrada</p>
          </div>
        </div>
        <div className='text-center py-12'>
          <div className='text-4xl mb-4'>❌</div>
          <p className='text-muted-foreground'>Parcela não encontrada ou foi removida</p>
          <Button asChild className='mt-4'>
            <Link to='/financeiro/parcelas'>Voltar para Lista</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/financeiro/parcelas'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Detalhes da Parcela</h1>
            <p className='text-muted-foreground'>
              Parcela {installment.installmentNumber} de {installment.totalInstallments} - {installment.eventName}
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          {installment.status !== 'paid' && (
            <Button onClick={handleMarkAsPaid} className='bg-green-600 hover:bg-green-700 text-white'>
              <CheckCircle className='h-4 w-4 mr-2' />
              Marcar como Pago
            </Button>
          )}
          <Button variant='outline' asChild>
            <Link to={`/financeiro/parcelas/editar/${installment.id}`}>
              <Edit className='h-4 w-4 mr-2' />
              Editar
            </Link>
          </Button>
          <Button variant='outline' onClick={handleDelete} className='text-red-600 hover:text-red-700'>
            <Trash2 className='h-4 w-4 mr-2' />
            Excluir
          </Button>
        </div>
      </div>

      {/* Informações Principais */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Informações do Cliente e Evento */}
        <div className='bg-white p-6 rounded-lg border shadow-sm'>
          <h3 className='text-lg font-semibold mb-4 flex items-center'>
            <User className='h-5 w-5 mr-2' />
            Informações do Cliente
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Cliente:</span>
              <span className='font-medium'>{installment.clientName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Evento:</span>
              <span className='font-medium'>{installment.eventName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Data do Evento:</span>
              <span className='font-medium'>{formatDate(installment.eventDate)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Contrato:</span>
              <span className='font-medium'>{installment.contractId}</span>
            </div>
          </div>
        </div>

        {/* Informações da Parcela */}
        <div className='bg-white p-6 rounded-lg border shadow-sm'>
          <h3 className='text-lg font-semibold mb-4 flex items-center'>
            <DollarSign className='h-5 w-5 mr-2' />
            Informações da Parcela
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Parcela:</span>
              <span className='font-medium'>{installment.installmentNumber}/{installment.totalInstallments}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Valor:</span>
              <span className='font-medium text-lg'>{formatCurrency(installment.amount)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Vencimento:</span>
              <span className='font-medium'>{formatDate(installment.dueDate)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Status:</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(installment.status)}`}>
                {getStatusLabel(installment.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações de Pagamento */}
      {installment.status === 'paid' && installment.paymentDate && (
        <div className='bg-green-50 p-6 rounded-lg border border-green-200'>
          <h3 className='text-lg font-semibold mb-4 flex items-center text-green-800'>
            <CheckCircle className='h-5 w-5 mr-2' />
            Informações de Pagamento
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex justify-between'>
              <span className='text-sm text-green-700'>Data do Pagamento:</span>
              <span className='font-medium text-green-800'>{formatDate(installment.paymentDate)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-green-700'>Valor Pago:</span>
              <span className='font-medium text-green-800'>{formatCurrency(installment.amount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Status de Vencimento */}
      {installment.status === 'overdue' && (
        <div className='bg-red-50 p-6 rounded-lg border border-red-200'>
          <h3 className='text-lg font-semibold mb-2 flex items-center text-red-800'>
            <Clock className='h-5 w-5 mr-2' />
            Parcela Vencida
          </h3>
          <p className='text-red-700'>
            Esta parcela venceu em {formatDate(installment.dueDate)} e ainda não foi paga.
          </p>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className='bg-white p-6 rounded-lg border shadow-sm'>
        <h3 className='text-lg font-semibold mb-4 flex items-center'>
          <FileText className='h-5 w-5 mr-2' />
          Informações Adicionais
        </h3>
        <div className='space-y-3'>
          <div className='flex justify-between'>
            <span className='text-sm text-gray-600'>Data de Criação:</span>
            <span className='font-medium'>{formatDate(installment.createdAt)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-sm text-gray-600'>ID da Parcela:</span>
            <span className='font-medium font-mono text-sm'>{installment.id}</span>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className='bg-gray-50 p-6 rounded-lg border'>
        <h3 className='text-lg font-semibold mb-4'>Ações Rápidas</h3>
        <div className='flex flex-wrap gap-2'>
          {installment.status !== 'paid' && (
            <Button onClick={handleMarkAsPaid} className='bg-green-600 hover:bg-green-700 text-white'>
              <CheckCircle className='h-4 w-4 mr-2' />
              Marcar como Pago
            </Button>
          )}
          <Button variant='outline' asChild>
            <Link to={`/financeiro/parcelas/editar/${installment.id}`}>
              <Edit className='h-4 w-4 mr-2' />
              Editar Parcela
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link to={`/cadastros/contratos/visualizar/${installment.contractId}`}>
              <FileText className='h-4 w-4 mr-2' />
              Ver Contrato
            </Link>
          </Button>
          <Button variant='outline' onClick={handleDelete} className='text-red-600 hover:text-red-700'>
            <Trash2 className='h-4 w-4 mr-2' />
            Excluir Parcela
          </Button>
        </div>
      </div>
    </div>
  )
}
