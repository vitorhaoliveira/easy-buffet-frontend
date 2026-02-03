// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T | null
  errors: string[] | null
}

export interface HttpErrorResponse {
  message: string
  error?: {
    error?: {
      message: string
    }
    message?: string
  }
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

export interface UserSubscription {
  status: 'active' | 'trialing' | 'canceled' | 'expired' | 'past_due'
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
  subscription?: UserSubscription
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

export interface UserWithData {
  data: User
}

export interface SwitchOrganizationResponse {
  currentOrganization: NonNullable<User['currentOrganization']>
}

export interface Organization {
  id: string
  name: string
  role?: string
  permissions?: UserPermissions
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
  organization: {
    id: string
    name: string
  }
}

// Client Types
export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  cpf?: string
  address?: string
  createdAt: string
  updatedAt?: string
}

// Seller Types
export interface Seller {
  id: string
  organizationId: string
  name: string
  email: string
  phone: string
  notes?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  createdBy: string
  contracts?: Array<{
    id: string
    totalAmount: string
    createdAt: string
    event: {
      id: string
      name: string
      eventDate: string
    }
  }>
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

// Unit Types
export interface Unit {
  id: string
  organizationId: string
  name: string
  code?: string
  color?: string
  zipCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
  _count?: {
    events?: number
    clients?: number
    packages?: number
    contracts?: number
  }
}

// Event Types
export interface Event {
  id: string
  clientId: string
  packageId?: string
  unitId?: string
  name: string
  eventDate: string
  eventTime: string
  location: string
  guestCount: number
  status: 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado'
  notes?: string
  createdAt: string
  updatedAt?: string
  unit?: {
    id: string
    name: string
    code?: string
    color?: string
  }
  client?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  package?: {
    id: string
    name: string
    type?: string
    price?: number
  }
}

// Contract Types
export interface Contract {
  id: string
  eventId: string
  clientId: string
  sellerId?: string | null
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
  closedAt?: string | null // Data de fechamento do contrato
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
  totalPaid?: number | string
  remainingBalance?: number | string
  paidInstallments?: number | string
  additionalPaymentsTotal?: number | string
  paymentStatus?: 'received' | 'pending' // Status calculado (apenas na listagem)
  event?: {
    id: string
    name: string
    eventDate: string
  }
  client?: {
    id: string
    name: string
  }
  seller?: {
    id: string
    name: string
    email: string
  } | null
  installments?: Installment[]
  additionalPayments?: AdditionalPayment[]
  contractItems?: ContractItem[] // Itens do contrato (quando incluído)
}

// Contract Item Types
export interface ContractItem {
  id: string
  contractId: string
  organizationId: string
  description: string // Máximo 255 caracteres
  quantity: number | string // Decimal(10, 2)
  unitPrice: number | string // Decimal(10, 2)
  totalPrice: number | string // Calculado automaticamente (quantity * unitPrice)
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

export interface CreateContractItemRequest {
  description: string
  quantity: number
  unitPrice: number
}

export interface UpdateContractItemRequest {
  description?: string
  quantity?: number
  unitPrice?: number
}

// Payment Method Types
export type PaymentMethod = 
  | 'Dinheiro'
  | 'PIX'
  | 'Cartão de Débito'
  | 'Cartão de Crédito'
  | 'Transferência Bancária'
  | 'Boleto'
  | 'Cheque'
  | 'Outro'

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
  paymentMethod?: PaymentMethod | null
  notes?: string | null
  organizationId: string
  createdAt: string
  updatedAt?: string
  contract?: {
    event: { name: string; eventDate: string }
    client: { name: string }
  }
}

// Additional Payment Types
export interface AdditionalPayment {
  id: string
  contractId: string
  amount: number | string
  paymentDate: string
  paymentMethod: PaymentMethod
  notes?: string | null
  createdAt: string
  updatedAt?: string
  contract?: {
    id: string
    event: {
      name: string
      eventDate: string
    }
    client: {
      name: string
    }
  }
  creator?: {
    id: string
    name: string
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
  unit?: {
    id: string
    name: string
    code?: string
    color?: string
  }
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
  cpf?: string
  address?: string
}

export interface UpdateClientRequest {
  name?: string
  email?: string
  phone?: string
  cpf?: string
  address?: string
}

export interface CreateSellerRequest {
  name: string
  email: string
  phone: string
  notes?: string
}

export interface UpdateSellerRequest {
  name?: string
  email?: string
  phone?: string
  notes?: string
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
  packageId?: string
  unitId?: string
  name: string
  eventDate: string
  eventTime: string
  location: string
  guestCount: number
  status: 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado'
  notes?: string
}

export interface UpdateEventRequest {
  clientId?: string
  packageId?: string
  unitId?: string
  name?: string
  eventDate?: string
  eventTime?: string
  location?: string
  guestCount?: number
  status?: 'Pendente' | 'Agendado' | 'Confirmado' | 'Concluído' | 'Cancelado'
  notes?: string
}

export interface CreateContractRequest {
  eventId: string
  clientId: string
  totalAmount: number
  installmentCount: number
  firstDueDate: string
  periodicity: 'Mensal' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual' | 'Semanal' | 'Quinzenal'
  sellerId?: string | null
  notes?: string
  /** When creating contract from an accepted quote, link to the quote */
  quoteId?: string
}

export interface UpdateContractRequest {
  status?: 'Pendente' | 'Assinado' | 'Cancelado'
  signedAt?: string
  sellerId?: string | null
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

export interface PayInstallmentRequest {
  paymentDate: string
  paymentAmount: number
  paymentMethod?: PaymentMethod
  notes?: string
}

export interface CreateAdditionalPaymentRequest {
  contractId: string
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  notes?: string
}

export interface UpdateAdditionalPaymentRequest {
  amount?: number
  paymentDate?: string
  paymentMethod?: PaymentMethod
  notes?: string
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

export interface CreateUnitRequest {
  name: string
  code?: string
  color?: string
  zipCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  notes?: string
}

export interface UpdateUnitRequest {
  name?: string
  code?: string
  color?: string
  zipCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  isActive?: boolean
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
  fantasyName?: string
  cnpj?: string
  email?: string
  phone?: string
}

export interface UpdateOrganizationRequest {
  name?: string
  fantasyName?: string
  cnpj?: string
  email?: string
  phone?: string
}

// Dashboard Types
export interface DashboardStats {
  totalEvents?: number
  totalRevenue?: number | string
  pendingInstallments?: number
  totalClients?: number
  monthlyRevenue?: number | string
  monthlyRevenueFromInstallments?: number | string
  monthlyRevenueFromAdditionalPayments?: number | string
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
  period: {
    month: number
    year: number
    monthName: string
  }
  summary: {
    revenue: number
    expenses: number
    commissions: number
    netProfit: number
    paidInstallments: number
    totalInstallments: number
    commissionRate: number
  }
  kpis: {
    realizedRevenue: number
    pendingRevenue: number
    overdueRevenue: number
    expectedRevenue: number
    realizationRate: number
    overdueRate: number
    paidCount: number
    pendingCount: number
    overdueCount: number
    totalCount: number
    additionalPaymentsTotal?: number
    additionalPaymentsCount?: number
  }
  contracts?: {
    closedInMonth: number // Quantidade de contratos fechados no mês
    open: number // Quantidade de contratos abertos (não fechados)
    withEventsInMonth: Array<{
      id: string
      eventName: string
      clientName: string
      eventDate: string // Data de realização do evento
      closedAt: string | null // Data de fechamento (se fechado)
    }>
  }
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

// Company Data Types (for "Minha Conta" page)
export interface CompanyAddress {
  zipCode?: string | null
  street?: string | null
  number?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
}

export interface CompanyContact {
  phone?: string | null
  mobile?: string | null
  email?: string | null
  website?: string | null
}

export interface CompanySocialMedia {
  instagram?: string | null
  facebook?: string | null
  twitter?: string | null
}

export interface CompanyBankInfo {
  bank?: string | null
  agency?: string | null
  account?: string | null
  accountType?: string | null
  pixKey?: string | null
}

export interface CompanyData {
  id?: string
  name: string
  fantasyName?: string
  cnpj?: string | null
  stateRegistration?: string | null
  address?: CompanyAddress
  contact?: CompanyContact
  socialMedia?: CompanySocialMedia
  bankInfo?: CompanyBankInfo
  logo?: string | null
  updatedAt?: string
}

export interface UpdateCompanyDataRequest {
  name?: string
  fantasyName?: string
  cnpj?: string | null
  stateRegistration?: string | null
  address?: CompanyAddress
  contact?: CompanyContact
  socialMedia?: CompanySocialMedia
  bankInfo?: CompanyBankInfo
  logo?: string | null
}

// Activity Log Types (for "Minha Conta" page)
export interface ActivityLogItem {
  id: string
  user: string
  action: string
  module: string
  description: string
  timestamp: string
  ip: string
}

export interface ActivityLogFilters {
  page?: number
  limit?: number
  userId?: string
  module?: string
  action?: string
  dateFrom?: string
  dateTo?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: PaginationInfo
  message?: string
}

// Commission Types
export type CommissionType = 'fixed' | 'percentage'

export interface SetCommissionRequest {
  type: CommissionType
  value: number
  sellerId?: string | null
  notes?: string
}

export interface MarkCommissionPaidRequest {
  paidAmount?: number
}

export interface CommissionDetails {
  contractId: string
  totalAmount: number
  hasCommission: boolean
  type: CommissionType | null
  baseAmount: number | null
  percentage: number
  amount: number
  isPaid: boolean
  paidAt: string | null
  paidAmount: number | null
  notes: string | null
  seller: {
    id: string
    name: string
    email: string
    phone: string
  } | null
}

// ===========================================
// CHECKLIST TYPES
// ===========================================

export type ChecklistPhase = 'pre-event' | 'event-day' | 'post-event'

export type ChecklistItemPriority = 'low' | 'medium' | 'high' | 'critical'

/**
 * Checklist Template - Reusable template for events
 */
export interface ChecklistTemplate {
  id: string
  organizationId: string
  name: string
  eventType: string
  description?: string
  isActive: boolean
  items: ChecklistTemplateItem[]
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
  _count?: {
    events?: number
  }
}

export interface ChecklistTemplateItem {
  id: string
  templateId: string
  title: string
  description?: string
  phase: ChecklistPhase
  daysBeforeEvent?: number
  priority: ChecklistItemPriority
  responsibleRole?: string
  sortOrder: number
  createdAt: string
  updatedAt?: string
}

/**
 * Event Checklist - Instance of template applied to an event
 */
export interface EventChecklist {
  id: string
  eventId: string
  templateId?: string | null
  organizationId: string
  status: 'not_started' | 'in_progress' | 'completed'
  completedItems: number
  totalItems: number
  completionPercentage: number
  items: EventChecklistItem[]
  event?: {
    id: string
    name: string
    eventDate: string
    client?: {
      name: string
    }
  }
  template?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt?: string
}

export interface EventChecklistItem {
  id: string
  eventChecklistId: string
  title: string
  description?: string
  phase: ChecklistPhase
  scheduledDate?: string
  priority: ChecklistItemPriority
  responsibleRole?: string
  assignedToId?: string | null
  assignedTo?: {
    id: string
    name: string
  }
  isCompleted: boolean
  completedAt?: string | null
  completedById?: string | null
  completedBy?: {
    id: string
    name: string
  }
  notes?: string
  sortOrder: number
  createdAt: string
  updatedAt?: string
}

// Checklist Request Types
export interface CreateChecklistTemplateRequest {
  name: string
  eventType: string
  description?: string
  isActive?: boolean
  items?: CreateChecklistTemplateItemRequest[]
}

export interface CreateChecklistTemplateItemRequest {
  title: string
  description?: string
  phase: ChecklistPhase
  daysBeforeEvent?: number
  priority: ChecklistItemPriority
  responsibleRole?: string
  sortOrder?: number
}

export interface UpdateChecklistTemplateRequest {
  name?: string
  eventType?: string
  description?: string
  isActive?: boolean
}

export interface UpdateChecklistTemplateItemRequest {
  title?: string
  description?: string
  phase?: ChecklistPhase
  daysBeforeEvent?: number
  priority?: ChecklistItemPriority
  responsibleRole?: string
  sortOrder?: number
}

export interface CreateEventChecklistRequest {
  eventId: string
  templateId?: string
  items?: CreateEventChecklistItemRequest[]
}

export interface CreateEventChecklistItemRequest {
  title: string
  description?: string
  phase: ChecklistPhase
  scheduledDate?: string
  priority: ChecklistItemPriority
  responsibleRole?: string
  assignedToId?: string
  sortOrder?: number
}

export interface UpdateEventChecklistItemRequest {
  title?: string
  description?: string
  phase?: ChecklistPhase
  scheduledDate?: string
  priority?: ChecklistItemPriority
  responsibleRole?: string
  assignedToId?: string | null
  isCompleted?: boolean
  notes?: string
  sortOrder?: number
}

export interface ToggleChecklistItemRequest {
  isCompleted: boolean
  notes?: string
}

// Quote Status Type
export type QuoteStatus = 'Rascunho' | 'Enviado' | 'Visualizado' | 'Aceito' | 'Rejeitado' | 'Expirado'

// Quote Types
export interface Quote {
  id: string
  organizationId: string
  clientId: string
  eventId?: string
  packageId: string
  sellerId?: string
  totalAmount: number
  items: QuoteItem[]
  validUntilDate: string
  status: QuoteStatus
  notes?: string
  createdAt: string
  updatedAt?: string
  sentAt?: string
  viewedAt?: string
  expiresAt?: string
  publicLinkToken?: string
  publicLinkTokenExpiresAt?: string
  client?: Client
  event?: Event
  package?: Package
  seller?: Seller
  acceptance?: QuoteAcceptance
  contract?: QuoteContract
}

export interface QuoteItem {
  id: string
  quoteId: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// Quote Acceptance Types
export interface QuoteAcceptance {
  id: string
  quoteId: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  cpf?: string
  termsAccepted: boolean
  termsAcceptedAt: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  acceptedBy?: string
}

export interface QuoteContract {
  id: string
  quoteId: string
  contractId?: string
  contractTemplateName: string
  contractHtmlContent?: string
  contractPdfPath?: string
  generatedAt?: string
  createdAt: string
  updatedAt?: string
}

// Quote Request Types
export interface CreateQuoteRequest {
  clientId: string
  eventId?: string
  packageId: string
  sellerId?: string
  items: CreateQuoteItemRequest[]
  validUntilDate: string
  notes?: string
}

export interface CreateQuoteItemRequest {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface UpdateQuoteRequest {
  clientId?: string
  eventId?: string
  packageId?: string
  sellerId?: string
  items?: CreateQuoteItemRequest[]
  validUntilDate?: string
  notes?: string
  status?: QuoteStatus
}

export interface SendQuoteRequest {
  clientEmail: string
  clientName?: string
  customMessage?: string
}

export interface AcceptQuoteRequest {
  clientName: string
  clientEmail?: string
  clientPhone?: string
  cpf?: string
  termsAccepted: boolean
}

export interface RejectQuoteRequest {
  reason?: string
}

export interface GenerateContractRequest {
  generatePdf?: boolean
  downloadImmediately?: boolean
}

// Quote Response Types
export interface QuoteResponse {
  id: string
  organizationId: string
  client: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  event?: {
    id: string
    name: string
    eventDate: string
    guestCount?: number
  }
  package: {
    id: string
    name: string
    type?: string
  }
  seller?: {
    id: string
    name: string
  }
  totalAmount: number
  items: QuoteItem[]
  notes?: string
  status: QuoteStatus
  validUntilDate: string
  sentAt?: string
  viewedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt?: string
  publicLinkUrl?: string
  publicLinkToken?: string
  publicLinkTokenExpiresAt?: string
}

export interface QuoteAcceptanceResponse {
  id: string
  quoteId: string
  clientName: string
  clientEmail?: string
  cpf?: string
  termsAccepted: boolean
  termsAcceptedAt: string
  createdAt: string
}

export interface ContractGenerationResponse {
  id: string
  quoteId: string
  contractId?: string
  contractTemplateName: string
  contractPdfPath?: string
  generatedAt: string
  htmlPreview?: string
}

// Contract Configuration
export interface ContractClause {
  id: string
  title: string
  content: string
  order: number
  isRequired: boolean
  isActive: boolean
}

export interface ContractConfiguration {
  id: string
  organizationId: string
  clauses: ContractClause[]
  createdAt: string
  updatedAt: string
}

// User Limit Types
export interface UserLimit {
  limit: number
  current: number
  available: number
}

export interface AddUsersRequest {
  quantity: number
}

export interface AddUsersResponse {
  message: string
  newLimit: number
}

// Team Management Types
export type ConfirmationStatus = 'pendente' | 'confirmado' | 'cancelado'

export interface TeamMember {
  id: string
  name: string
  phone: string
  email?: string | null
  notes?: string | null
  organizationId?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface TeamSchedule {
  id: string
  eventId: string
  teamMemberId: string
  role: string
  arrivalTime: string
  notes?: string | null
  confirmationStatus: ConfirmationStatus
  confirmationToken?: string | null
  confirmationTokenExpiresAt?: string | null
  confirmedAt?: string | null
  cancelledAt?: string | null
  teamMember: {
    id: string
    name: string
    phone: string
    email?: string | null
    notes?: string | null
  }
  event: {
    id: string
    name: string
    eventDate: string
    eventTime: string
    location?: string
    client?: {
      id: string
      name: string
    }
    organization?: {
      id: string
      name: string
      fantasyName?: string
      phone?: string
    }
  }
}

export interface CreateTeamMemberRequest {
  name: string
  phone: string
  email?: string
  notes?: string
}

export interface UpdateTeamMemberRequest {
  name?: string
  phone?: string
  email?: string | null
  notes?: string
}

export interface CreateTeamScheduleRequest {
  teamMemberId: string
  role: string
  arrivalTime: string // Format: HH:MM
  notes?: string
}

export interface UpdateTeamScheduleRequest {
  role?: string
  arrivalTime?: string // Format: HH:MM
  notes?: string
}

export interface TeamScheduleDayView {
  event: {
    id: string
    name: string
    eventDate: string
    eventTime: string
    location?: string
    guestCount?: number
    client: {
      id: string
      name: string
      phone?: string
    }
    unit?: {
      id: string
      name: string
      color?: string
    }
  }
  schedules: Record<string, TeamSchedule[]> | TeamSchedule[]
  statusCounts: {
    pendente: number
    confirmado: number
    cancelado: number
  }
  total: number
}

export interface SendConfirmationResponse {
  confirmationUrl: string
  whatsappUrl: string
  emailSent: boolean
}

export interface PaginatedTeamMemberResponse {
  success: boolean
  data: TeamMember[]
  pagination: PaginationInfo
  message?: string
}

