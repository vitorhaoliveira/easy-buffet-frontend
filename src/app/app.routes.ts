import { Routes } from '@angular/router'
import { authGuard } from './core/guards/auth.guard'
import { permissionGuard } from './core/guards/permission.guard'

export const routes: Routes = [
  // Auth routes (no guard)
  {
    path: 'signin',
    loadComponent: () => import('./features/auth/pages/signin/signin.component').then(m => m.SigninComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/pages/signup/signup.component').then(m => m.SignupComponent)
  },
  
  // Protected routes (with auth guard)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      // Dashboard
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { module: 'dashboard', action: 'view' },
        canActivate: [permissionGuard]
      },
      
      // Clients routes
      {
        path: 'cadastros/clientes',
        loadComponent: () => import('./features/register/clients/client-list/client-list.component').then(m => m.ClientListComponent),
        data: { module: 'cadastros', action: 'view' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/clientes/novo',
        loadComponent: () => import('./features/register/clients/client-form/client-form.component').then(m => m.ClientFormComponent),
        data: { module: 'cadastros', action: 'create' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/clientes/editar/:id',
        loadComponent: () => import('./features/register/clients/client-form/client-form.component').then(m => m.ClientFormComponent),
        data: { module: 'cadastros', action: 'edit' },
        canActivate: [permissionGuard]
      },
      
      // Packages routes
      {
        path: 'cadastros/pacotes',
        loadComponent: () => import('./features/register/packages/package-list/package-list.component').then(m => m.PackageListComponent),
        data: { module: 'cadastros', action: 'view' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/pacotes/novo',
        loadComponent: () => import('./features/register/packages/package-form/package-form.component').then(m => m.PackageFormComponent),
        data: { module: 'cadastros', action: 'create' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/pacotes/editar/:id',
        loadComponent: () => import('./features/register/packages/package-form/package-form.component').then(m => m.PackageFormComponent),
        data: { module: 'cadastros', action: 'edit' },
        canActivate: [permissionGuard]
      },
      
      // Events routes
      {
        path: 'cadastros/eventos',
        loadComponent: () => import('./features/register/events/events-list/events-list.component').then(m => m.EventsListComponent),
        data: { module: 'cadastros', action: 'view' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/eventos/novo',
        loadComponent: () => import('./features/register/events/events-form/events-form.component').then(m => m.EventsFormComponent),
        data: { module: 'cadastros', action: 'create' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/eventos/editar/:id',
        loadComponent: () => import('./features/register/events/events-form/events-form.component').then(m => m.EventsFormComponent),
        data: { module: 'cadastros', action: 'edit' },
        canActivate: [permissionGuard]
      },
      
      // Users routes
      {
        path: 'cadastros/usuarios',
        loadComponent: () => import('./features/register/users/user-list/user-list.component').then(m => m.UserListComponent),
        data: { module: 'cadastros', action: 'view' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/usuarios/novo',
        loadComponent: () => import('./features/register/users/user-form/user-form.component').then(m => m.UserFormComponent),
        data: { module: 'cadastros', action: 'create' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/usuarios/editar/:id',
        loadComponent: () => import('./features/register/users/user-form/user-form.component').then(m => m.UserFormComponent),
        data: { module: 'cadastros', action: 'edit' },
        canActivate: [permissionGuard]
      },
      
      // Contracts routes
      {
        path: 'cadastros/contratos',
        loadComponent: () => import('./features/register/contracts/contracts-list/contracts-list.component').then(m => m.ContractsListComponent),
        data: { module: 'cadastros', action: 'view' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/contratos/novo',
        loadComponent: () => import('./features/register/contracts/contract-form/contract-form.component').then(m => m.ContractFormComponent),
        data: { module: 'cadastros', action: 'create' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/contratos/editar/:id',
        loadComponent: () => import('./features/register/contracts/contract-form/contract-form.component').then(m => m.ContractFormComponent),
        data: { module: 'cadastros', action: 'edit' },
        canActivate: [permissionGuard]
      },
      {
        path: 'cadastros/contratos/visualizar/:id',
        loadComponent: () => import('./features/register/contracts/contract-detail/contract-detail.component').then(m => m.ContractDetailComponent),
        data: { module: 'cadastros', action: 'view' },
        canActivate: [permissionGuard]
      },
      
      // Financial routes
      {
        path: 'financeiro',
        loadComponent: () => import('./features/financial/financial-dashboard/financial-dashboard.component').then(m => m.FinancialDashboardComponent),
        data: { module: 'financeiro', action: 'view' },
        canActivate: [permissionGuard]
      },
      {
        path: 'financeiro/parcelas',
        loadComponent: () => import('./features/financial/installments/installments-list/installments-list.component').then(m => m.InstallmentsListComponent),
        data: { module: 'financeiro', action: 'view' },
        canActivate: [permissionGuard]
      },
      {
        path: 'financeiro/parcelas/nova',
        loadComponent: () => import('./features/financial/installments/installment-form/installment-form.component').then(m => m.InstallmentFormComponent),
        data: { module: 'financeiro', action: 'create' },
        canActivate: [permissionGuard]
      },
      {
        path: 'financeiro/custos',
        loadComponent: () => import('./features/financial/costs/costs-list/costs-list.component').then(m => m.CostsListComponent),
        data: { module: 'financeiro', action: 'view' },
        canActivate: [permissionGuard]
      },
      {
        path: 'financeiro/custos/novo',
        loadComponent: () => import('./features/financial/costs/cost-form/cost-form.component').then(m => m.CostFormComponent),
        data: { module: 'financeiro', action: 'create' },
        canActivate: [permissionGuard]
      },
      
      // Reports route
      {
        path: 'reports/monthly',
        loadComponent: () => import('./features/reports/monthly-report/monthly-report.component').then(m => m.MonthlyReportComponent),
        data: { module: 'relatorios', action: 'view' },
        canActivate: [permissionGuard]
      },
      
      // Account settings route
      {
        path: 'conta',
        loadComponent: () => import('./features/profile/account-settings/account-settings.component').then(m => m.AccountSettingsComponent)
      },
      
      // {
      //   path: 'configuracoes/permissoes',
      //   loadComponent: () => import('./features/settings/permissions-settings/permissions-settings.component').then(m => m.PermissionsSettingsComponent)
      // },
    ]
  },
  
  // Redirect to dashboard by default
  {
    path: '**',
    redirectTo: ''
  }
]
