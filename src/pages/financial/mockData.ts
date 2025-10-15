import { type FinancialInstallment, type FinancialCost, type FinancialSummary } from './types'

// Dados mock para parcelas (entradas)
export const mockInstallments: FinancialInstallment[] = [
  {
    id: '1',
    contractId: 'CT001',
    clientName: 'João Silva',
    eventName: 'Casamento João & Maria',
    eventDate: '2024-01-15',
    installmentNumber: 1,
    totalInstallments: 3,
    amount: 2500.00,
    dueDate: '2024-01-10',
    status: 'paid',
    paymentDate: '2024-01-08',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    contractId: 'CT001',
    clientName: 'João Silva',
    eventName: 'Casamento João & Maria',
    eventDate: '2024-01-15',
    installmentNumber: 2,
    totalInstallments: 3,
    amount: 2500.00,
    dueDate: '2024-01-20',
    status: 'paid',
    paymentDate: '2024-01-18',
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    contractId: 'CT001',
    clientName: 'João Silva',
    eventName: 'Casamento João & Maria',
    eventDate: '2024-01-15',
    installmentNumber: 3,
    totalInstallments: 3,
    amount: 2500.00,
    dueDate: '2024-01-30',
    status: 'pending',
    createdAt: '2024-01-01'
  },
  {
    id: '4',
    contractId: 'CT002',
    clientName: 'Ana Costa',
    eventName: 'Aniversário 50 anos',
    eventDate: '2024-01-25',
    installmentNumber: 1,
    totalInstallments: 2,
    amount: 1800.00,
    dueDate: '2024-01-20',
    status: 'paid',
    paymentDate: '2024-01-19',
    createdAt: '2024-01-05'
  },
  {
    id: '5',
    contractId: 'CT002',
    clientName: 'Ana Costa',
    eventName: 'Aniversário 50 anos',
    eventDate: '2024-01-25',
    installmentNumber: 2,
    totalInstallments: 2,
    amount: 1800.00,
    dueDate: '2024-01-30',
    status: 'pending',
    createdAt: '2024-01-05'
  },
  {
    id: '6',
    contractId: 'CT003',
    clientName: 'Pedro Santos',
    eventName: 'Formatura Medicina',
    eventDate: '2024-02-10',
    installmentNumber: 1,
    totalInstallments: 4,
    amount: 3200.00,
    dueDate: '2024-01-15',
    status: 'overdue',
    createdAt: '2024-01-10'
  },
  {
    id: '7',
    contractId: 'CT004',
    clientName: 'Maria Oliveira',
    eventName: 'Batizado do Lucas',
    eventDate: '2024-02-20',
    installmentNumber: 1,
    totalInstallments: 1,
    amount: 1200.00,
    dueDate: '2024-02-15',
    status: 'pending',
    createdAt: '2024-01-15'
  },
  // Parcelas adicionais para testes
  {
    id: '8',
    contractId: 'CT003',
    clientName: 'Pedro Santos',
    eventName: 'Formatura Medicina',
    eventDate: '2024-02-10',
    installmentNumber: 2,
    totalInstallments: 4,
    amount: 3200.00,
    dueDate: '2024-02-15',
    status: 'paid',
    paymentDate: '2024-02-14',
    createdAt: '2024-01-10'
  },
  {
    id: '9',
    contractId: 'CT003',
    clientName: 'Pedro Santos',
    eventName: 'Formatura Medicina',
    eventDate: '2024-02-10',
    installmentNumber: 3,
    totalInstallments: 4,
    amount: 3200.00,
    dueDate: '2024-03-15',
    status: 'pending',
    createdAt: '2024-01-10'
  },
  {
    id: '10',
    contractId: 'CT003',
    clientName: 'Pedro Santos',
    eventName: 'Formatura Medicina',
    eventDate: '2024-02-10',
    installmentNumber: 4,
    totalInstallments: 4,
    amount: 3200.00,
    dueDate: '2024-04-15',
    status: 'pending',
    createdAt: '2024-01-10'
  },
  {
    id: '11',
    contractId: 'CT005',
    clientName: 'Carlos Mendes',
    eventName: 'Festa de 15 anos da Sofia',
    eventDate: '2024-03-05',
    installmentNumber: 1,
    totalInstallments: 2,
    amount: 2200.00,
    dueDate: '2024-02-28',
    status: 'overdue',
    createdAt: '2024-02-01'
  },
  {
    id: '12',
    contractId: 'CT005',
    clientName: 'Carlos Mendes',
    eventName: 'Festa de 15 anos da Sofia',
    eventDate: '2024-03-05',
    installmentNumber: 2,
    totalInstallments: 2,
    amount: 2200.00,
    dueDate: '2024-03-28',
    status: 'pending',
    createdAt: '2024-02-01'
  },
  {
    id: '13',
    contractId: 'CT006',
    clientName: 'Fernanda Lima',
    eventName: 'Chá de Bebê',
    eventDate: '2024-03-20',
    installmentNumber: 1,
    totalInstallments: 1,
    amount: 800.00,
    dueDate: '2024-03-15',
    status: 'paid',
    paymentDate: '2024-03-14',
    createdAt: '2024-02-15'
  },
  {
    id: '14',
    contractId: 'CT007',
    clientName: 'Roberto Alves',
    eventName: 'Aniversário de 60 anos',
    eventDate: '2024-04-10',
    installmentNumber: 1,
    totalInstallments: 3,
    amount: 1500.00,
    dueDate: '2024-03-25',
    status: 'paid',
    paymentDate: '2024-03-24',
    createdAt: '2024-03-01'
  },
  {
    id: '15',
    contractId: 'CT007',
    clientName: 'Roberto Alves',
    eventName: 'Aniversário de 60 anos',
    eventDate: '2024-04-10',
    installmentNumber: 2,
    totalInstallments: 3,
    amount: 1500.00,
    dueDate: '2024-04-25',
    status: 'pending',
    createdAt: '2024-03-01'
  },
  {
    id: '16',
    contractId: 'CT007',
    clientName: 'Roberto Alves',
    eventName: 'Aniversário de 60 anos',
    eventDate: '2024-04-10',
    installmentNumber: 3,
    totalInstallments: 3,
    amount: 1500.00,
    dueDate: '2024-05-25',
    status: 'pending',
    createdAt: '2024-03-01'
  },
  {
    id: '17',
    contractId: 'CT008',
    clientName: 'Patricia Costa',
    eventName: 'Formatura de Direito',
    eventDate: '2024-05-15',
    installmentNumber: 1,
    totalInstallments: 5,
    amount: 1800.00,
    dueDate: '2024-04-20',
    status: 'overdue',
    createdAt: '2024-04-01'
  },
  {
    id: '18',
    contractId: 'CT008',
    clientName: 'Patricia Costa',
    eventName: 'Formatura de Direito',
    eventDate: '2024-05-15',
    installmentNumber: 2,
    totalInstallments: 5,
    amount: 1800.00,
    dueDate: '2024-05-20',
    status: 'pending',
    createdAt: '2024-04-01'
  },
  {
    id: '19',
    contractId: 'CT008',
    clientName: 'Patricia Costa',
    eventName: 'Formatura de Direito',
    eventDate: '2024-05-15',
    installmentNumber: 3,
    totalInstallments: 5,
    amount: 1800.00,
    dueDate: '2024-06-20',
    status: 'pending',
    createdAt: '2024-04-01'
  },
  {
    id: '20',
    contractId: 'CT008',
    clientName: 'Patricia Costa',
    eventName: 'Formatura de Direito',
    eventDate: '2024-05-15',
    installmentNumber: 4,
    totalInstallments: 5,
    amount: 1800.00,
    dueDate: '2024-07-20',
    status: 'pending',
    createdAt: '2024-04-01'
  },
  {
    id: '21',
    contractId: 'CT008',
    clientName: 'Patricia Costa',
    eventName: 'Formatura de Direito',
    eventDate: '2024-05-15',
    installmentNumber: 5,
    totalInstallments: 5,
    amount: 1800.00,
    dueDate: '2024-08-20',
    status: 'pending',
    createdAt: '2024-04-01'
  },
  {
    id: '22',
    contractId: 'CT009',
    clientName: 'Marcos Silva',
    eventName: 'Casamento de Prata',
    eventDate: '2024-06-30',
    installmentNumber: 1,
    totalInstallments: 2,
    amount: 3500.00,
    dueDate: '2024-06-15',
    status: 'paid',
    paymentDate: '2024-06-14',
    createdAt: '2024-05-01'
  },
  {
    id: '23',
    contractId: 'CT009',
    clientName: 'Marcos Silva',
    eventName: 'Casamento de Prata',
    eventDate: '2024-06-30',
    installmentNumber: 2,
    totalInstallments: 2,
    amount: 3500.00,
    dueDate: '2024-07-15',
    status: 'pending',
    createdAt: '2024-05-01'
  },
  {
    id: '24',
    contractId: 'CT010',
    clientName: 'Lucia Ferreira',
    eventName: 'Festa Junina',
    eventDate: '2024-06-24',
    installmentNumber: 1,
    totalInstallments: 1,
    amount: 950.00,
    dueDate: '2024-06-20',
    status: 'paid',
    paymentDate: '2024-06-19',
    createdAt: '2024-05-15'
  }
]

// Dados mock para custos (saídas)
export const mockCosts: FinancialCost[] = [
  {
    id: '1',
    eventId: 'EV001',
    eventName: 'Casamento João & Maria',
    eventDate: '2024-01-15',
    description: 'Ingredientes para buffet',
    amount: 800.00,
    category: 'food',
    createdAt: '2024-01-12'
  },
  {
    id: '2',
    eventId: 'EV001',
    eventName: 'Casamento João & Maria',
    eventDate: '2024-01-15',
    description: 'Salário equipe de cozinha',
    amount: 600.00,
    category: 'staff',
    createdAt: '2024-01-12'
  },
  {
    id: '3',
    eventId: 'EV001',
    eventName: 'Casamento João & Maria',
    eventDate: '2024-01-15',
    description: 'Aluguel de equipamentos',
    amount: 300.00,
    category: 'equipment',
    createdAt: '2024-01-12'
  },
  {
    id: '4',
    eventId: 'EV002',
    eventName: 'Aniversário 50 anos',
    eventDate: '2024-01-25',
    description: 'Ingredientes para buffet',
    amount: 450.00,
    category: 'food',
    createdAt: '2024-01-22'
  },
  {
    id: '5',
    eventId: 'EV002',
    eventName: 'Aniversário 50 anos',
    eventDate: '2024-01-25',
    description: 'Salário equipe de cozinha',
    amount: 350.00,
    category: 'staff',
    createdAt: '2024-01-22'
  },
  {
    id: '6',
    eventId: 'EV003',
    eventName: 'Formatura Medicina',
    eventDate: '2024-02-10',
    description: 'Ingredientes para buffet',
    amount: 1200.00,
    category: 'food',
    createdAt: '2024-02-05'
  },
  {
    id: '7',
    eventId: 'EV003',
    eventName: 'Formatura Medicina',
    eventDate: '2024-02-10',
    description: 'Transporte dos equipamentos',
    amount: 150.00,
    category: 'transport',
    createdAt: '2024-02-05'
  },
  // Custos adicionais para testes
  {
    id: '8',
    eventId: 'EV003',
    eventName: 'Formatura Medicina',
    eventDate: '2024-02-10',
    description: 'Salário equipe de garçons',
    amount: 800.00,
    category: 'staff',
    createdAt: '2024-02-05'
  },
  {
    id: '9',
    eventId: 'EV004',
    eventName: 'Batizado do Lucas',
    eventDate: '2024-02-20',
    description: 'Ingredientes para buffet',
    amount: 400.00,
    category: 'food',
    createdAt: '2024-02-15'
  },
  {
    id: '10',
    eventId: 'EV004',
    eventName: 'Batizado do Lucas',
    eventDate: '2024-02-20',
    description: 'Decoração e montagem',
    amount: 250.00,
    category: 'equipment',
    createdAt: '2024-02-15'
  },
  {
    id: '11',
    eventId: 'EV005',
    eventName: 'Festa de 15 anos da Sofia',
    eventDate: '2024-03-05',
    description: 'Ingredientes para buffet',
    amount: 900.00,
    category: 'food',
    createdAt: '2024-03-01'
  },
  {
    id: '12',
    eventId: 'EV005',
    eventName: 'Festa de 15 anos da Sofia',
    eventDate: '2024-03-05',
    description: 'Equipe de atendimento',
    amount: 600.00,
    category: 'staff',
    createdAt: '2024-03-01'
  },
  {
    id: '13',
    eventId: 'EV005',
    eventName: 'Festa de 15 anos da Sofia',
    eventDate: '2024-03-05',
    description: 'Aluguel de mesas e cadeiras',
    amount: 350.00,
    category: 'equipment',
    createdAt: '2024-03-01'
  },
  {
    id: '14',
    eventId: 'EV006',
    eventName: 'Chá de Bebê',
    eventDate: '2024-03-20',
    description: 'Ingredientes para doces',
    amount: 250.00,
    category: 'food',
    createdAt: '2024-03-15'
  },
  {
    id: '15',
    eventId: 'EV006',
    eventName: 'Chá de Bebê',
    eventDate: '2024-03-20',
    description: 'Ajudante de cozinha',
    amount: 150.00,
    category: 'staff',
    createdAt: '2024-03-15'
  },
  {
    id: '16',
    eventId: 'EV007',
    eventName: 'Aniversário de 60 anos',
    eventDate: '2024-04-10',
    description: 'Ingredientes premium',
    amount: 650.00,
    category: 'food',
    createdAt: '2024-04-05'
  },
  {
    id: '17',
    eventId: 'EV007',
    eventName: 'Aniversário de 60 anos',
    eventDate: '2024-04-10',
    description: 'Chef especializado',
    amount: 500.00,
    category: 'staff',
    createdAt: '2024-04-05'
  },
  {
    id: '18',
    eventId: 'EV007',
    eventName: 'Aniversário de 60 anos',
    eventDate: '2024-04-10',
    description: 'Transporte refrigerado',
    amount: 200.00,
    category: 'transport',
    createdAt: '2024-04-05'
  },
  {
    id: '19',
    eventId: 'EV008',
    eventName: 'Formatura de Direito',
    eventDate: '2024-05-15',
    description: 'Ingredientes para buffet completo',
    amount: 1100.00,
    category: 'food',
    createdAt: '2024-05-10'
  },
  {
    id: '20',
    eventId: 'EV008',
    eventName: 'Formatura de Direito',
    eventDate: '2024-05-15',
    description: 'Equipe completa de garçons',
    amount: 900.00,
    category: 'staff',
    createdAt: '2024-05-10'
  },
  {
    id: '21',
    eventId: 'EV008',
    eventName: 'Formatura de Direito',
    eventDate: '2024-05-15',
    description: 'Equipamentos de som e iluminação',
    amount: 450.00,
    category: 'equipment',
    createdAt: '2024-05-10'
  },
  {
    id: '22',
    eventId: 'EV009',
    eventName: 'Casamento de Prata',
    eventDate: '2024-06-30',
    description: 'Ingredientes especiais',
    amount: 1500.00,
    category: 'food',
    createdAt: '2024-06-25'
  },
  {
    id: '23',
    eventId: 'EV009',
    eventName: 'Casamento de Prata',
    eventDate: '2024-06-30',
    description: 'Equipe premium',
    amount: 1200.00,
    category: 'staff',
    createdAt: '2024-06-25'
  },
  {
    id: '24',
    eventId: 'EV009',
    eventName: 'Casamento de Prata',
    eventDate: '2024-06-30',
    description: 'Van para transporte',
    amount: 300.00,
    category: 'transport',
    createdAt: '2024-06-25'
  },
  {
    id: '25',
    eventId: 'EV010',
    eventName: 'Festa Junina',
    eventDate: '2024-06-24',
    description: 'Ingredientes típicos juninos',
    amount: 350.00,
    category: 'food',
    createdAt: '2024-06-20'
  },
  {
    id: '26',
    eventId: 'EV010',
    eventName: 'Festa Junina',
    eventDate: '2024-06-24',
    description: 'Ajudantes',
    amount: 200.00,
    category: 'staff',
    createdAt: '2024-06-20'
  },
  {
    id: '27',
    eventId: 'EV010',
    eventName: 'Festa Junina',
    eventDate: '2024-06-24',
    description: 'Decoração temática',
    amount: 150.00,
    category: 'other',
    createdAt: '2024-06-20'
  }
]

// Função para calcular resumo financeiro
export const calculateFinancialSummary = (
  installments: FinancialInstallment[],
  costs: FinancialCost[],
  month?: number,
  year?: number
): FinancialSummary => {
  let filteredInstallments = installments
  let filteredCosts = costs

  if (month && year) {
    filteredInstallments = installments.filter(installment => {
      const installmentDate = new Date(installment.dueDate)
      return installmentDate.getMonth() + 1 === month && installmentDate.getFullYear() === year
    })

    filteredCosts = costs.filter(cost => {
      const costDate = new Date(cost.createdAt)
      return costDate.getMonth() + 1 === month && costDate.getFullYear() === year
    })
  }

  const totalIncome = filteredInstallments
    .filter(installment => installment.status === 'paid')
    .reduce((sum, installment) => sum + installment.amount, 0)

  const totalExpenses = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0)

  const paidInstallments = filteredInstallments.filter(installment => installment.status === 'paid').length
  const pendingInstallments = filteredInstallments.filter(installment => installment.status === 'pending').length
  const overdueInstallments = filteredInstallments.filter(installment => installment.status === 'overdue').length

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    paidInstallments,
    pendingInstallments,
    overdueInstallments
  }
}
