import { type MonthlyReport, type ReportInstallment, type ReportCost } from './types'

// Taxa de comissão padrão
const DEFAULT_COMMISSION_RATE = 0.10 // 10%

// Dados mock específicos para relatórios mensais
export const mockReportData = {
  // Janeiro 2024
  '2024-01': {
    installments: [
      {
        id: '1',
        contractId: 'CT001',
        clientName: 'João Silva',
        eventName: 'Casamento João & Maria',
        amount: 2500.00,
        paymentDate: '2024-01-08',
        commissionAmount: 250.00,
        commissionRate: DEFAULT_COMMISSION_RATE
      },
      {
        id: '2',
        contractId: 'CT001',
        clientName: 'João Silva',
        eventName: 'Casamento João & Maria',
        amount: 2500.00,
        paymentDate: '2024-01-18',
        commissionAmount: 250.00,
        commissionRate: DEFAULT_COMMISSION_RATE
      },
      {
        id: '4',
        contractId: 'CT002',
        clientName: 'Ana Costa',
        eventName: 'Aniversário 50 anos',
        amount: 1800.00,
        paymentDate: '2024-01-19',
        commissionAmount: 180.00,
        commissionRate: DEFAULT_COMMISSION_RATE
      }
    ] as ReportInstallment[],
    costs: [
      {
        id: '1',
        eventName: 'Casamento João & Maria',
        description: 'Ingredientes para buffet',
        amount: 800.00,
        category: 'food' as const,
        createdAt: '2024-01-12'
      },
      {
        id: '2',
        eventName: 'Casamento João & Maria',
        description: 'Salário equipe de cozinha',
        amount: 600.00,
        category: 'staff' as const,
        createdAt: '2024-01-12'
      },
      {
        id: '3',
        eventName: 'Casamento João & Maria',
        description: 'Aluguel de equipamentos',
        amount: 300.00,
        category: 'equipment' as const,
        createdAt: '2024-01-12'
      },
      {
        id: '4',
        eventName: 'Aniversário 50 anos',
        description: 'Ingredientes para buffet',
        amount: 450.00,
        category: 'food' as const,
        createdAt: '2024-01-22'
      },
      {
        id: '5',
        eventName: 'Aniversário 50 anos',
        description: 'Salário equipe de cozinha',
        amount: 350.00,
        category: 'staff' as const,
        createdAt: '2024-01-22'
      }
    ] as ReportCost[]
  },

  // Fevereiro 2024
  '2024-02': {
    installments: [
      {
        id: '8',
        contractId: 'CT003',
        clientName: 'Pedro Santos',
        eventName: 'Formatura Medicina',
        amount: 3200.00,
        paymentDate: '2024-02-14',
        commissionAmount: 320.00,
        commissionRate: DEFAULT_COMMISSION_RATE
      }
    ] as ReportInstallment[],
    costs: [
      {
        id: '6',
        eventName: 'Formatura Medicina',
        description: 'Ingredientes para buffet',
        amount: 1200.00,
        category: 'food' as const,
        createdAt: '2024-02-05'
      },
      {
        id: '7',
        eventName: 'Formatura Medicina',
        description: 'Transporte dos equipamentos',
        amount: 150.00,
        category: 'transport' as const,
        createdAt: '2024-02-05'
      },
      {
        id: '8',
        eventName: 'Formatura Medicina',
        description: 'Salário equipe de garçons',
        amount: 800.00,
        category: 'staff' as const,
        createdAt: '2024-02-05'
      },
      {
        id: '9',
        eventName: 'Batizado do Lucas',
        description: 'Ingredientes para buffet',
        amount: 400.00,
        category: 'food' as const,
        createdAt: '2024-02-15'
      },
      {
        id: '10',
        eventName: 'Batizado do Lucas',
        description: 'Decoração e montagem',
        amount: 250.00,
        category: 'equipment' as const,
        createdAt: '2024-02-15'
      }
    ] as ReportCost[]
  },

  // Março 2024
  '2024-03': {
    installments: [
      {
        id: '13',
        contractId: 'CT006',
        clientName: 'Fernanda Lima',
        eventName: 'Chá de Bebê',
        amount: 800.00,
        paymentDate: '2024-03-14',
        commissionAmount: 80.00,
        commissionRate: DEFAULT_COMMISSION_RATE
      },
      {
        id: '14',
        contractId: 'CT007',
        clientName: 'Roberto Alves',
        eventName: 'Aniversário de 60 anos',
        amount: 1500.00,
        paymentDate: '2024-03-24',
        commissionAmount: 150.00,
        commissionRate: DEFAULT_COMMISSION_RATE
      }
    ] as ReportInstallment[],
    costs: [
      {
        id: '11',
        eventName: 'Festa de 15 anos da Sofia',
        description: 'Ingredientes para buffet',
        amount: 900.00,
        category: 'food' as const,
        createdAt: '2024-03-01'
      },
      {
        id: '12',
        eventName: 'Festa de 15 anos da Sofia',
        description: 'Equipe de atendimento',
        amount: 600.00,
        category: 'staff' as const,
        createdAt: '2024-03-01'
      },
      {
        id: '13',
        eventName: 'Festa de 15 anos da Sofia',
        description: 'Aluguel de mesas e cadeiras',
        amount: 350.00,
        category: 'equipment' as const,
        createdAt: '2024-03-01'
      },
      {
        id: '14',
        eventName: 'Chá de Bebê',
        description: 'Ingredientes para doces',
        amount: 250.00,
        category: 'food' as const,
        createdAt: '2024-03-15'
      },
      {
        id: '15',
        eventName: 'Chá de Bebê',
        description: 'Ajudante de cozinha',
        amount: 150.00,
        category: 'staff' as const,
        createdAt: '2024-03-15'
      },
      {
        id: '16',
        eventName: 'Aniversário de 60 anos',
        description: 'Ingredientes premium',
        amount: 650.00,
        category: 'food' as const,
        createdAt: '2024-03-25'
      },
      {
        id: '17',
        eventName: 'Aniversário de 60 anos',
        description: 'Chef especializado',
        amount: 500.00,
        category: 'staff' as const,
        createdAt: '2024-03-25'
      },
      {
        id: '18',
        eventName: 'Aniversário de 60 anos',
        description: 'Transporte refrigerado',
        amount: 200.00,
        category: 'transport' as const,
        createdAt: '2024-03-25'
      }
    ] as ReportCost[]
  },

  // Abril 2024
  '2024-04': {
    installments: [],
    costs: [
      {
        id: '19',
        eventName: 'Formatura de Direito',
        description: 'Ingredientes para buffet completo',
        amount: 1100.00,
        category: 'food' as const,
        createdAt: '2024-04-10'
      },
      {
        id: '20',
        eventName: 'Formatura de Direito',
        description: 'Equipe completa de garçons',
        amount: 900.00,
        category: 'staff' as const,
        createdAt: '2024-04-10'
      },
      {
        id: '21',
        eventName: 'Formatura de Direito',
        description: 'Equipamentos de som e iluminação',
        amount: 450.00,
        category: 'equipment' as const,
        createdAt: '2024-04-10'
      }
    ] as ReportCost[]
  },

  // Maio 2024
  '2024-05': {
    installments: [],
    costs: []
  },

  // Junho 2024
  '2024-06': {
    installments: [
      {
        id: '22',
        contractId: 'CT009',
        clientName: 'Marcos Silva',
        eventName: 'Casamento de Prata',
        amount: 3500.00,
        paymentDate: '2024-06-14',
        commissionAmount: 350.00,
        commissionRate: DEFAULT_COMMISSION_RATE
      },
      {
        id: '24',
        contractId: 'CT010',
        clientName: 'Lucia Ferreira',
        eventName: 'Festa Junina',
        amount: 950.00,
        paymentDate: '2024-06-19',
        commissionAmount: 95.00,
        commissionRate: DEFAULT_COMMISSION_RATE
      }
    ] as ReportInstallment[],
    costs: [
      {
        id: '22',
        eventName: 'Casamento de Prata',
        description: 'Ingredientes especiais',
        amount: 1500.00,
        category: 'food' as const,
        createdAt: '2024-06-25'
      },
      {
        id: '23',
        eventName: 'Casamento de Prata',
        description: 'Equipe premium',
        amount: 1200.00,
        category: 'staff' as const,
        createdAt: '2024-06-25'
      },
      {
        id: '24',
        eventName: 'Casamento de Prata',
        description: 'Van para transporte',
        amount: 300.00,
        category: 'transport' as const,
        createdAt: '2024-06-25'
      },
      {
        id: '25',
        eventName: 'Festa Junina',
        description: 'Ingredientes típicos juninos',
        amount: 350.00,
        category: 'food' as const,
        createdAt: '2024-06-20'
      },
      {
        id: '26',
        eventName: 'Festa Junina',
        description: 'Ajudantes',
        amount: 200.00,
        category: 'staff' as const,
        createdAt: '2024-06-20'
      },
      {
        id: '27',
        eventName: 'Festa Junina',
        description: 'Decoração temática',
        amount: 150.00,
        category: 'other' as const,
        createdAt: '2024-06-20'
      }
    ] as ReportCost[]
  }
}

// Função para obter dados do relatório por mês/ano
export const getReportData = (month: number, year: number) => {
  const key = `${year}-${month.toString().padStart(2, '0')}`
  return mockReportData[key as keyof typeof mockReportData] || { installments: [], costs: [] }
}

// Função para calcular resumo mensal
export const calculateMonthlyReportFromMock = (month: number, year: number): MonthlyReport => {
  const data = getReportData(month, year)
  
  const revenue = data.installments.reduce((sum, installment) => sum + installment.amount, 0)
  const expenses = data.costs.reduce((sum, cost) => sum + cost.amount, 0)
  const commissions = data.installments.reduce((sum, installment) => sum + installment.commissionAmount, 0)
  const netProfit = revenue - expenses - commissions

  return {
    month,
    year,
    revenue,
    expenses,
    commissions,
    netProfit,
    paidInstallments: data.installments.length,
    totalInstallments: data.installments.length, // Para mock, consideramos apenas as pagas
    commissionRate: DEFAULT_COMMISSION_RATE
  }
}

// Função para obter parcelas pagas do mês
export const getPaidInstallmentsForMonthFromMock = (month: number, year: number): ReportInstallment[] => {
  const data = getReportData(month, year)
  return data.installments
}

// Função para obter custos do mês
export const getCostsForMonthFromMock = (month: number, year: number): ReportCost[] => {
  const data = getReportData(month, year)
  return data.costs
}
