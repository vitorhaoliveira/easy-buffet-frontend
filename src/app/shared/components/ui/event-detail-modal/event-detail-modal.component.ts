import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LucideAngularModule, X, Calendar, Clock, MapPin, Users, Package, User, Building2 } from 'lucide-angular'
import { ButtonComponent } from '../button/button.component'
import type { Event } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-event-detail-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="handleBackdropClick($event)">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
            <h2 class="text-2xl font-bold text-gray-900">Detalhes do Evento</h2>
            <button 
              appButton
              variant="ghost"
              size="sm"
              (click)="onClose.emit()"
            >
              <lucide-icon [img]="XIcon" class="h-5 w-5"></lucide-icon>
            </button>
          </div>

          <!-- Content -->
          @if (event) {
            <div class="p-6 space-y-6">
          <!-- Event Name and Status -->
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ event.name }}</h3>
              <span [class]="'px-3 py-1 rounded-full text-xs font-medium ' + getStatusColor(event.status)">
                {{ event.status }}
              </span>
            </div>
            @if (event.unit) {
              <div class="flex items-center gap-2">
                <div 
                  class="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  [style.backgroundColor]="event.unit.color || '#6c757d'"
                ></div>
                <span class="text-sm font-medium text-gray-700">
                  {{ event.unit.code || event.unit.name }}
                </span>
              </div>
            }
          </div>

          <!-- Event Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Date -->
            <div class="flex items-start gap-3">
              <div class="bg-blue-100 p-2 rounded-lg">
                <lucide-icon [img]="CalendarIcon" class="h-5 w-5 text-blue-600"></lucide-icon>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Data do Evento</p>
                <p class="text-base font-semibold text-gray-900">{{ formatDate(event.eventDate) }}</p>
              </div>
            </div>

            <!-- Time -->
            <div class="flex items-start gap-3">
              <div class="bg-purple-100 p-2 rounded-lg">
                <lucide-icon [img]="ClockIcon" class="h-5 w-5 text-purple-600"></lucide-icon>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Horário</p>
                <p class="text-base font-semibold text-gray-900">{{ formatTime(event.eventTime) }}</p>
              </div>
            </div>

            <!-- Location (unit) -->
            <div class="flex items-start gap-3">
              <div class="bg-green-100 p-2 rounded-lg">
                <lucide-icon [img]="MapPinIcon" class="h-5 w-5 text-green-600"></lucide-icon>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Local</p>
                <p class="text-base font-semibold text-gray-900">{{ event.unit?.name || 'Não informado' }}</p>
              </div>
            </div>

            <!-- Guest Count -->
            <div class="flex items-start gap-3">
              <div class="bg-orange-100 p-2 rounded-lg">
                <lucide-icon [img]="UsersIcon" class="h-5 w-5 text-orange-600"></lucide-icon>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Número de Convidados</p>
                <p class="text-base font-semibold text-gray-900">{{ event.guestCount }}</p>
              </div>
            </div>
          </div>

          <!-- Unit Information -->
          @if (event.unit) {
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-start gap-3">
                <div class="bg-indigo-100 p-2 rounded-lg">
                  <lucide-icon [img]="Building2Icon" class="h-5 w-5 text-indigo-600"></lucide-icon>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Unidade</p>
                  <div class="flex items-center gap-2">
                    <div 
                      class="w-3 h-3 rounded-full"
                      [style.backgroundColor]="event.unit.color || '#6c757d'"
                    ></div>
                    <p class="text-base font-semibold text-gray-900">
                      {{ event.unit.name }}
                      @if (event.unit.code) {
                        <span class="text-sm text-gray-600">({{ event.unit.code }})</span>
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Client Information -->
          @if (event.client) {
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-start gap-3">
                <div class="bg-cyan-100 p-2 rounded-lg">
                  <lucide-icon [img]="UserIcon" class="h-5 w-5 text-cyan-600"></lucide-icon>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Cliente</p>
                  <p class="text-base font-semibold text-gray-900">{{ event.client.name }}</p>
                  @if (event.client.email) {
                    <p class="text-sm text-gray-600 mt-1">{{ event.client.email }}</p>
                  }
                  @if (event.client.phone) {
                    <p class="text-sm text-gray-600">{{ event.client.phone }}</p>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Package Information -->
          @if (event.package) {
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-start gap-3">
                <div class="bg-amber-100 p-2 rounded-lg">
                  <lucide-icon [img]="PackageIcon" class="h-5 w-5 text-amber-600"></lucide-icon>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Pacote</p>
                  <p class="text-base font-semibold text-gray-900">{{ event.package.name }}</p>
                  @if (event.package.type) {
                    <p class="text-sm text-gray-600 mt-1">Tipo: {{ event.package.type }}</p>
                  }
                  @if (event.package.price) {
                    <p class="text-sm text-gray-600">Valor: {{ formatCurrency(event.package.price) }}</p>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Notes -->
          @if (event.notes) {
            <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p class="text-sm font-medium text-gray-600 mb-2">Observações</p>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ event.notes }}</p>
            </div>
          }

          <!-- Metadata -->
          <div class="pt-4 border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <span class="font-medium">Criado em:</span> {{ formatDate(event.createdAt) }}
              </div>
              @if (event.updatedAt) {
                <div>
                  <span class="font-medium">Atualizado em:</span> {{ formatDate(event.updatedAt) }}
                </div>
              }
            </div>
          </div>
            </div>
          }

          <!-- Loading State -->
          @if (!event && isLoading) {
            <div class="p-6 text-center">
              <p class="text-gray-500">Carregando detalhes do evento...</p>
            </div>
          }

          <!-- Error State -->
          @if (!event && !isLoading && error) {
            <div class="p-6 text-center">
              <p class="text-red-500">{{ error }}</p>
            </div>
          }

          <!-- Footer -->
          @if (event) {
            <div class="sticky bottom-0 bg-white border-t p-6 flex items-center justify-end gap-3">
              <button
                appButton
                variant="outline"
                (click)="onClose.emit()"
              >
                Fechar
              </button>
              <button
                appButton
                variant="default"
                (click)="onEdit.emit()"
              >
                Editar Evento
              </button>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class EventDetailModalComponent {
  @Input() isOpen: boolean = false
  @Input() event: Event | null = null
  @Input() isLoading: boolean = false
  @Input() error: string | null = null
  
  @Output() onClose = new EventEmitter<void>()
  @Output() onEdit = new EventEmitter<void>()

  readonly XIcon = X
  readonly CalendarIcon = Calendar
  readonly ClockIcon = Clock
  readonly MapPinIcon = MapPin
  readonly UsersIcon = Users
  readonly PackageIcon = Package
  readonly UserIcon = User
  readonly Building2Icon = Building2

  /**
   * @Function - handleBackdropClick
   * @description - Close modal when clicking on backdrop
   * @author - Vitor Hugo
   * @param - event: MouseEvent
   * @returns - void
   */
  handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose.emit()
    }
  }

  /**
   * @Function - formatDate
   * @description - Format date string to Brazilian format
   * @author - Vitor Hugo
   * @param - dateString: string
   * @returns - string - Formatted date
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  /**
   * @Function - formatTime
   * @description - Format time string to readable format (HH:mm)
   * @author - Vitor Hugo
   * @param - timeString: string
   * @returns - string - Formatted time
   */
  formatTime(timeString: string): string {
    if (!timeString) return 'Não informado'
    
    // If already in HH:mm format, return as is
    if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString
    }
    
    // If it's an ISO date string (contains 'T')
    if (timeString.includes('T')) {
      try {
        const date = new Date(timeString)
        // Check if date is valid (not 1970-01-01 which indicates invalid date)
        if (date.getFullYear() === 1970) {
          // Try to extract time from string directly
          const timeMatch = timeString.match(/T(\d{2}):(\d{2})/)
          if (timeMatch) {
            return `${timeMatch[1]}:${timeMatch[2]}`
          }
          return 'Não informado'
        }
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
      } catch {
        // If parsing fails, try to extract time from string
        const timeMatch = timeString.match(/T(\d{2}):(\d{2})/)
        if (timeMatch) {
          return `${timeMatch[1]}:${timeMatch[2]}`
        }
      }
    }
    
    // If it's in HH:mm:ss format, extract HH:mm
    if (timeString.match(/^\d{2}:\d{2}:\d{2}/)) {
      const parts = timeString.split(':')
      return `${parts[0]}:${parts[1]}`
    }
    
    // If it's in HH:mm format, return as is
    if (timeString.match(/^\d{2}:\d{2}/)) {
      return timeString.substring(0, 5)
    }
    
    return 'Não informado'
  }

  /**
   * @Function - formatCurrency
   * @description - Format currency value
   * @author - Vitor Hugo
   * @param - value: number | string
   * @returns - string - Formatted currency value
   */
  formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : (value || 0)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue)
  }

  /**
   * @Function - getStatusColor
   * @description - Get status badge color
   * @author - Vitor Hugo
   * @param - status: string
   * @returns - string - CSS classes for status
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Pago': 'bg-green-100 text-green-800',
      'Atrasado': 'bg-red-100 text-red-800',
      'Confirmado': 'bg-green-100 text-green-800',
      'Preparação': 'bg-blue-100 text-blue-800',
      'Concluído': 'bg-purple-100 text-purple-800',
      'Cancelado': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
}

