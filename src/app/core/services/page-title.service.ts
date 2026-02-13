import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {
  private readonly title$ = new BehaviorSubject<string>('')
  private readonly subtitle$ = new BehaviorSubject<string>('')

  readonly title = this.title$.asObservable()
  readonly subtitle = this.subtitle$.asObservable()

  /**
   * @Function - setTitle
   * @description - Set the current page title and optional subtitle (shown in layout header)
   * @author - Vitor Hugo
   * @param - title: string - Main title
   * @param - subtitle: string - Optional subtitle
   * @returns - void
   */
  setTitle(title: string, subtitle?: string): void {
    this.title$.next(title || '')
    this.subtitle$.next(subtitle ?? '')
  }

  /**
   * @Function - clear
   * @description - Clear title and subtitle
   * @author - Vitor Hugo
   * @returns - void
   */
  clear(): void {
    this.title$.next('')
    this.subtitle$.next('')
  }

  /** Current title value for sync access in layout */
  get currentTitle(): string {
    return this.title$.value
  }

  /** Current subtitle value for sync access in layout */
  get currentSubtitle(): string {
    return this.subtitle$.value
  }
}
