import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'

import { FinancialDashboardComponent } from '../financial-dashboard/financial-dashboard.component'
import { MonthlyReportComponent } from '../../reports/monthly-report/monthly-report.component'
import { AuthStateService } from '@core/services/auth-state.service'

export type FinancialTab = 'overview' | 'report'

@Component({
  selector: 'app-financial-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FinancialDashboardComponent,
    MonthlyReportComponent
  ],
  templateUrl: './financial-page.component.html'
})
export class FinancialPageComponent implements OnInit, OnDestroy {
  activeTab: FinancialTab = 'overview'
  canViewReport = true

  private readonly destroy$ = new Subject<void>()

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authStateService: AuthStateService
  ) {}

  /**
   * @Function - ngOnInit
   * @description - Initialize component, sync tab with query param and permissions
   * @author - Vitor Hugo
   * @returns - void
   */
  ngOnInit(): void {
    this.syncTabFromQueryParam()
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.syncTabFromQueryParam()
    })
    this.authStateService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      const perms = user?.currentOrganization?.permissions
      this.canViewReport = !!(perms?.relatorios?.view ?? perms?.financeiro?.view ?? true)
    })
  }

  /**
   * @Function - ngOnDestroy
   * @description - Clean up subscriptions
   * @author - Vitor Hugo
   * @returns - void
   */
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * @Function - syncTabFromQueryParam
   * @description - Set active tab from route query param (tab=relatorio)
   * @author - Vitor Hugo
   * @returns - void
   */
  private syncTabFromQueryParam(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab')
    if (tab === 'relatorio' && this.canViewReport) {
      this.activeTab = 'report'
    } else {
      this.activeTab = 'overview'
    }
  }

  /**
   * @Function - setActiveTab
   * @description - Switch tab and update URL query param
   * @author - Vitor Hugo
   * @param - tab: FinancialTab - Tab to activate
   * @returns - void
   */
  setActiveTab(tab: FinancialTab): void {
    if (tab === 'report' && !this.canViewReport) return
    this.activeTab = tab
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: tab === 'report' ? { tab: 'relatorio' } : {},
      queryParamsHandling: tab === 'report' ? 'merge' : ''
    })
  }
}
