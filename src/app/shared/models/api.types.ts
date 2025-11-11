// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T | null
  errors: string[] | null
}

// User Types
export interface UserPermissions {
  dashboard: {
    view: boolean
  }
  cadastros: {
    create: boolean
    edit: boolean
    delete: boolean
    view: boolean
  }
  financeiro: {
    create: boolean
    edit: boolean
    delete: boolean
    view: boolean
  }
  relatorios: {
    view: boolean
    export: boolean
  }
}

export interface User {
  id: string
  name: string
  email: string
  role: 'Administrador' | 'Auxiliar'
  status: 'Ativo' | 'Inativo'
  phone?: string
  avatar?: string | null
  permissions?: UserPermissions
  currentOrganization?: {
    id: string
    name: string
    role: string
    permissions: UserPermissions
  }
  organizations?: Array<{
    id: string
    name: string
    role: string
    permissions: UserPermissions
  }>
  createdAt: string
  updatedAt?: string
}

export interface Organization {
  id: string
  name: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

export interface RegisterResponse {
  user: User
  tokens: AuthTokens
}

// Client Types
export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt?: string
}

// Package Types
export interface Package {
  id: string
  name: string
  type: string
  description?: string
  price: number
  duration: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

// Event Types
export interface Event {
  id: string
  clientId: string
  packageId: string
  name: string
  eventDate: string
  eventTime: string
  location: string
  guestCount: number
  status: 'Pendente' | 'Confirmado' | 'Realizado' | 'Cancelado'
  notes?: string
  createdAt: string
  updatedAt?: string
}

// Contract Types
export interface Contract {
  id: string
  eventId: string
  clientId: string
  totalAmount: number
  installmentCount: number
  installmentAmount: number
  firstDueDate: string
  periodicity: 'Mensal' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual'
  commissionPercentage: number
  commissionAmount: number
  notes?: string
  status: 'Pendente' | 'Assinado' | 'Cancelado'
  signedAt?: string
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
  event?: {
    id: string
    name: string
    eventDate: string
  }
  client?: {
    id: string
    name: string
  }
  installments?: Installment[]
}

// Installment Types
export interface Installment {
  id: string
  contractId: string
  installmentNumber: number
  amount: number
  dueDate: string
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'pending' | 'paid' | 'overdue'
  paidAt?: string
  paymentDate?: string
  paymentAmount?: number
  notes?: string | null
  organizationId: string
  createdAt: string
  updatedAt?: string
  contract?: {
    event: { name: string; eventDate: string }
    client: { name: string }
  }
}

// Dashboard Installment (formato da API do dashboard)
export interface DashboardInstallment {
  id: string
  contractId: string
  clientName: string
  eventName: string
  amount: string | number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  daysUntilDue: number
}

// Dashboard Event (formato da API do dashboard)
export interface DashboardEvent {
  id: string
  clientName: string
  eventName: string
  eventDate: string
  status: string
  daysUntilEvent: number
}

// Cost Types
export interface Cost {
  id: string
  description: string
  amount: number | string
  category: 'staff' | 'food' | 'decoration' | 'other'
  eventId?: string
  notes?: string
  organizationId: string
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
  createdBy: string
  event?: {
    name: string
  }
}

// Dashboard Types
export interface DashboardData {
  totalEvents: number
  totalRevenue: number
  pendingInstallments: number
  upcomingEvents: Event[]
  recentActivity: any[]
  monthlyRevenue?: number
  upcomingInstallments7Days?: number
  upcomingInstallments30Days?: number
  overdueInstallments?: number
}

// Report Types
export interface Report {
  id: string
  name: string
  type: 'monthly' | 'yearly' | 'custom'
  period: string
  data: any
  createdAt: string
}

// Settings Types
export interface Settings {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  defaultPackageId?: string
  currency: string
  timezone: string
}

// Request Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  organizationName: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  phone?: string
  role: 'Administrador' | 'Auxiliar'
  permissions: UserPermissions
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  phone?: string
  status?: 'Ativo' | 'Inativo'
}

export interface UpdateUserPermissionsRequest {
  permissions: UserPermissions
}

export interface CreateClientRequest {
  name: string
  email?: string
  phone?: string
  address?: string
}

export interface UpdateClientRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
}

export interface CreatePackageRequest {
  name: string
  type: string
  description?: string
  price: number
  duration: string
  notes?: string
  isActive?: boolean
}

export interface UpdatePackageRequest {
  name?: string
  type?: string
  description?: string
  price?: number
  duration?: string
  notes?: string
  isActive?: boolean
}

export interface CreateEventRequest {
  clientId: string
  packageId: string
  name: string
  eventDate: string
  eventTime: string
  location: string
  guestCount: number
  status: 'Pendente' | 'Confirmado' | 'Realizado' | 'Cancelado'
  notes?: string
}

export interface UpdateEventRequest {
  clientId?: string
  packageId?: string
  name?: string
  eventDate?: string
  eventTime?: string
  location?: string
  guestCount?: number
  status?: 'Pendente' | 'Agendado' | 'Confirmado' | 'Realizado' | 'Cancelado'
  notes?: string
}

export interface CreateContractRequest {
  eventId: string
  clientId: string
  totalAmount: number
  installmentCount: number
  firstDueDate: string
  periodicity: 'Mensal' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual'
  commissionPercentage: number
  notes?: string
}

export interface UpdateContractRequest {
  status?: 'Pendente' | 'Assinado' | 'Cancelado'
  signedAt?: string
}

export interface CreateContractResponse {
  contract: Contract
  installments: Installment[]
}

export interface CreateInstallmentRequest {
  contractId: string
  amount: number
  dueDate: string
}

export interface UpdateInstallmentRequest {
  amount?: number
  dueDate?: string
  status?: 'Pendente' | 'Pago' | 'Atrasado'
  paidAt?: string
}

export interface CreateCostRequest {
  description: string
  amount: number
  category: 'staff' | 'food' | 'decoration' | 'other'
  eventId?: string
  notes?: string
}

export interface UpdateCostRequest {
  description?: string
  amount?: number
  category?: 'staff' | 'food' | 'decoration' | 'other'
  eventId?: string
  notes?: string
}

export interface UpdateSettingsRequest {
  companyName?: string
  companyEmail?: string
  companyPhone?: string
  companyAddress?: string
  defaultPackageId?: string
  currency?: string
  timezone?: string
}

// Organization Request Types
export interface CreateOrganizationRequest {
  name: string
}

export interface UpdateOrganizationRequest {
  name?: string
}

// Dashboard Types
export interface DashboardStats {
  totalEvents?: number
  totalRevenue?: number | string
  pendingInstallments?: number
  totalClients?: number
  monthlyRevenue?: number | string
  monthlyCosts?: number | string
  monthlyProfit?: number | string
  upcomingEvents?: number
  upcomingInstallments7Days?: number
  upcomingInstallments30Days?: number
  overdueInstallments?: number
}

export interface MonthlyEvolution {
  month: string
  year: number
  revenue: number | string
  expenses: number | string
  profit: number | string
}

// Report Types
export interface MonthlyReport {
  period: string
  revenue: number
  costs: number
  profit: number
  eventsCount: number
  contractsCount: number
  topClients: Array<{
    clientId: string
    clientName: string
    totalValue: number
  }>
  topPackages: Array<{
    packageId: string
    packageName: string
    usageCount: number
  }>
}

export interface InstallmentsReport {
  period: string
  totalInstallments: number
  paidInstallments: number
  pendingInstallments: number
  overdueInstallments: number
  totalValue: number
  paidValue: number
  pendingValue: number
  overdueValue: number
}

export interface CostsReport {
  period: string
  totalCosts: number
  costsByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
  costsByEvent: Array<{
    eventId: string
    eventName: string
    amount: number
  }>
}

// Settings Types
export interface CompanySettings {
  id: string
  companyName: string
  cnpj?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  updatedAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  entityType: string
  entityId: string
  details: any
  createdAt: string
}

