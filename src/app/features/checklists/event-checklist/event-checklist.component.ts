import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { 
  LucideAngularModule, 
  Check, 
  Circle, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  User
} from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { ChecklistService } from '@core/services/checklist.service'
import type { 
  EventChecklist, 
  EventChecklistItem, 
  ChecklistTemplate,
  ChecklistPhase,
  ChecklistItemPriority
} from '@shared/models/api.types'

@Component({
  selector: 'app-event-checklist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ConfirmationModalComponent,
    SkeletonComponent
  ],
  templateUrl: './event-checklist.component.html'
})
export class EventChecklistComponent implements OnInit {
  @Input() eventId!: string
  @Input() eventDate!: string
  @Output() checklistUpdated = new EventEmitter<EventChecklist>()

  readonly CheckIcon = Check
  readonly CircleIcon = Circle
  readonly PlusIcon = Plus
  readonly Trash2Icon = Trash2
  readonly ChevronDownIcon = ChevronDown
  readonly ChevronUpIcon = ChevronUp
  readonly AlertCircleIcon = AlertCircle
  readonly ClockIcon = Clock
  readonly CheckCircle2Icon = CheckCircle2
  readonly UserIcon = User

  checklist: EventChecklist | null = null
  templates: ChecklistTemplate[] = []
  isLoading = true
  error = ''
  
  // UI State
  expandedPhases: Record<ChecklistPhase, boolean> = {
    'pre-event': true,
    'event-day': true,
    'post-event': false
  }
  
  showAddItemForm = false
  showTemplateSelector = false
  selectedTemplateId = ''
  
  // Delete modal state
  showDeleteModal = false
  itemToDelete: EventChecklistItem | null = null
  isDeleting = false
  
  // New item form
  newItem = {
    title: '',
    description: '',
    phase: 'pre-event' as ChecklistPhase,
    priority: 'medium' as ChecklistItemPriority,
    responsibleRole: ''
  }

  phases: ChecklistPhase[] = ['pre-event', 'event-day', 'post-event']

  phaseLabels: Record<ChecklistPhase, string> = {
    'pre-event': 'Pré-evento',
    'event-day': 'Dia do Evento',
    'post-event': 'Pós-evento'
  }

  priorityLabels: Record<ChecklistItemPriority, string> = {
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta',
    'critical': 'Crítica'
  }

  responsibleRoles = [
    'Cozinha',
    'Decoração',
    'Logística',
    'Atendimento',
    'Limpeza',
    'Coordenação',
    'Outro'
  ]

  constructor(private checklistService: ChecklistService) {}

  async ngOnInit(): Promise<void> {
    await this.loadChecklist()
  }

  /**
   * @Function - loadChecklist
   * @description - Loads the event checklist or shows template selector if none exists
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadChecklist(): Promise<void> {
    this.isLoading = true
    this.error = ''

    try {
      const response = await firstValueFrom(
        this.checklistService.getEventChecklist(this.eventId)
      )
      
      if (response.success && response.data) {
        this.checklist = response.data
      } else {
        // No checklist exists, load templates
        await this.loadTemplates()
        this.showTemplateSelector = true
      }
    } catch (err: any) {
      if (err.status === 404) {
        await this.loadTemplates()
        this.showTemplateSelector = true
      } else {
        this.error = err.message || 'Erro ao carregar checklist'
      }
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - loadTemplates
   * @description - Loads available checklist templates
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadTemplates(): Promise<void> {
    try {
      const response = await firstValueFrom(this.checklistService.getTemplates())
      if (response.success && response.data) {
        this.templates = response.data.filter(t => t.isActive)
      }
    } catch (err: any) {
      console.error('Error loading templates:', err)
    }
  }

  /**
   * @Function - createFromTemplate
   * @description - Creates a checklist from selected template
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async createFromTemplate(): Promise<void> {
    if (!this.selectedTemplateId) return

    try {
      const response = await firstValueFrom(
        this.checklistService.createEventChecklist({
          eventId: this.eventId,
          templateId: this.selectedTemplateId
        })
      )
      
      if (response.success && response.data) {
        this.checklist = response.data
        this.showTemplateSelector = false
        this.checklistUpdated.emit(this.checklist)
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao criar checklist'
    }
  }

  /**
   * @Function - createEmptyChecklist
   * @description - Creates an empty checklist without template
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async createEmptyChecklist(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.checklistService.createEventChecklist({
          eventId: this.eventId
        })
      )
      
      if (response.success && response.data) {
        this.checklist = response.data
        this.showTemplateSelector = false
        this.showAddItemForm = true
        this.checklistUpdated.emit(this.checklist)
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao criar checklist'
    }
  }

  /**
   * @Function - toggleItem
   * @description - Toggles the completion status of a checklist item
   * @author - Vitor Hugo
   * @param - item: EventChecklistItem
   * @returns - Promise<void>
   */
  async toggleItem(item: EventChecklistItem): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.checklistService.toggleChecklistItem(this.eventId, item.id, {
          isCompleted: !item.isCompleted
        })
      )
      
      if (response.success && response.data) {
        // Update local state
        const index = this.checklist!.items.findIndex(i => i.id === item.id)
        if (index !== -1) {
          this.checklist!.items[index] = response.data
          this.updateProgress()
        }
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao atualizar item'
    }
  }

  /**
   * @Function - addItem
   * @description - Adds a new item to the checklist
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async addItem(): Promise<void> {
    if (!this.newItem.title.trim()) return

    try {
      const response = await firstValueFrom(
        this.checklistService.addEventChecklistItem(this.eventId, {
          title: this.newItem.title,
          description: this.newItem.description || undefined,
          phase: this.newItem.phase,
          priority: this.newItem.priority,
          responsibleRole: this.newItem.responsibleRole || undefined
        })
      )
      
      if (response.success && response.data) {
        this.checklist!.items.push(response.data)
        this.updateProgress()
        this.resetNewItemForm()
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao adicionar item'
    }
  }

  /**
   * @Function - handleDeleteClick
   * @description - Opens the delete confirmation modal
   * @author - Vitor Hugo
   * @param - item: EventChecklistItem
   * @returns - void
   */
  handleDeleteClick(item: EventChecklistItem): void {
    this.itemToDelete = item
    this.showDeleteModal = true
  }

  /**
   * @Function - handleCancelDelete
   * @description - Closes the delete confirmation modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.itemToDelete = null
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Confirms and executes the item deletion
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.itemToDelete) return

    this.isDeleting = true
    try {
      const response = await firstValueFrom(
        this.checklistService.deleteEventChecklistItem(this.eventId, this.itemToDelete.id)
      )
      
      if (response.success) {
        this.checklist!.items = this.checklist!.items.filter(i => i.id !== this.itemToDelete!.id)
        this.updateProgress()
        this.handleCancelDelete()
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao excluir item'
    } finally {
      this.isDeleting = false
    }
  }

  /**
   * @Function - getItemsByPhase
   * @description - Filters items by phase
   * @author - Vitor Hugo
   * @param - phase: ChecklistPhase
   * @returns - EventChecklistItem[]
   */
  getItemsByPhase(phase: ChecklistPhase): EventChecklistItem[] {
    return this.checklist?.items
      .filter(item => item.phase === phase)
      .sort((a, b) => a.sortOrder - b.sortOrder) || []
  }

  /**
   * @Function - getCompletedByPhase
   * @description - Counts completed items by phase
   * @author - Vitor Hugo
   * @param - phase: ChecklistPhase
   * @returns - number
   */
  getCompletedByPhase(phase: ChecklistPhase): number {
    return this.getItemsByPhase(phase).filter(item => item.isCompleted).length
  }

  /**
   * @Function - togglePhase
   * @description - Expands or collapses a phase section
   * @author - Vitor Hugo
   * @param - phase: ChecklistPhase
   * @returns - void
   */
  togglePhase(phase: ChecklistPhase): void {
    this.expandedPhases[phase] = !this.expandedPhases[phase]
  }

  /**
   * @Function - updateProgress
   * @description - Updates the completion progress of the checklist
   * @author - Vitor Hugo
   * @returns - void
   */
  private updateProgress(): void {
    if (!this.checklist) return
    
    const total = this.checklist.items.length
    const completed = this.checklist.items.filter(i => i.isCompleted).length
    
    this.checklist.totalItems = total
    this.checklist.completedItems = completed
    this.checklist.completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    if (completed === total && total > 0) {
      this.checklist.status = 'completed'
    } else if (completed > 0) {
      this.checklist.status = 'in_progress'
    } else {
      this.checklist.status = 'not_started'
    }

    this.checklistUpdated.emit(this.checklist)
  }

  /**
   * @Function - resetNewItemForm
   * @description - Resets the new item form
   * @author - Vitor Hugo
   * @returns - void
   */
  private resetNewItemForm(): void {
    this.newItem = {
      title: '',
      description: '',
      phase: 'pre-event',
      priority: 'medium',
      responsibleRole: ''
    }
    this.showAddItemForm = false
  }

  /**
   * @Function - getPriorityColor
   * @description - Returns CSS classes for priority badge
   * @author - Vitor Hugo
   * @param - priority: ChecklistItemPriority
   * @returns - string
   */
  getPriorityColor(priority: ChecklistItemPriority): string {
    const colors: Record<ChecklistItemPriority, string> = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-700',
      'high': 'bg-orange-100 text-orange-700',
      'critical': 'bg-red-100 text-red-700'
    }
    return colors[priority] || colors['medium']
  }

  /**
   * @Function - isOverdue
   * @description - Checks if an item is overdue based on scheduled date
   * @author - Vitor Hugo
   * @param - item: EventChecklistItem
   * @returns - boolean
   */
  isOverdue(item: EventChecklistItem): boolean {
    if (item.isCompleted || !item.scheduledDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const scheduled = new Date(item.scheduledDate)
    return scheduled < today
  }

  /**
   * @Function - getPhaseProgress
   * @description - Calculates progress percentage for a phase
   * @author - Vitor Hugo
   * @param - phase: ChecklistPhase
   * @returns - number
   */
  getPhaseProgress(phase: ChecklistPhase): number {
    const items = this.getItemsByPhase(phase)
    if (items.length === 0) return 0
    return (this.getCompletedByPhase(phase) / items.length) * 100
  }
}

