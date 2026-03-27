import { Injectable, inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { DashboardService } from './dashboard.service'
import { EventService } from './event.service'
import { StorageService } from './storage.service'
import { IndexedDbCacheService } from './indexed-db-cache.service'
import type { DashboardStats, Event } from '@shared/models/api.types'

/** Short TTL for dashboard stats (avoid stale KPIs) */
const DASHBOARD_STATS_TTL_MS = 90 * 1000
/** TTL for dashboard event slices (calendar month / carousel) */
const DASHBOARD_EVENTS_TTL_MS = 60 * 1000

/**
 * @description - IndexedDB-backed stale-while-revalidate helpers for dashboard payloads
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardCacheService {
  private readonly dashboardService = inject(DashboardService)
  private readonly eventService = inject(EventService)
  private readonly storageService = inject(StorageService)
  private readonly idb = inject(IndexedDbCacheService)

  /**
   * @Function - orgPrefix
   * @description - Key prefix including current organization id
   * @returns - string
   */
  private orgPrefix(): string {
    return `${this.storageService.getCurrentOrganizationId() || 'anon'}:dashboard:`
  }

  private statsKey(): string {
    return `${this.orgPrefix()}stats`
  }

  private calendarKey(d: Date): string {
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    return `${this.orgPrefix()}cal:${y}-${String(m).padStart(2, '0')}`
  }

  private carouselKey(): string {
    return `${this.orgPrefix()}carousel`
  }

  /**
   * @Function - getMonthDateRangeISO
   * @description - Inclusive dateFrom/dateTo for the calendar month (YYYY-MM-DD)
   * @param - d: Date
   * @returns - { dateFrom: string; dateTo: string }
   */
  private getMonthDateRangeISO(d: Date): { dateFrom: string; dateTo: string } {
    const y = d.getFullYear()
    const m = d.getMonth()
    const dateFrom = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const lastDay = new Date(y, m + 1, 0).getDate()
    const dateTo = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    return { dateFrom, dateTo }
  }

  /**
   * @Function - fetchEventsInDateRange
   * @description - Loads events with server-side date filters and pagination
   * @param - dateFrom: string
   * @param - dateTo: string
   * @param - maxPages: number
   * @returns - Promise<Event[]>
   */
  private async fetchEventsInDateRange(
    dateFrom: string,
    dateTo: string,
    maxPages: number = 30
  ): Promise<Event[]> {
    const all: Event[] = []
    const limit = 100
    for (let page = 1; page <= maxPages; page++) {
      const res = await firstValueFrom(
        this.eventService.getEventsPaginated({ page, limit, dateFrom, dateTo })
      )
      if (!res.success || !res.data) break
      const list = Array.isArray(res.data) ? res.data : []
      all.push(...(list as Event[]))
      const totalPages = res.pagination?.totalPages ?? 1
      if (page >= totalPages) break
    }
    return all
  }

  /**
   * @Function - getStatsWithSwr
   * @description - Returns stats from cache when possible; refreshes in background if stale; onUpdate receives fresh stats after revalidation
   * @param - onUpdate: (stats: DashboardStats) => void - Optional callback when fresh data arrives after serving stale cache
   * @returns - Promise<DashboardStats>
   */
  async getStatsWithSwr(onUpdate?: (stats: DashboardStats) => void): Promise<DashboardStats> {
    const key = this.statsKey()
    const entry = await this.idb.get<DashboardStats>(key)
    if (!entry) {
      const stats = await this.fetchStatsFresh(key)
      return stats
    }
    if (this.idb.isStale(entry)) {
      void this.fetchStatsFresh(key).then(s => {
        onUpdate?.(s)
      })
      return entry.value
    }
    return entry.value
  }

  /**
   * @Function - fetchStatsFresh
   * @description - Loads stats from API and persists to IndexedDB
   * @param - key: string
   * @returns - Promise<DashboardStats>
   */
  private async fetchStatsFresh(key: string): Promise<DashboardStats> {
    const res = await firstValueFrom(this.dashboardService.getStats())
    if (!res.success || !res.data) {
      throw new Error('Dashboard stats unavailable')
    }
    const data = res.data
    const stats: DashboardStats = {
      ...data,
      monthlyRevenue: typeof data.monthlyRevenue === 'string'
        ? parseFloat(data.monthlyRevenue)
        : data.monthlyRevenue,
      totalRevenue: typeof data.totalRevenue === 'string'
        ? parseFloat(data.totalRevenue)
        : data.totalRevenue
    }
    await this.idb.set(key, stats, DASHBOARD_STATS_TTL_MS)
    return stats
  }

  /**
   * @Function - getCalendarMonthEventsWithSwr
   * @description - Events for one visible month with stale-while-revalidate
   * @param - d: Date - Month to load
   * @param - onUpdate: (events: Event[]) => void
   * @returns - Promise<Event[]>
   */
  async getCalendarMonthEventsWithSwr(
    d: Date,
    onUpdate?: (events: Event[]) => void
  ): Promise<Event[]> {
    const { dateFrom, dateTo } = this.getMonthDateRangeISO(d)
    const key = this.calendarKey(d)
    const entry = await this.idb.get<Event[]>(key)
    if (!entry) {
      const events = await this.fetchCalendarMonthFresh(dateFrom, dateTo, key)
      return events
    }
    if (this.idb.isStale(entry)) {
      void this.fetchCalendarMonthFresh(dateFrom, dateTo, key).then(ev => {
        onUpdate?.(ev)
      })
      return entry.value
    }
    return entry.value
  }

  private async fetchCalendarMonthFresh(
    dateFrom: string,
    dateTo: string,
    key: string
  ): Promise<Event[]> {
    const events = await this.fetchEventsInDateRange(dateFrom, dateTo, 50)
    await this.idb.set(key, events, DASHBOARD_EVENTS_TTL_MS)
    return events
  }

  /**
   * @Function - getRecentCarouselEventsWithSwr
   * @description - Bounded upcoming events list for the carousel with SWR
   * @param - loadRange: () => Promise<Event[]> - Loads raw events for the carousel window
   * @param - onUpdate: (events: Event[]) => void
   * @returns - Promise<Event[]>
   */
  async getRecentCarouselEventsWithSwr(
    loadRange: () => Promise<Event[]>,
    onUpdate?: (events: Event[]) => void
  ): Promise<Event[]> {
    const key = this.carouselKey()
    const entry = await this.idb.get<Event[]>(key)
    if (!entry) {
      const events = await loadRange()
      await this.idb.set(key, events, DASHBOARD_EVENTS_TTL_MS)
      return events
    }
    if (this.idb.isStale(entry)) {
      void loadRange().then(ev => {
        void this.idb.set(key, ev, DASHBOARD_EVENTS_TTL_MS)
        onUpdate?.(ev)
      })
      return entry.value
    }
    return entry.value
  }
}
