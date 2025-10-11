import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, FileText, Calendar, DollarSign, User, Calculator, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table/table'

// Mock data - substituir por dados reais da API
const mockContrato = {
  id: 1,
  evento: 'Casamento João & Maria',
  cliente: 'João Silva',
  valorTotal: 5000.00,
  parcelas: 5,
  primeiroVencimento: '2025-11-15',
  periodicidade: 'Mensal',
  comissaoPercentual: 10,
  comissaoTotal: 500.00,
  status: 'Ativo',
  dataCadastro: '2025-10-15',
  observacoes: 'Contrato para casamento com cerimônia e recepção.',
  parcelasDetalhes: [
    {
      numero: 1,
      dataVencimento: '2025-10-15',
      valor: 1000.00,
      status: 'Pago',
      dataPagamento: '2025-10-14'
    },
    {
      numero: 2,
      dataVencimento: '2025-10-15',
      valor: 1000.00,
      status: 'Pago',
      dataPagamento: '2025-10-14'
    },
    {
      numero: 3,
      dataVencimento: '2025-10-15',
      valor: 1000.00,
      status: 'A vencer'
    },
    {
      numero: 4,
      dataVencimento: '2025-10-15',
      valor: 1000.00,
      status: 'A vencer'
    },
    {
      numero: 5,
      dataVencimento: '2025-10-15',
      valor: 1000.00,
      status: 'A vencer'
    }
  ]
}

export default function ContractDetail() {
  const { id } = useParams()
  const [contrato] = useState(mockContrato)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pago':
        return <CheckCircle className='h-4 w-4 text-green-600' />
      case 'A vencer':
        return <Clock className='h-4 w-4 text-yellow-600' />
      case 'Atrasado':
        return <AlertCircle className='h-4 w-4 text-red-600' />
      default:
        return <XCircle className='h-4 w-4 text-gray-600' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'bg-green-100 text-green-800'
      case 'A vencer':
        return 'bg-yellow-100 text-yellow-800'
      case 'Atrasado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getContractStatusColor = (status: string) => {
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

  const parcelasPagas = contrato.parcelasDetalhes.filter(p => p.status === 'Pago').length
  const parcelasPendentes = contrato.parcelasDetalhes.filter(p => p.status === 'A vencer').length
  const parcelasAtrasadas = contrato.parcelasDetalhes.filter(p => p.status === 'Atrasado').length
  const progressPercentage = Math.round((parcelasPagas / contrato.parcelas) * 100)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/cadastros/contratos'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Detalhes do Contrato</h1>
            <p className='text-muted-foreground'>
              Visualização completa do contrato e parcelas
            </p>
          </div>
        </div>
        <Button variant='outline' asChild>
          <Link to={`/cadastros/contratos/editar/${contrato.id}`}>
            <Edit className='h-4 w-4 mr-2' />
            Editar Contrato
          </Link>
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Informações do Contrato */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Dados Principais */}
          <div className='bg-white border rounded-lg p-6'>
            <h3 className='text-lg font-semibold flex items-center space-x-2 mb-4'>
              <FileText className='h-5 w-5' />
              <span>Informações do Contrato</span>
            </h3>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Evento</label>
                <p className='text-lg font-semibold'>{contrato.evento}</p>
              </div>
              
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Cliente</label>
                <div className='flex items-center space-x-2'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <p className='text-lg font-semibold'>{contrato.cliente}</p>
                </div>
              </div>
              
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Valor Total</label>
                <div className='flex items-center space-x-2'>
                  <DollarSign className='h-4 w-4 text-muted-foreground' />
                  <p className='text-lg font-semibold text-green-600'>{formatCurrency(contrato.valorTotal)}</p>
                </div>
              </div>
              
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Status</label>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getContractStatusColor(contrato.status)}`}>
                  {contrato.status}
                </span>
              </div>
              
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Parcelas</label>
                <div className='flex items-center space-x-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <p className='text-lg font-semibold'>{contrato.parcelas}x {contrato.periodicidade}</p>
                </div>
              </div>
              
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Primeiro Vencimento</label>
                <p className='text-lg font-semibold'>{formatDate(contrato.primeiroVencimento)}</p>
              </div>
              
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Comissão</label>
                <div className='space-y-1'>
                  <p className='text-lg font-semibold text-blue-600'>{formatCurrency(contrato.comissaoTotal)}</p>
                  <p className='text-sm text-muted-foreground'>{contrato.comissaoPercentual}% do valor total</p>
                </div>
              </div>
              
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Data de Cadastro</label>
                <p className='text-lg font-semibold'>{formatDate(contrato.dataCadastro)}</p>
              </div>
            </div>
            
            {contrato.observacoes && (
              <div className='mt-6'>
                <label className='text-sm font-medium text-muted-foreground'>Observações</label>
                <p className='mt-1 text-sm bg-gray-50 p-3 rounded-md'>{contrato.observacoes}</p>
              </div>
            )}
          </div>

          {/* Parcelas */}
          <div className='bg-white border rounded-lg p-6'>
            <h3 className='text-lg font-semibold flex items-center space-x-2 mb-4'>
              <Calculator className='h-5 w-5' />
              <span>Parcelas do Contrato</span>
            </h3>
            
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contrato.parcelasDetalhes.map((parcela) => (
                    <TableRow key={parcela.numero}>
                      <TableCell className='font-medium'>{parcela.numero}</TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <Calendar className='h-4 w-4 text-muted-foreground' />
                          <span>{formatDate(parcela.dataVencimento)}</span>
                        </div>
                      </TableCell>
                      <TableCell className='font-medium'>
                        <div className='flex items-center space-x-2'>
                          <DollarSign className='h-4 w-4 text-muted-foreground' />
                          <span>{formatCurrency(parcela.valor)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          {getStatusIcon(parcela.status)}
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(parcela.status)}`}>
                            {parcela.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {parcela.dataPagamento ? formatDate(parcela.dataPagamento) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Resumo e Estatísticas */}
        <div className='space-y-6'>
          {/* Resumo do Progresso */}
          <div className='bg-white border rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4'>Resumo do Progresso</h3>
            
            <div className='space-y-4'>
              <div>
                <div className='flex justify-between text-sm mb-2'>
                  <span>Progresso Geral</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='bg-blue-600 h-3 rounded-full transition-all duration-300'
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className='grid grid-cols-2 gap-4 text-center'>
                <div className='bg-green-50 p-3 rounded-lg'>
                  <div className='text-2xl font-bold text-green-600'>{parcelasPagas}</div>
                  <div className='text-sm text-green-600'>Pagas</div>
                </div>
                <div className='bg-yellow-50 p-3 rounded-lg'>
                  <div className='text-2xl font-bold text-yellow-600'>{parcelasPendentes}</div>
                  <div className='text-sm text-yellow-600'>A Vencer</div>
                </div>
              </div>
              
              {parcelasAtrasadas > 0 && (
                <div className='bg-red-50 p-3 rounded-lg text-center'>
                  <div className='text-2xl font-bold text-red-600'>{parcelasAtrasadas}</div>
                  <div className='text-sm text-red-600'>Atrasadas</div>
                </div>
              )}
            </div>
          </div>

          {/* Valores */}
          <div className='bg-white border rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4'>Valores</h3>
            
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Valor por parcela:</span>
                <span className='font-semibold'>{formatCurrency(contrato.valorTotal / contrato.parcelas)}</span>
              </div>
              
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Total pago:</span>
                <span className='font-semibold text-green-600'>
                  {formatCurrency(parcelasPagas * (contrato.valorTotal / contrato.parcelas))}
                </span>
              </div>
              
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Restante:</span>
                <span className='font-semibold text-orange-600'>
                  {formatCurrency(parcelasPendentes * (contrato.valorTotal / contrato.parcelas))}
                </span>
              </div>
              
              <div className='border-t pt-3'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Comissão total:</span>
                  <span className='font-semibold text-blue-600'>{formatCurrency(contrato.comissaoTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className='bg-white border rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4'>Ações Rápidas</h3>
            
            <div className='space-y-2'>
              <Button variant='outline' className='w-full' asChild>
                <Link to={`/cadastros/contratos/editar/${contrato.id}`}>
                  <Edit className='h-4 w-4 mr-2' />
                  Editar Contrato
                </Link>
              </Button>
              
              <Button variant='outline' className='w-full'>
                <FileText className='h-4 w-4 mr-2' />
                Gerar PDF
              </Button>
              
              <Button variant='outline' className='w-full'>
                <DollarSign className='h-4 w-4 mr-2' />
                Registrar Pagamento
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
