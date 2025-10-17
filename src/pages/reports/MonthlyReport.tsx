import { useState, useEffect, useMemo } from 'react'
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, BarChart3, Filter } from 'lucide-react'
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
import { 
  calculateMonthlyReport, 
  getPaidInstallmentsForMonth, 
  getCostsForMonth,
  prepareCSVExportData,
  formatDataForCSV,
  downloadCSV
} from './utils'
import { type MonthlyReport, type ReportInstallment, type ReportCost } from './types'

export default function MonthlyReport() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [installments, setInstallments] = useState<ReportInstallment[]>([])
  const [costs, setCosts] = useState<ReportCost[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Estados para filtros
  const [revenueSearchTerm, setRevenueSearchTerm] = useState('')
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState('todos')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')

  // Atualizar relatório quando mês/ano mudarem
  useEffect(() => {
    setIsLoading(true)
    
    // Simular carregamento
    setTimeout(() => {
      const monthlyReport = calculateMonthlyReport(selectedMonth, selectedYear)
      const monthlyInstallments = getPaidInstallmentsForMonth(selectedMonth, selectedYear)
      const monthlyCosts = getCostsForMonth(selectedMonth, selectedYear)
      
      setReport(monthlyReport)
      setInstallments(monthlyInstallments)
      setCosts(monthlyCosts)
      setIsLoading(false)
    }, 300)
  }, [selectedMonth, selectedYear])

  // Resetar filtros quando mudar o período
  useEffect(() => {
    setRevenueSearchTerm('')
    setExpenseSearchTerm('')
    setSelectedClient('todos')
    setSelectedCategory('todos')
    setMinValue('')
    setMaxValue('')
  }, [selectedMonth, selectedYear])

  // Dados filtrados para receitas
  const filteredInstallments = useMemo(() => {
    return installments.filter(installment => {
      const matchesSearch = installment.clientName.toLowerCase().includes(revenueSearchTerm.toLowerCase()) ||
                           installment.eventName.toLowerCase().includes(revenueSearchTerm.toLowerCase())
      
      const matchesClient = selectedClient === 'todos' || installment.clientName === selectedClient
      
      const minAmount = minValue ? parseFloat(minValue) : 0
      const maxAmount = maxValue ? parseFloat(maxValue) : Infinity
      const matchesValue = installment.amount >= minAmount && installment.amount <= maxAmount
      
      return matchesSearch && matchesClient && matchesValue
    })
  }, [installments, revenueSearchTerm, selectedClient, minValue, maxValue])

  // Dados filtrados para despesas
  const filteredCosts = useMemo(() => {
    return costs.filter(cost => {
      const matchesSearch = cost.eventName.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
                           cost.description.toLowerCase().includes(expenseSearchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'todos' || cost.category === selectedCategory
      
      const minAmount = minValue ? parseFloat(minValue) : 0
      const maxAmount = maxValue ? parseFloat(maxValue) : Infinity
      const matchesValue = cost.amount >= minAmount && cost.amount <= maxAmount
      
      return matchesSearch && matchesCategory && matchesValue
    })
  }, [costs, expenseSearchTerm, selectedCategory, minValue, maxValue])

  // Lista única de clientes para o filtro
  const uniqueClients = useMemo(() => {
    const clients = [...new Set(installments.map(i => i.clientName))]
    return clients.sort()
  }, [installments])

  // Lista única de categorias para o filtro
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(costs.map(c => c.category))]
    return categories.sort()
  }, [costs])

  // KPIs recalculados baseados nos dados filtrados
  const filteredKPIs = useMemo(() => {
    const filteredRevenue = filteredInstallments.reduce((sum, installment) => sum + installment.amount, 0)
    const filteredExpenses = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0)
    const filteredCommissions = filteredInstallments.reduce((sum, installment) => sum + installment.commissionAmount, 0)
    const filteredNetProfit = filteredRevenue - filteredExpenses - filteredCommissions

    return {
      revenue: filteredRevenue,
      expenses: filteredExpenses,
      commissions: filteredCommissions,
      netProfit: filteredNetProfit,
      paidInstallments: filteredInstallments.length,
      totalCosts: filteredCosts.length
    }
  }, [filteredInstallments, filteredCosts])

  const handleExportCSV = () => {
    const exportData = prepareCSVExportData(selectedMonth, selectedYear)
    const csvContent = formatDataForCSV(exportData)
    const filename = `relatorio_${selectedMonth.toString().padStart(2, '0')}_${selectedYear}.csv`
    
    downloadCSV(csvContent, filename)
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

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return months[month - 1]
  }

  const getCategoryName = (category: string) => {
    const categories = {
      food: 'Alimentação',
      staff: 'Equipe',
      equipment: 'Equipamentos',
      transport: 'Transporte',
      other: 'Outros'
    }
    return categories[category as keyof typeof categories] || category
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando relatório...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar relatório.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatório Mensal</h1>
          <p className="text-muted-foreground">
            Análise financeira detalhada do período selecionado
          </p>
        </div>
        <Button variant='outline' onClick={handleExportCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Período:</span>
        </div>
        
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="flex h-10 w-32 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {getMonthName(i + 1)}
            </option>
          ))}
        </select>
        
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="flex h-10 w-24 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = currentDate.getFullYear() - 2 + i
            return (
              <option key={year} value={year}>
                {year}
              </option>
            )
          })}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Receitas</p>
              <p className="text-lg font-bold text-green-800">{formatCurrency(filteredKPIs.revenue)}</p>
              <p className="text-xs text-green-600">
                {filteredKPIs.paidInstallments}/{report.paidInstallments} parcelas pagas
                {filteredKPIs.paidInstallments !== report.paidInstallments && (
                  <span className="ml-1 text-orange-600">(filtrado)</span>
                )}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Despesas</p>
              <p className="text-lg font-bold text-red-800">{formatCurrency(filteredKPIs.expenses)}</p>
              <p className="text-xs text-red-600">
                {filteredKPIs.totalCosts}/{costs.length} custos registrados
                {filteredKPIs.totalCosts !== costs.length && (
                  <span className="ml-1 text-orange-600">(filtrado)</span>
                )}
              </p>
            </div>
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Comissões</p>
              <p className="text-lg font-bold text-orange-800">{formatCurrency(filteredKPIs.commissions)}</p>
              <p className="text-xs text-orange-600">{(report.commissionRate * 100).toFixed(1)}% sobre receitas</p>
            </div>
            <DollarSign className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Lucro Líquido</p>
              <p className={`text-lg font-bold ${filteredKPIs.netProfit >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                {formatCurrency(filteredKPIs.netProfit)}
              </p>
              <p className="text-xs text-blue-600">
                {filteredKPIs.revenue > 0 ? ((filteredKPIs.netProfit / filteredKPIs.revenue) * 100).toFixed(1) : 0}% margem
                {(filteredKPIs.revenue !== report.revenue || filteredKPIs.expenses !== report.expenses) && (
                  <span className="ml-1 text-orange-600">(filtrado)</span>
                )}
              </p>
            </div>
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Indicador de Filtros Ativos */}
      {(revenueSearchTerm || expenseSearchTerm || selectedClient !== 'todos' || selectedCategory !== 'todos' || minValue || maxValue) && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Filtros Ativos</span>
            <span className="text-xs text-blue-600">
              Os KPIs acima refletem apenas os dados filtrados
            </span>
          </div>
        </div>
      )}

      {/* Filtros Globais */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros por Valor</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Valor Mínimo:</label>
            <input
              type="number"
              placeholder="0"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              className="flex h-8 w-24 items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Valor Máximo:</label>
            <input
              type="number"
              placeholder="∞"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              className="flex h-8 w-24 items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinValue('')
              setMaxValue('')
              setRevenueSearchTerm('')
              setExpenseSearchTerm('')
              setSelectedClient('todos')
              setSelectedCategory('todos')
            }}
          >
            Limpar Todos os Filtros
          </Button>
        </div>
      </div>

      {/* Tabelas Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Receitas ({filteredInstallments.length}/{installments.length})
            </h3>
          </div>
          
          {/* Filtros para Receitas */}
          <div className="space-y-3">
            <SearchBar
              placeholder="Buscar por cliente ou evento..."
              value={revenueSearchTerm}
              onChange={setRevenueSearchTerm}
            />
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Cliente:</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="flex h-8 w-48 items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="todos">Todos os clientes</option>
                {uniqueClients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data Pag.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell className="font-medium">{installment.clientName}</TableCell>
                    <TableCell>{installment.eventName}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(installment.amount)}
                    </TableCell>
                    <TableCell>{formatDate(installment.paymentDate)}</TableCell>
                  </TableRow>
                ))}
                {filteredInstallments.length === 0 && installments.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      Nenhuma receita encontrada com os filtros aplicados
                    </TableCell>
                  </TableRow>
                )}
                {installments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      Nenhuma receita registrada neste período
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Despesas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Despesas ({filteredCosts.length}/{costs.length})
            </h3>
          </div>
          
          {/* Filtros para Despesas */}
          <div className="space-y-3">
            <SearchBar
              placeholder="Buscar por evento ou descrição..."
              value={expenseSearchTerm}
              onChange={setExpenseSearchTerm}
            />
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Categoria:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-8 w-48 items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="todos">Todas as categorias</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell className="font-medium">{cost.eventName}</TableCell>
                    <TableCell>{cost.description}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                        {getCategoryName(cost.category)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-red-600">
                      {formatCurrency(cost.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCosts.length === 0 && costs.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      Nenhuma despesa encontrada com os filtros aplicados
                    </TableCell>
                  </TableRow>
                )}
                {costs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      Nenhuma despesa registrada neste período
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Resumo Final */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Resumo do Período</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Período</p>
            <p className="font-medium">{getMonthName(selectedMonth)} de {selectedYear}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total de Parcelas</p>
            <p className="font-medium">{report.totalInstallments}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Parcelas Pagas</p>
            <p className="font-medium text-green-600">{report.paidInstallments}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Taxa de Comissão</p>
            <p className="font-medium">{(report.commissionRate * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
