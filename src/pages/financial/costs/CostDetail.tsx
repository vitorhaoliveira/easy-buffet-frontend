import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, FileText, Tag, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { mockCosts } from '../mockData'

export default function CostDetail() {
  const { id } = useParams()
  const [cost, setCost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      const foundCost = mockCosts.find(c => c.id === id)
      setCost(foundCost)
      setLoading(false)
    }, 500)
  }, [id])

  const handleDelete = () => {
    if (cost) {
      // Implementar lógica de exclusão
      console.log('Excluir custo:', cost.id)
      // Redirecionar para lista após exclusão
      window.location.href = '/financeiro/custos'
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
        return '🍔 Alimentação'
      case 'staff':
        return '👥 Equipe'
      case 'equipment':
        return '🔧 Equipamentos'
      case 'transport':
        return '🚚 Transporte'
      case 'other':
        return '📦 Outros'
      default:
        return category
    }
  }

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/financeiro/custos'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Carregando...</h1>
            <p className='text-muted-foreground'>Buscando informações do custo</p>
          </div>
        </div>
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      </div>
    )
  }

  if (!cost) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/financeiro/custos'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Custo não encontrado</h1>
            <p className='text-muted-foreground'>O custo solicitado não foi encontrado</p>
          </div>
        </div>
        <div className='text-center py-12'>
          <div className='text-4xl mb-4'>❌</div>
          <p className='text-muted-foreground'>Custo não encontrado ou foi removido</p>
          <Button asChild className='mt-4'>
            <Link to='/financeiro/custos'>Voltar para Lista</Link>
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
            <Link to='/financeiro/custos'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Detalhes do Custo</h1>
            <p className='text-muted-foreground'>
              {cost.description} - {cost.eventName}
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' asChild>
            <Link to={`/financeiro/custos/editar/${cost.id}`}>
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
        {/* Informações do Evento */}
        <div className='bg-white p-6 rounded-lg border shadow-sm'>
          <h3 className='text-lg font-semibold mb-4 flex items-center'>
            <FileText className='h-5 w-5 mr-2' />
            Informações do Evento
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Evento:</span>
              <span className='font-medium'>{cost.eventName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Data do Evento:</span>
              <span className='font-medium'>{formatDate(cost.eventDate)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>ID do Evento:</span>
              <span className='font-medium font-mono text-sm'>{cost.eventId}</span>
            </div>
          </div>
        </div>

        {/* Informações do Custo */}
        <div className='bg-white p-6 rounded-lg border shadow-sm'>
          <h3 className='text-lg font-semibold mb-4 flex items-center'>
            <DollarSign className='h-5 w-5 mr-2' />
            Informações do Custo
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Valor:</span>
              <span className='font-medium text-lg text-red-600'>{formatCurrency(cost.amount)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Categoria:</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getCategoryColor(cost.category)}`}>
                {getCategoryLabel(cost.category)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Data do Gasto:</span>
              <span className='font-medium'>{formatDate(cost.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Descrição Completa */}
      <div className='bg-white p-6 rounded-lg border shadow-sm'>
        <h3 className='text-lg font-semibold mb-4 flex items-center'>
          <Tag className='h-5 w-5 mr-2' />
          Descrição do Custo
        </h3>
        <p className='text-gray-700'>{cost.description}</p>
      </div>

      {/* Informações Adicionais */}
      <div className='bg-white p-6 rounded-lg border shadow-sm'>
        <h3 className='text-lg font-semibold mb-4 flex items-center'>
          <Calendar className='h-5 w-5 mr-2' />
          Informações Adicionais
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='flex justify-between'>
            <span className='text-sm text-gray-600'>Data de Criação:</span>
            <span className='font-medium'>{formatDate(cost.createdAt)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-sm text-gray-600'>ID do Custo:</span>
            <span className='font-medium font-mono text-sm'>{cost.id}</span>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className='bg-red-50 p-6 rounded-lg border border-red-200'>
        <h3 className='text-lg font-semibold mb-4 text-red-800'>Resumo Financeiro</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <p className='text-sm text-red-700'>Valor do Custo</p>
            <p className='text-2xl font-bold text-red-600'>{formatCurrency(cost.amount)}</p>
          </div>
          <div>
            <p className='text-sm text-red-700'>Categoria</p>
            <p className='text-lg font-medium text-red-800'>{getCategoryLabel(cost.category)}</p>
          </div>
          <div>
            <p className='text-sm text-red-700'>Evento</p>
            <p className='text-lg font-medium text-red-800'>{cost.eventName}</p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className='bg-gray-50 p-6 rounded-lg border'>
        <h3 className='text-lg font-semibold mb-4'>Ações Rápidas</h3>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' asChild>
            <Link to={`/financeiro/custos/editar/${cost.id}`}>
              <Edit className='h-4 w-4 mr-2' />
              Editar Custo
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link to={`/cadastros/eventos`}>
              <MapPin className='h-4 w-4 mr-2' />
              Ver Eventos
            </Link>
          </Button>
          <Button variant='outline' onClick={handleDelete} className='text-red-600 hover:text-red-700'>
            <Trash2 className='h-4 w-4 mr-2' />
            Excluir Custo
          </Button>
        </div>
      </div>
    </div>
  )
}
