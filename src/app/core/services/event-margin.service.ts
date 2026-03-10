import { Injectable } from '@angular/core'
import { Observable, forkJoin, of } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { firstValueFrom } from 'rxjs'

import { EventService } from '@core/services/event.service'
import { ContractService } from '@core/services/contract.service'
import { CostService } from '@core/services/cost.service'
import type { Event, Contract, Cost, EventMarginSummary } from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class EventMarginService {
  constructor(
    private readonly eventService: EventService,
    private readonly contractService: ContractService,
    private readonly costService: CostService
  ) {}

  /**
   * @Function - getMarginSummary
   * @description - Builds revenue, costs by category (team, supplies), profit and margin % for an event
   * @author - Vitor Hugo
   * @param - eventId: string - The event ID
   * @returns - Observable<EventMarginSummary | null> - Summary or null if event not found
   */
  getMarginSummary(eventId: string): Observable<EventMarginSummary | null> {
    return this.eventService.getEventById(eventId).pipe(
      switchMap((eventRes) => {
        if (!eventRes.success || !eventRes.data) {
          return of(null)
        }
        const event = eventRes.data as Event
        return this.resolveContractAndCosts(event).pipe(
          map(({ revenue, costs }) => this.buildSummary(revenue, costs))
        )
      }),
      catchError(() => of(null))
    )
  }

  /**
   * @Function - getMarginSummaryPromise
   * @description - Promise-based wrapper for getMarginSummary for use in components with async init
   * @author - Vitor Hugo
   * @param - eventId: string - The event ID
   * @returns - Promise<EventMarginSummary | null>
   */
  async getMarginSummaryPromise(eventId: string): Promise<EventMarginSummary | null> {
    return firstValueFrom(this.getMarginSummary(eventId))
  }

  /**
   * @Function - resolveContractAndCosts
   * @description - Resolves contract (revenue) and costs for the event in parallel
   * @author - Vitor Hugo
   * @param - event: Event - The event entity
   * @returns - Observable<{ revenue: number; costs: Cost[] }>
   */
  private resolveContractAndCosts(event: Event): Observable<{ revenue: number; costs: Cost[] }> {
    const revenue$ = this.getRevenueForEvent(event)
    const costs$ = this.costService.getCostsByEvent(event.id).pipe(
      map((res) => (res.success && res.data ? res.data : []))
    )
    return forkJoin({ revenue: revenue$, costs: costs$ })
  }

  /**
   * @Function - getRevenueForEvent
   * @description - Gets contract totalAmount for the event (revenue). Uses event.contractId or fetches by eventId
   * @author - Vitor Hugo
   * @param - event: Event - The event entity
   * @returns - Observable<number>
   */
  private getRevenueForEvent(event: Event): Observable<number> {
    if (event.contractId) {
      return this.contractService.getContractById(event.contractId).pipe(
        map((res) => (res.success && res.data ? Number((res.data as Contract).totalAmount) : 0)),
        catchError(() => of(0))
      )
    }
    return this.contractService.getContractsPaginated({ eventId: event.id, limit: 1 }).pipe(
      map((res) => {
        if (!res.success || !res.data || res.data.length === 0) return 0
        return Number((res.data[0] as Contract).totalAmount)
      }),
      catchError(() => of(0))
    )
  }

  /**
   * @Function - buildSummary
   * @description - Aggregates costs by category and computes teamCost, suppliesCost, profit and marginPercent
   * @author - Vitor Hugo
   * @param - revenue: number - Contract total (revenue)
   * @param - costs: Cost[] - Costs linked to the event
   * @returns - EventMarginSummary
   */
  private buildSummary(revenue: number, costs: Cost[]): EventMarginSummary {
    const byCategory = { staff: 0, food: 0, decoration: 0, other: 0 } as EventMarginSummary['costsByCategory']
    for (const c of costs) {
      const amount = this.toNumber(c.amount)
      if (c.category in byCategory) {
        byCategory[c.category as keyof typeof byCategory] += amount
      }
    }
    const totalCosts = byCategory.staff + byCategory.food + byCategory.decoration + byCategory.other
    const teamCost = byCategory.staff
    const suppliesCost = byCategory.food + byCategory.decoration + byCategory.other
    const profit = revenue - totalCosts
    const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0
    return {
      revenue,
      totalCosts,
      costsByCategory: byCategory,
      teamCost,
      suppliesCost,
      profit,
      marginPercent,
      costs
    }
  }

  /**
   * @Function - toNumber
   * @description - Converts Cost.amount (number | string) to number for calculations
   * @author - Vitor Hugo
   * @param - value: number | string
   * @returns - number
   */
  private toNumber(value: number | string): number {
    if (typeof value === 'number') return value
    const n = parseFloat(String(value))
    return Number.isFinite(n) ? n : 0
  }
}
