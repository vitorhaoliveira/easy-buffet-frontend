import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { cn } from '@shared/utils/classnames'

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full overflow-auto">
      <table [class]="computedClass">
        <ng-content></ng-content>
      </table>
    </div>
  `
})
export class TableComponent {
  @Input() class: string = ''

  get computedClass(): string {
    return cn('w-full caption-bottom text-sm', this.class)
  }
}

@Component({
  selector: 'thead[appTableHeader], app-table-header',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'computedClass'
  }
})
export class TableHeaderComponent {
  @Input() class: string = ''

  get computedClass(): string {
    return cn('[&_tr]:border-b', this.class)
  }
}

@Component({
  selector: 'tbody[appTableBody], app-table-body',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'computedClass'
  }
})
export class TableBodyComponent {
  @Input() class: string = ''

  get computedClass(): string {
    return cn('[&_tr:last-child]:border-0', this.class)
  }
}

@Component({
  selector: 'tr[appTableRow], app-table-row',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'computedClass'
  }
})
export class TableRowComponent {
  @Input() class: string = ''

  get computedClass(): string {
    return cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      this.class
    )
  }
}

@Component({
  selector: 'th[appTableHead], app-table-head',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'computedClass'
  }
})
export class TableHeadComponent {
  @Input() class: string = ''

  get computedClass(): string {
    return cn(
      'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      this.class
    )
  }
}

@Component({
  selector: 'td[appTableCell], app-table-cell',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'computedClass'
  }
})
export class TableCellComponent {
  @Input() class: string = ''

  get computedClass(): string {
    return cn(
      'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      this.class
    )
  }
}

