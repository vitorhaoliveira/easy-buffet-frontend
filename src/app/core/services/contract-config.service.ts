import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { environment } from '../../../environments/environment'
import { ContractConfiguration, ContractClause } from '../../shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class ContractConfigService {
  private http = inject(HttpClient)
  private apiUrl = environment.apiBaseUrl

  /**
   * Obtém a configuração de contrato da organização
   */
  getContractConfig(organizationId: string): Observable<ContractConfiguration> {
    return this.http.get<{ success: boolean; data: ContractConfiguration }>(
      `${this.apiUrl}/organizations/${organizationId}/contract-config`
    ).pipe(
      map(response => response.data)
    )
  }

  /**
   * Atualiza a configuração de contrato da organização
   */
  updateContractConfig(
    organizationId: string,
    clauses: ContractClause[]
  ): Observable<ContractConfiguration> {
    return this.http.put<{ success: boolean; data: ContractConfiguration }>(
      `${this.apiUrl}/organizations/${organizationId}/contract-config`,
      { clauses }
    ).pipe(
      map(response => response.data)
    )
  }

  /**
   * Retorna as cláusulas padrão que serão usadas se não houver configuração
   */
  getDefaultClauses(): ContractClause[] {
    return [
      {
        id: 'clause-1',
        title: 'Objeto do Evento',
        content: 'O presente evento tem como objeto a prestação de serviços de buffet para o evento especificado, incluindo todos os itens descritos na proposta aceita pelo CONTRATANTE.',
        order: 1,
        isRequired: true,
        isActive: true
      },
      {
        id: 'clause-2',
        title: 'Valor e Formas de Pagamento',
        content: 'O valor total dos serviços e as condições de pagamento estão descritos na proposta aceita, incluindo valores de entrada, parcelas e datas de vencimento.',
        order: 2,
        isRequired: true,
        isActive: true
      },
      {
        id: 'clause-3',
        title: 'Cancelamento e Reembolso',
        content: 'Em caso de cancelamento por parte do CONTRATANTE:\n- Até 30 dias antes do evento: reembolso de 80% do valor pago\n- Entre 15 e 29 dias antes: reembolso de 50% do valor pago\n- Menos de 15 dias: sem reembolso\n\nEm caso de cancelamento por parte da CONTRATADA: reembolso integral.',
        order: 3,
        isRequired: false,
        isActive: true
      },
      {
        id: 'clause-4',
        title: 'Responsabilidades',
        content: 'A CONTRATADA se responsabiliza pela qualidade dos alimentos, bebidas e serviços prestados. O CONTRATANTE se responsabiliza por fornecer acesso ao local do evento e infraestrutura necessária (energia, água, etc).',
        order: 4,
        isRequired: false,
        isActive: true
      },
      {
        id: 'clause-5',
        title: 'Penalidades',
        content: 'O descumprimento das obrigações contratuais por qualquer das partes implicará em multa de 20% sobre o valor total do evento, sem prejuízo de reparação por perdas e danos.',
        order: 5,
        isRequired: false,
        isActive: true
      },
      {
        id: 'clause-additional',
        title: 'Cláusula Adicional',
        content: '',
        order: 6,
        isRequired: false,
        isActive: false
      }
    ]
  }

  /**
   * Reseta a configuração para os valores padrão
   */
  resetToDefaults(organizationId: string): Observable<ContractConfiguration> {
    return this.updateContractConfig(organizationId, this.getDefaultClauses())
  }
}
