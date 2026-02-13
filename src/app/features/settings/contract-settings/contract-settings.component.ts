import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms'
import { ContractConfigService } from '../../../core/services/contract-config.service'
import { OrganizationStateService } from '../../../core/services/organization-state.service'
import { ToastService } from '../../../core/services/toast.service'
import { StorageService } from '../../../core/services/storage.service'
import { ConfirmationModalComponent } from '../../../shared/components/ui/confirmation-modal/confirmation-modal.component'
import { ContractClause } from '../../../shared/models/api.types'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'app-contract-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationModalComponent],
  templateUrl: './contract-settings.component.html'
})
export class ContractSettingsComponent implements OnInit {
  private fb = inject(FormBuilder)
  private contractConfigService = inject(ContractConfigService)
  private organizationState = inject(OrganizationStateService)
  private toastService = inject(ToastService)
  private storageService = inject(StorageService)

  contractForm!: FormGroup
  isLoading = false
  isSaving = false
  showPreview = false
  showResetConfirmation = false

  /** Temporarily hide clauses configuration; focus is on quote acceptance only */
  readonly clausesPaused = true

  ngOnInit(): void {
    this.initForm()
    this.loadContractConfig()
  }

  private initForm(): void {
    this.contractForm = this.fb.group({
      clauses: this.fb.array([])
    })
  }

  get clausesArray(): FormArray {
    return this.contractForm.get('clauses') as FormArray
  }

  private async loadContractConfig(): Promise<void> {
    this.isLoading = true
    try {
      const currentOrg = this.organizationState.currentOrganization
      if (!currentOrg?.id) {
        this.toastService.error('Organização não encontrada')
        return
      }
      const orgId = currentOrg.id

      try {
        const config = await firstValueFrom(
          this.contractConfigService.getContractConfig(orgId)
        )
        this.populateForm(config.clauses)
      } catch (error) {
        // Se não existe config, usa as cláusulas padrão
        if ((error as { status: number })?.status === 404) {
          const defaultClauses = this.contractConfigService.getDefaultClauses()
          this.populateForm(defaultClauses)
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      this.toastService.error('Erro ao carregar configuração do evento')
    } finally {
      this.isLoading = false
    }
  }

  private populateForm(clauses: ContractClause[]): void {
    this.clausesArray.clear()
    clauses
      .sort((a, b) => a.order - b.order)
      .forEach(clause => {
        this.clausesArray.push(this.createClauseGroup(clause))
      })
  }

  private createClauseGroup(clause: ContractClause): FormGroup {
    return this.fb.group({
      id: [clause.id],
      title: [clause.title, Validators.required],
      content: [clause.content, clause.isRequired ? Validators.required : []],
      order: [clause.order],
      isRequired: [clause.isRequired],
      isActive: [clause.isActive]
    })
  }

  async onSave(): Promise<void> {
    if (this.contractForm.invalid) {
      this.toastService.warning('Preencha todos os campos obrigatórios')
      return
    }

    this.isSaving = true
    try {
      const currentOrg = this.organizationState.currentOrganization
      if (!currentOrg?.id) {
        this.toastService.error('Organização não encontrada')
        return
      }
      const orgId = currentOrg.id

      const clauses: ContractClause[] = this.clausesArray.value

      await firstValueFrom(
        this.contractConfigService.updateContractConfig(orgId, clauses)
      )

      this.toastService.success('Configuração salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      this.toastService.error('Erro ao salvar configuração')
    } finally {
      this.isSaving = false
    }
  }

  async onResetToDefaults(): Promise<void> {
    this.showResetConfirmation = true
  }

  closeResetConfirmation(): void {
    this.showResetConfirmation = false
  }

  async confirmReset(): Promise<void> {
    this.showResetConfirmation = false
    await this.performReset()
  }

  private async performReset(): Promise<void> {
    this.isLoading = true
    try {
      const currentOrg = this.organizationState.currentOrganization
      if (!currentOrg?.id) {
        this.toastService.error('Organização não encontrada')
        this.isLoading = false
        return
      }
      const orgId = currentOrg.id

      console.log('[resetToDefaults] Starting for org:', orgId)
      const result = await firstValueFrom(
        this.contractConfigService.resetToDefaults(orgId)
      )
      console.log('[resetToDefaults] Success:', result)

      // Recarrega o form com os valores padrão
      const defaultClauses = this.contractConfigService.getDefaultClauses()
      this.populateForm(defaultClauses)

      console.log('[resetToDefaults] Showing success toast')
      this.toastService.success('Cláusulas restauradas para o padrão!')
      this.isLoading = false
    } catch (error) {
      console.error('[resetToDefaults] Error:', error)
      this.toastService.error('Erro ao restaurar cláusulas padrão')
      this.isLoading = false
    }
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview
  }

  getActiveClausesForPreview(): ContractClause[] {
    return this.clausesArray.value.filter((clause: ContractClause) => clause.isActive)
  }
}
