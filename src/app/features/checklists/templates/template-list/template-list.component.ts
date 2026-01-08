import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { LucideAngularModule, Plus, Pencil, Trash2, ClipboardList, Search, Copy } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'
import { FormsModule } from '@angular/forms'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { ChecklistService } from '@core/services/checklist.service'
import type { ChecklistTemplate, ChecklistPhase } from '@shared/models/api.types'

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    ConfirmationModalComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  templateUrl: './template-list.component.html'
})
export class TemplateListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly PencilIcon = Pencil
  readonly Trash2Icon = Trash2
  readonly ClipboardListIcon = ClipboardList
  readonly SearchIcon = Search
  readonly CopyIcon = Copy

  templates: ChecklistTemplate[] = []
  filteredTemplates: ChecklistTemplate[] = []
  isLoading = true
  error = ''
  searchTerm = ''
  selectedEventType = ''
  
  // Delete modal state
  showDeleteModal = false
  templateToDelete: ChecklistTemplate | null = null
  isDeleting = false

  eventTypes = [
    'Casamento',
    'Aniversário',
    'Corporativo',
    'Debutante',
    'Formatura',
    'Batizado',
    'Confraternização',
    'Outro'
  ]

  constructor(private checklistService: ChecklistService) {}

  async ngOnInit(): Promise<void> {
    await this.loadTemplates()
  }

  /**
   * @Function - loadTemplates
   * @description - Loads all checklist templates from API
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadTemplates(): Promise<void> {
    this.isLoading = true
    this.error = ''

    try {
      const response = await firstValueFrom(this.checklistService.getTemplates())
      if (response.success && response.data) {
        this.templates = response.data
        this.applyFilters()
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar templates'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - applyFilters
   * @description - Applies search and event type filters to templates list
   * @author - Vitor Hugo
   * @returns - void
   */
  applyFilters(): void {
    this.filteredTemplates = this.templates.filter(template => {
      const matchesSearch = !this.searchTerm || 
        template.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        template.eventType.toLowerCase().includes(this.searchTerm.toLowerCase())
      
      const matchesType = !this.selectedEventType || 
        template.eventType === this.selectedEventType

      return matchesSearch && matchesType
    })
  }

  /**
   * @Function - onSearchChange
   * @description - Handles search input changes
   * @author - Vitor Hugo
   * @returns - void
   */
  onSearchChange(): void {
    this.applyFilters()
  }

  /**
   * @Function - onEventTypeChange
   * @description - Handles event type filter changes
   * @author - Vitor Hugo
   * @returns - void
   */
  onEventTypeChange(): void {
    this.applyFilters()
  }

  /**
   * @Function - duplicateTemplate
   * @description - Duplicates an existing template
   * @author - Vitor Hugo
   * @param - template: ChecklistTemplate
   * @returns - Promise<void>
   */
  async duplicateTemplate(template: ChecklistTemplate): Promise<void> {
    try {
      const originalResponse = await firstValueFrom(
        this.checklistService.getTemplateById(template.id)
      )
      
      if (originalResponse.success && originalResponse.data) {
        const original = originalResponse.data
        const duplicateData = {
          name: `${original.name} (Cópia)`,
          eventType: original.eventType,
          description: original.description,
          items: original.items.map(item => ({
            title: item.title,
            description: item.description,
            phase: item.phase,
            daysBeforeEvent: item.daysBeforeEvent,
            priority: item.priority,
            responsibleRole: item.responsibleRole,
            sortOrder: item.sortOrder
          }))
        }
        
        const response = await firstValueFrom(
          this.checklistService.createTemplate(duplicateData)
        )
        
        if (response.success) {
          await this.loadTemplates()
        }
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao duplicar template'
    }
  }

  /**
   * @Function - handleDeleteClick
   * @description - Opens the delete confirmation modal
   * @author - Vitor Hugo
   * @param - template: ChecklistTemplate
   * @returns - void
   */
  handleDeleteClick(template: ChecklistTemplate): void {
    this.templateToDelete = template
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
    this.templateToDelete = null
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Confirms and executes the template deletion
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.templateToDelete) return

    this.isDeleting = true
    try {
      const response = await firstValueFrom(
        this.checklistService.deleteTemplate(this.templateToDelete.id)
      )
      if (response.success) {
        await this.loadTemplates()
        this.handleCancelDelete()
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao excluir template'
    } finally {
      this.isDeleting = false
    }
  }

  /**
   * @Function - getItemCount
   * @description - Returns the number of items in a template
   * @author - Vitor Hugo
   * @param - template: ChecklistTemplate
   * @returns - number
   */
  getItemCount(template: ChecklistTemplate): number {
    return template.items?.length || 0
  }

  /**
   * @Function - getPhaseLabel
   * @description - Translates phase code to Portuguese label
   * @author - Vitor Hugo
   * @param - phase: ChecklistPhase
   * @returns - string
   */
  getPhaseLabel(phase: ChecklistPhase): string {
    const labels: Record<ChecklistPhase, string> = {
      'pre-event': 'Pré-evento',
      'event-day': 'Dia do Evento',
      'post-event': 'Pós-evento'
    }
    return labels[phase] || phase
  }

  /**
   * @Function - getItemsByPhase
   * @description - Counts items by phase for a template
   * @author - Vitor Hugo
   * @param - template: ChecklistTemplate
   * @param - phase: ChecklistPhase
   * @returns - number
   */
  getItemsByPhase(template: ChecklistTemplate, phase: ChecklistPhase): number {
    return template.items?.filter(item => item.phase === phase).length || 0
  }
}

