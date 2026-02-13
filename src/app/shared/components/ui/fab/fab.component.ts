import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { LucideAngularModule, Plus } from 'lucide-angular'

/**
 * @Component - FabComponent
 * @description - Floating action button (FAB) fixed at bottom-right with plus icon. Use for primary "new" actions on list pages.
 * @author - EasyBuffet
 */
@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    @if (routerLink !== null && routerLink !== undefined && !disabled) {
      <a [routerLink]="routerLink"
        [attr.aria-label]="title || 'Adicionar'"
        [class]="inline ? 'fab fab-inline' : 'fab'">
        <lucide-icon [img]="PlusIcon" [class]="inline ? 'h-4 w-4 shrink-0' : 'h-6 w-6'"></lucide-icon>
        @if (inline && title) {
          <span class="fab-inline-label">{{ title }}</span>
        }
      </a>
    } @else {
      <button type="button"
        [disabled]="disabled"
        [attr.aria-label]="title || 'Adicionar'"
        (click)="fabClick.emit()"
        [class]="inline ? 'fab fab-inline' : 'fab'">
        <lucide-icon [img]="PlusIcon" [class]="inline ? 'h-4 w-4 shrink-0' : 'h-6 w-6'"></lucide-icon>
        @if (inline && title) {
          <span class="fab-inline-label">{{ title }}</span>
        }
      </button>
    }
  `,
  styles: [`
    .fab {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      background: linear-gradient(to right, #FFCB37, #FFB032);
      color: white;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .fab:not(.fab-inline) {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 40;
      width: 3.5rem;
      height: 3.5rem;
    }
    .fab-inline {
      border-radius: 0.5rem;
      min-height: 2.75rem;
      padding-left: 1rem;
      padding-right: 1rem;
      gap: 0.5rem;
      flex-shrink: 0;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .fab-inline-label {
      white-space: nowrap;
    }
    .fab:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    }
    .fab:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class FabComponent {
  readonly PlusIcon = Plus

  /** When true, button is inline in the layout (e.g. in filter row) instead of fixed bottom-right. */
  @Input() inline: boolean = false

  /** Route or route array for navigation when FAB is clicked. When null/undefined and fabClick is used, button mode. */
  @Input() routerLink: string | string[] | null = null

  /** Accessible label for the button (e.g. "Nova Parcela"). */
  @Input() title: string = ''

  /** When true, disables the FAB (button mode only). */
  @Input() disabled: boolean = false

  /** Emits when FAB is clicked (use when not using routerLink, e.g. custom logic). */
  @Output() fabClick = new EventEmitter<void>()
}
