import { useState, useMemo } from 'react'
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { mockInstallments, mockCosts, calculateFinancialSummary } from './mockData'

export default function FinancialSummary() {
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

  const summary = useMemo(() => {
    return calculateFinancialSummary(mockInstallments, mockCosts, filterMonth, filterYear)
  }, [filterMonth, filterYear])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  const handleExportReport = () => {
    // Implementar lógica de exportação
    console.log('Exportar relatório')
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' asChild>
            <a href='/financeiro'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </a>
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Resumo Financeiro</h1>
            <p className='text-muted-foreground'>
              Relatório consolidado de entradas e saídas
            </p>
          </div>
        </div>
        <Button variant='outline' onClick={handleExportReport}>
          <Download className='mr-2 h-4 w-4' />
          Exportar Relatório
        </Button>
      </div>

      {/* Filtros */}
      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-2'>
          <Calendar className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>Período:</span>
        </div>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(Number(e.target.value))}
          className='flex h-10 w-32 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {months.map((month, index) => (
            <option key={index + 1} value={index + 1}>{month}</option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))}
          className='flex h-10 w-24 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Cards de Resumo */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {/* Entradas */}
        <div className='bg-green-50 p-6 rounded-lg border border-green-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-green-600'>Entradas</p>
              <p className='text-2xl font-bold text-green-800'>{formatCurrency(summary.totalIncome)}</p>
            </div>
            <div className='text-3xl text-green-600'>
              <TrendingUp className='h-8 w-8' />
            </div>
          </div>
          <div className='mt-2 text-sm text-green-600'>
            <span className='font-medium'>{summary.paidInstallments}</span> parcelas pagas
          </div>
        </div>

        {/* Saídas */}
        <div className='bg-red-50 p-6 rounded-lg border border-red-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-red-600'>Saídas</p>
              <p className='text-2xl font-bold text-red-800'>{formatCurrency(summary.totalExpenses)}</p>
            </div>
            <div className='text-3xl text-red-600'>
              <TrendingDown className='h-8 w-8' />
            </div>
          </div>
          <div className='mt-2 text-sm text-red-600'>
            Custos operacionais
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className={`p-6 rounded-lg border ${
          summary.netProfit >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className='flex items-center justify-between'>
            <div>
              <p className={`text-sm font-medium ${
                summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                Lucro Líquido
              </p>
              <p className={`text-2xl font-bold ${
                summary.netProfit >= 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                {formatCurrency(summary.netProfit)}
              </p>
            </div>
            <div className={`text-3xl ${
              summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {summary.netProfit >= 0 ? (
                <TrendingUp className='h-8 w-8' />
              ) : (
                <TrendingDown className='h-8 w-8' />
              )}
            </div>
          </div>
          <div className={`mt-2 text-sm ${
            summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {summary.netProfit >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
          </div>
        </div>

        {/* Status das Parcelas */}
        <div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Status Parcelas</p>
              <div className='mt-2 space-y-1'>
                <div className='flex justify-between text-sm'>
                  <span className='text-green-600'>Pagas:</span>
                  <span className='font-medium'>{summary.paidInstallments}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-yellow-600'>Pendentes:</span>
                  <span className='font-medium'>{summary.pendingInstallments}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-red-600'>Vencidas:</span>
                  <span className='font-medium'>{summary.overdueInstallments}</span>
                </div>
              </div>
            </div>
            <div className='text-3xl text-gray-600'>
              <DollarSign className='h-8 w-8' />
            </div>
          </div>
        </div>
      </div>

      {/* Detalhamento */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Resumo de Entradas */}
        <div className='bg-white p-6 rounded-lg border shadow-sm'>
          <h3 className='text-lg font-semibold text-green-800 mb-4 flex items-center'>
            <TrendingUp className='h-5 w-5 mr-2' />
            Detalhamento das Entradas
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between items-center py-2 border-b border-gray-100'>
              <span className='text-sm text-gray-600'>Total Recebido:</span>
              <span className='font-semibold text-green-600'>
                {formatCurrency(summary.totalIncome)}
              </span>
            </div>
            <div className='flex justify-between items-center py-2 border-b border-gray-100'>
              <span className='text-sm text-gray-600'>Parcelas Pagas:</span>
              <span className='font-semibold'>{summary.paidInstallments}</span>
            </div>
            <div className='flex justify-between items-center py-2 border-b border-gray-100'>
              <span className='text-sm text-gray-600'>Parcelas Pendentes:</span>
              <span className='font-semibold'>{summary.pendingInstallments}</span>
            </div>
            <div className='flex justify-between items-center py-2'>
              <span className='text-sm text-gray-600'>Parcelas Vencidas:</span>
              <span className='font-semibold'>{summary.overdueInstallments}</span>
            </div>
          </div>
        </div>

        {/* Resumo de Saídas */}
        <div className='bg-white p-6 rounded-lg border shadow-sm'>
          <h3 className='text-lg font-semibold text-red-800 mb-4 flex items-center'>
            <TrendingDown className='h-5 w-5 mr-2' />
            Detalhamento das Saídas
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between items-center py-2 border-b border-gray-100'>
              <span className='text-sm text-gray-600'>Total de Custos:</span>
              <span className='font-semibold text-red-600'>
                {formatCurrency(summary.totalExpenses)}
              </span>
            </div>
            <div className='flex justify-between items-center py-2 border-b border-gray-100'>
              <span className='text-sm text-gray-600'>Despesas Registradas:</span>
              <span className='font-semibold'>
                {mockCosts.filter(cost => {
                  const costDate = new Date(cost.createdAt)
                  return costDate.getMonth() + 1 === filterMonth && 
                         costDate.getFullYear() === filterYear
                }).length}
              </span>
            </div>
            <div className='flex justify-between items-center py-2 border-b border-gray-100'>
              <span className='text-sm text-gray-600'>Custo Médio por Evento:</span>
              <span className='font-semibold'>
                {formatCurrency(summary.totalExpenses / Math.max(1, mockCosts.filter(cost => {
                  const costDate = new Date(cost.createdAt)
                  return costDate.getMonth() + 1 === filterMonth && 
                         costDate.getFullYear() === filterYear
                }).length))}
              </span>
            </div>
            <div className='flex justify-between items-center py-2'>
              <span className='text-sm text-gray-600'>Margem de Lucro:</span>
              <span className={`font-semibold ${
                summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.totalIncome > 0 
                  ? `${((summary.netProfit / summary.totalIncome) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resultado Final */}
      <div className={`p-6 rounded-lg border ${
        summary.netProfit >= 0 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className='text-center'>
          <h3 className={`text-xl font-semibold mb-2 ${
            summary.netProfit >= 0 ? 'text-green-800' : 'text-red-800'
          }`}>
            {summary.netProfit >= 0 ? '📈 Resultado Positivo' : '📉 Resultado Negativo'}
          </h3>
          <div className={`text-4xl font-bold mb-2 ${
            summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(summary.netProfit)}
          </div>
          <p className={`text-sm ${
            summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {summary.netProfit >= 0 
              ? `Lucro líquido de ${formatCurrency(summary.netProfit)} no período de ${months[filterMonth - 1]} ${filterYear}` 
              : `Prejuízo de ${formatCurrency(Math.abs(summary.netProfit))} no período de ${months[filterMonth - 1]} ${filterYear}`
            }
          </p>
        </div>
      </div>
    </div>
  )
}
