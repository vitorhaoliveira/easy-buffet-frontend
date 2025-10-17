import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/data-table/table'
import { getDashboardData } from './mockData'
import { type UpcomingEvent } from './types'
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getUpcomingInstallments7Days,
  getUpcomingInstallments30Days,
  getOverdueInstallments,
  getUpcomingEvents,
  getInstallmentStatusColor,
  getEventStatusColor,
  getEventStatusText
} from './utils'

// Componente de Calendário
interface CalendarComponentProps {
  events: UpcomingEvent[]
}

function CalendarComponent({ events }: CalendarComponentProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Primeiro dia do mês
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  // Nomes dos dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  // Nomes dos meses
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  
  // Função para obter eventos de um dia específico
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    return events.filter(event => event.eventDate === dateStr)
  }
  
  // Função para navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  // Gerar array de dias do mês
  const days = []
  
  // Dias vazios do início do mês
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }
  
  return (
    <div className="w-full">
      {/* Header do calendário */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h4>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Grid do calendário */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isToday = day === today.getDate() && 
                         month === today.getMonth() && 
                         year === today.getFullYear()
          const dayEvents = day ? getEventsForDay(day) : []
          
          return (
            <div
              key={index}
              className={`min-h-[80px] p-1 border rounded-md ${
                day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
              } ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            >
              {day && (
                <div className="space-y-1">
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`text-xs p-1 rounded truncate ${
                          event.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : event.status === 'preparation'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                        title={event.eventName}
                      >
                        {event.eventName}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Legenda */}
      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span className="text-sm text-muted-foreground">Confirmado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span className="text-sm text-muted-foreground">Preparação</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-100 rounded"></div>
          <span className="text-sm text-muted-foreground">Pendente</span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [installmentLimit, setInstallmentLimit] = useState(5)
  
  const dashboardData = useMemo(() => getDashboardData(), [])
  const { stats, upcomingInstallments, upcomingEvents } = dashboardData

  // Filtrar parcelas baseado no limite selecionado
  const displayInstallments = useMemo(() => {
    const upcoming7Days = getUpcomingInstallments7Days(upcomingInstallments)
    const upcoming30Days = getUpcomingInstallments30Days(upcomingInstallments)
    const overdue = getOverdueInstallments(upcomingInstallments)
    
    return [...overdue, ...upcoming7Days, ...upcoming30Days].slice(0, installmentLimit)
  }, [upcomingInstallments, installmentLimit])

  // Filtrar eventos próximos
  const displayEvents = useMemo(() => {
    return getUpcomingEvents(upcomingEvents).slice(0, 6)
  }, [upcomingEvents])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do seu negócio de buffet
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Parcelas a Vencer (7 dias) */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Parcelas (7 dias)</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.upcomingInstallments7Days}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>

        {/* Parcelas a Vencer (30 dias) */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Parcelas (30 dias)</p>
              <p className="text-2xl font-bold text-blue-800">{stats.upcomingInstallments30Days}</p>
            </div>
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Parcelas Atrasadas */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Atrasadas</p>
              <p className="text-2xl font-bold text-red-800">{stats.overdueInstallments}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>

        {/* Receita do Mês */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Receita do Mês</p>
              <p className="text-2xl font-bold text-green-800">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>

        {/* Eventos Próximos */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Eventos (30 dias)</p>
              <p className="text-2xl font-bold text-purple-800">{stats.upcomingEvents}</p>
            </div>
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Calendário de Eventos */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendário de Eventos
        </h3>
        <CalendarComponent events={upcomingEvents} />
      </div>

      {/* Grid de Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela de Próximas Parcelas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Parcelas
            </h3>
            <select
              value={installmentLimit}
              onChange={(e) => setInstallmentLimit(Number(e.target.value))}
              className="flex h-8 w-20 items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayInstallments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell className="font-medium">{installment.clientName}</TableCell>
                    <TableCell>{installment.eventName}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(installment.amount)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(installment.dueDate)}</div>
                        <div className="text-muted-foreground">{formatRelativeDate(installment.dueDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getInstallmentStatusColor(installment.status)}`}>
                        {installment.status === 'pending' ? 'Pendente' : 'Atrasada'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {displayInstallments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                      Nenhuma parcela encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Lista de Eventos Próximos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Eventos Próximos
          </h3>
          
          <div className="space-y-3">
            {displayEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <div className="font-medium">{event.eventName}</div>
                      <div className="text-muted-foreground">{event.clientName}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(event.eventDate)} • {formatRelativeDate(event.eventDate)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getEventStatusColor(event.status)}`}>
                    {getEventStatusText(event.status)}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/cadastros/eventos/editar/${event.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            {displayEvents.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Nenhum evento próximo encontrado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" asChild className="h-auto p-4">
            <Link to="/cadastros/contratos/novo">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Novo Contrato</div>
                  <div className="text-xs text-muted-foreground">Criar contrato</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-auto p-4">
            <Link to="/financeiro/parcelas/nova">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Nova Parcela</div>
                  <div className="text-xs text-muted-foreground">Registrar pagamento</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-auto p-4">
            <Link to="/cadastros/eventos/novo">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Novo Evento</div>
                  <div className="text-xs text-muted-foreground">Agendar evento</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-auto p-4">
            <Link to="/financeiro/relatorio">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Ver Relatórios</div>
                  <div className="text-xs text-muted-foreground">Análise financeira</div>
                </div>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}