import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

/**
 * @description - Notifies the event hub layout to reload event data when the same route is reused
 * (e.g. after saving on .../visualizar/:id/dados where paramMap does not emit again).
 */
@Injectable({
  providedIn: 'root'
})
export class EventHubRefreshService {
  private readonly refreshSubject = new Subject<string>()

  readonly refresh$ = this.refreshSubject.asObservable()

  /**
   * @Function - notifyEventUpdated
   * @description - Signals that event data changed and the hub header should refetch by id
   * @param - eventId: string
   * @returns - void
   */
  notifyEventUpdated(eventId: string): void {
    this.refreshSubject.next(eventId)
  }
}
