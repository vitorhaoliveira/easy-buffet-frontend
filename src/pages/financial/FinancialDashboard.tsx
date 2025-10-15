import { Link } from 'react-router-dom'
import { DollarSign, TrendingUp, TrendingDown, BarChart3, FileText, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button/button'

export default function FinancialDashboard() {
  const financialModules = [
    {
      title: 'Parcelas de Entrada',
      description: 'Gerencie as parcelas recebidas dos contratos',
      icon: TrendingUp,
      href: '/financeiro/parcelas',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Custos e Despesas',
      description: 'Controle os custos operacionais dos eventos',
      icon: TrendingDown,
      href: '/financeiro/custos',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Resumo Financeiro',
      description: 'Relatório consolidado de entradas e saídas',
      icon: BarChart3,
      href: '/financeiro/resumo',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ]

  const quickActions = [
    {
      title: 'Nova Parcela',
      description: 'Registrar recebimento de parcela',
      icon: DollarSign,
      href: '/financeiro/parcelas/nova',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Novo Custo',
      description: 'Registrar custo operacional',
      icon: Receipt,
      href: '/financeiro/custos/novo',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Relatório Mensal',
      description: 'Gerar relatório do mês atual',
      icon: FileText,
      href: '/financeiro/relatorio',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ]

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Financeiro</h1>
        <p className='text-muted-foreground mt-2'>
          Gerencie suas finanças e acompanhe o fluxo de caixa do negócio
        </p>
      </div>

      {/* Módulos Principais */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>Módulos Financeiros</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {financialModules.map((module) => {
            const IconComponent = module.icon
            return (
              <Link key={module.title} to={module.href}>
                <div className={`p-6 rounded-lg border ${module.bgColor} ${module.borderColor} hover:shadow-md transition-shadow cursor-pointer`}>
                  <div className='flex items-center space-x-4'>
                    <div className={`p-3 rounded-lg ${module.bgColor} ${module.borderColor} border`}>
                      <IconComponent className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <div className='flex-1'>
                      <h3 className={`font-semibold ${module.color}`}>{module.title}</h3>
                      <p className='text-sm text-gray-600 mt-1'>{module.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>Ações Rápidas</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {quickActions.map((action) => {
            const IconComponent = action.icon
            return (
              <Link key={action.title} to={action.href}>
                <div className={`p-4 rounded-lg border ${action.bgColor} ${action.borderColor} hover:shadow-md transition-shadow cursor-pointer`}>
                  <div className='flex items-center space-x-3'>
                    <div className={`p-2 rounded-lg ${action.bgColor} ${action.borderColor} border`}>
                      <IconComponent className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${action.color}`}>{action.title}</h4>
                      <p className='text-xs text-gray-600'>{action.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Resumo Rápido */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>Resumo do Mês Atual</h2>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-green-600'>Entradas</p>
                <p className='text-lg font-bold text-green-800'>R$ 12.500,00</p>
              </div>
              <TrendingUp className='h-6 w-6 text-green-600' />
            </div>
          </div>
          
          <div className='bg-red-50 p-4 rounded-lg border border-red-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-red-600'>Saídas</p>
                <p className='text-lg font-bold text-red-800'>R$ 8.200,00</p>
              </div>
              <TrendingDown className='h-6 w-6 text-red-600' />
            </div>
          </div>
          
          <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-blue-600'>Lucro Líquido</p>
                <p className='text-lg font-bold text-blue-800'>R$ 4.300,00</p>
              </div>
              <BarChart3 className='h-6 w-6 text-blue-600' />
            </div>
          </div>
          
          <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Margem</p>
                <p className='text-lg font-bold text-gray-800'>34,4%</p>
              </div>
              <DollarSign className='h-6 w-6 text-gray-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Links Úteis */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>Links Úteis</h2>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link to='/financeiro/parcelas'>
              <TrendingUp className='h-4 w-4 mr-2' />
              Ver Todas as Parcelas
            </Link>
          </Button>
          <Button variant='outline' size='sm' asChild>
            <Link to='/financeiro/custos'>
              <TrendingDown className='h-4 w-4 mr-2' />
              Ver Todos os Custos
            </Link>
          </Button>
          <Button variant='outline' size='sm' asChild>
            <Link to='/financeiro/resumo'>
              <BarChart3 className='h-4 w-4 mr-2' />
              Relatório Completo
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
