import { type MonthlyReport, type ReportInstallment, type ReportCost, type CSVExportData } from './types'
import { 
  calculateMonthlyReportFromMock, 
  getPaidInstallmentsForMonthFromMock, 
  getCostsForMonthFromMock 
} from './mockData'

// Função para calcular relatório mensal
export const calculateMonthlyReport = (month: number, year: number): MonthlyReport => {
  return calculateMonthlyReportFromMock(month, year)
}

// Função para obter parcelas pagas do mês para relatório detalhado
export const getPaidInstallmentsForMonth = (month: number, year: number): ReportInstallment[] => {
  return getPaidInstallmentsForMonthFromMock(month, year)
}

// Função para obter custos do mês para relatório detalhado
export const getCostsForMonth = (month: number, year: number): ReportCost[] => {
  return getCostsForMonthFromMock(month, year)
}

// Função para preparar dados para exportação CSV
export const prepareCSVExportData = (month: number, year: number): CSVExportData => {
  const summary = calculateMonthlyReport(month, year)
  const revenue = getPaidInstallmentsForMonth(month, year)
  const expenses = getCostsForMonth(month, year)

  return {
    revenue,
    expenses,
    summary
  }
}

// Função para formatar dados para CSV
export const formatDataForCSV = (data: CSVExportData): string => {
  const { summary, revenue, expenses } = data
  
  let csv = 'Relatório Mensal - EasyBuffet\n'
  csv += `Mês/Ano: ${summary.month}/${summary.year}\n\n`
  
  // Resumo
  csv += 'RESUMO FINANCEIRO\n'
  csv += 'Receitas,R$ ' + summary.revenue.toFixed(2) + '\n'
  csv += 'Despesas,R$ ' + summary.expenses.toFixed(2) + '\n'
  csv += 'Comissões,R$ ' + summary.commissions.toFixed(2) + '\n'
  csv += 'Lucro Líquido,R$ ' + summary.netProfit.toFixed(2) + '\n\n'
  
  // Receitas detalhadas
  csv += 'RECEITAS DETALHADAS\n'
  csv += 'Cliente,Evento,Valor,Data Pagamento,Comissão\n'
  revenue.forEach(item => {
    csv += `"${item.clientName}","${item.eventName}",R$ ${item.amount.toFixed(2)},"${new Date(item.paymentDate).toLocaleDateString('pt-BR')}",R$ ${item.commissionAmount.toFixed(2)}\n`
  })
  
  csv += '\n'
  
  // Despesas detalhadas
  csv += 'DESPESAS DETALHADAS\n'
  csv += 'Evento,Descrição,Categoria,Valor,Data\n'
  expenses.forEach(item => {
    csv += `"${item.eventName}","${item.description}","${item.category}",R$ ${item.amount.toFixed(2)},"${new Date(item.createdAt).toLocaleDateString('pt-BR')}"\n`
  })
  
  return csv
}

// Função para baixar CSV
export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
