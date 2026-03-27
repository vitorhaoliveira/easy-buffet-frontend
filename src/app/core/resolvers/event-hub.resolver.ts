import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'
import { catchError, map, of } from 'rxjs'

import { EventService } from '@core/services/event.service'
import type { EventHubData } from '@shared/models/api.types'

/** Matches events-form clients page size so “load more” stays consistent with hub pagination */
const EVENT_HUB_CLIENTS_LIMIT = 20

/**
 * @description - Loads GET /events/:eventId/hub with reference lists for the event hub shell (header + Dados tab).
 */
export const eventHubResolver: ResolveFn<EventHubData | null> = (route) => {
  const eventId = route.paramMap.get('eventId')
  if (!eventId) {
    return of(null)
  }
  return inject(EventService)
    .getEventHub(eventId, {
      includeReferenceLists: true,
      clientsLimit: EVENT_HUB_CLIENTS_LIMIT
    })
    .pipe(
      map((res) => (res.success && res.data ? res.data : null)),
      catchError(() => of(null))
    )
}
