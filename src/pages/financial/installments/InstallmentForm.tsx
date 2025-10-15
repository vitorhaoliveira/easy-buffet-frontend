import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X, DollarSign, Calendar, FileText, User } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input/input'
import { Label } from '@/components/ui/label/label'

interface InstallmentFormData {
  contractId: string
  clientName: string
  eventName: string
  eventDate: string
  installmentNumber: string
  totalInstallments: string
  amount: string
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  paymentDate?: string
  observations: string
}

// Mock data para contratos - substituir por dados reais da API
const mockContracts = [
  {
    id: 'CT001',
    eventName: 'Casamento João & Maria',
    clientName: 'João Silva',
    eventDate: '2024-01-15',
    totalInstallments: 3,
    totalValue: 7500.00,
    status: 'Ativo'
  },
  {
    id: 'CT002',
    eventName: 'Aniversário 50 anos',
    clientName: 'Ana Costa',
    eventDate: '2024-01-25',
    totalInstallments: 2,
    totalValue: 3600.00,
    status: 'Ativo'
  },
  {
    id: 'CT003',
    eventName: 'Formatura Medicina',
    clientName: 'Pedro Santos',
    eventDate: '2024-02-10',
    totalInstallments: 4,
    totalValue: 12800.00,
    status: 'Ativo'
  },
  {
    id: 'CT004',
    eventName: 'Batizado do Lucas',
    clientName: 'Maria Oliveira',
    eventDate: '2024-02-20',
    totalInstallments: 1,
    totalValue: 1200.00,
    status: 'Ativo'
  },
  {
    id: 'CT005',
    eventName: 'Festa de 15 anos da Sofia',
    clientName: 'Carlos Mendes',
    eventDate: '2024-03-05',
    totalInstallments: 2,
    totalValue: 4400.00,
    status: 'Ativo'
  },
  {
    id: 'CT006',
    eventName: 'Chá de Bebê',
    clientName: 'Fernanda Lima',
    eventDate: '2024-03-20',
    totalInstallments: 1,
    totalValue: 800.00,
    status: 'Ativo'
  },
  {
    id: 'CT007',
    eventName: 'Aniversário de 60 anos',
    clientName: 'Roberto Alves',
    eventDate: '2024-04-10',
    totalInstallments: 3,
    totalValue: 4500.00,
    status: 'Ativo'
  },
  {
    id: 'CT008',
    eventName: 'Formatura de Direito',
    clientName: 'Patricia Costa',
    eventDate: '2024-05-15',
    totalInstallments: 5,
    totalValue: 9000.00,
    status: 'Ativo'
  },
  {
    id: 'CT009',
    eventName: 'Casamento de Prata',
    clientName: 'Marcos Silva',
    eventDate: '2024-06-30',
    totalInstallments: 2,
    totalValue: 7000.00,
    status: 'Ativo'
  },
  {
    id: 'CT010',
    eventName: 'Festa Junina',
    clientName: 'Lucia Ferreira',
    eventDate: '2024-06-24',
    totalInstallments: 1,
    totalValue: 950.00,
    status: 'Ativo'
  }
]

export default function InstallmentForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState<InstallmentFormData>({
    contractId: '',
    clientName: '',
    eventName: '',
    eventDate: '',
    installmentNumber: '',
    totalInstallments: '',
    amount: '',
    dueDate: '',
    status: 'pending',
    paymentDate: '',
    observations: ''
  })

  const [errors, setErrors] = useState<Partial<InstallmentFormData>>({})
  const [selectedContract, setSelectedContract] = useState<any>(null)

  // Carregar dados do contrato quando selecionado
  useEffect(() => {
    if (formData.contractId) {
      const contract = mockContracts.find(c => c.id === formData.contractId)
      if (contract) {
        setSelectedContract(contract)
        setFormData(prev => ({
          ...prev,
          clientName: contract.clientName,
          eventName: contract.eventName,
          eventDate: contract.eventDate,
          totalInstallments: contract.totalInstallments.toString()
        }))
      }
    }
  }, [formData.contractId])

  const handleInputChange = (field: keyof InstallmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<InstallmentFormData> = {}

    if (!formData.contractId.trim()) {
      newErrors.contractId = 'Contrato é obrigatório'
    }

    if (!formData.installmentNumber.trim()) {
      newErrors.installmentNumber = 'Número da parcela é obrigatório'
    } else {
      const installmentNum = parseInt(formData.installmentNumber)
      const totalInstallments = parseInt(formData.totalInstallments)
      if (installmentNum < 1 || installmentNum > totalInstallments) {
        newErrors.installmentNumber = `Número da parcela deve estar entre 1 e ${totalInstallments}`
      }
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Valor é obrigatório'
    } else {
      const amount = parseFloat(formData.amount)
      if (amount <= 0) {
        newErrors.amount = 'Valor deve ser maior que zero'
      }
    }

    if (!formData.dueDate.trim()) {
      newErrors.dueDate = 'Data de vencimento é obrigatória'
    }

    if (formData.status === 'paid' && !formData.paymentDate?.trim()) {
      newErrors.paymentDate = 'Data de pagamento é obrigatória quando status é "Pago"'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Implementar lógica de salvamento
    console.log('Salvando parcela:', formData)
    
    // Simular salvamento
    setTimeout(() => {
      navigate('/financeiro/parcelas')
    }, 1000)
  }

  const handleCancel = () => {
    navigate('/financeiro/parcelas')
  }

  const calculateInstallmentValue = () => {
    if (selectedContract && formData.totalInstallments) {
      const totalValue = selectedContract.totalValue
      const totalInstallments = parseInt(formData.totalInstallments)
      const installmentValue = totalValue / totalInstallments
      setFormData(prev => ({ ...prev, amount: installmentValue.toFixed(2) }))
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center space-x-4'>
        <Button variant='ghost' size='sm' onClick={handleCancel}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Voltar
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {isEditing ? 'Editar Parcela' : 'Nova Parcela'}
          </h1>
          <p className='text-muted-foreground'>
            {isEditing 
              ? 'Atualize as informações da parcela' 
              : 'Cadastre uma nova parcela de entrada'
            }
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Seleção do Contrato */}
          <div className='space-y-2'>
            <Label htmlFor='contractId'>Contrato *</Label>
            <select
              id='contractId'
              value={formData.contractId}
              onChange={(e) => handleInputChange('contractId', e.target.value)}
              className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.contractId ? 'border-red-500' : ''
              }`}
            >
              <option value=''>Selecione um contrato</option>
              {mockContracts.map(contract => (
                <option key={contract.id} value={contract.id}>
                  {contract.id} - {contract.eventName} ({contract.clientName})
                </option>
              ))}
            </select>
            {errors.contractId && (
              <p className='text-sm text-red-500'>{errors.contractId}</p>
            )}
          </div>

          {/* Cliente (preenchido automaticamente) */}
          <div className='space-y-2'>
            <Label htmlFor='clientName'>Cliente</Label>
            <div className='flex items-center space-x-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <Input
                id='clientName'
                value={formData.clientName}
                readOnly
                className='bg-gray-50'
              />
            </div>
          </div>

          {/* Evento (preenchido automaticamente) */}
          <div className='space-y-2'>
            <Label htmlFor='eventName'>Evento</Label>
            <div className='flex items-center space-x-2'>
              <FileText className='h-4 w-4 text-muted-foreground' />
              <Input
                id='eventName'
                value={formData.eventName}
                readOnly
                className='bg-gray-50'
              />
            </div>
          </div>

          {/* Data do Evento (preenchida automaticamente) */}
          <div className='space-y-2'>
            <Label htmlFor='eventDate'>Data do Evento</Label>
            <div className='flex items-center space-x-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <Input
                id='eventDate'
                type='date'
                value={formData.eventDate}
                readOnly
                className='bg-gray-50'
              />
            </div>
          </div>

          {/* Número da Parcela */}
          <div className='space-y-2'>
            <Label htmlFor='installmentNumber'>Número da Parcela *</Label>
            <Input
              id='installmentNumber'
              type='number'
              min='1'
              max={formData.totalInstallments || undefined}
              value={formData.installmentNumber}
              onChange={(e) => handleInputChange('installmentNumber', e.target.value)}
              placeholder='Ex: 1'
              className={errors.installmentNumber ? 'border-red-500' : ''}
            />
            {errors.installmentNumber && (
              <p className='text-sm text-red-500'>{errors.installmentNumber}</p>
            )}
          </div>

          {/* Total de Parcelas (preenchido automaticamente) */}
          <div className='space-y-2'>
            <Label htmlFor='totalInstallments'>Total de Parcelas</Label>
            <Input
              id='totalInstallments'
              value={formData.totalInstallments}
              readOnly
              className='bg-gray-50'
            />
          </div>

          {/* Valor da Parcela */}
          <div className='space-y-2'>
            <Label htmlFor='amount'>Valor da Parcela *</Label>
            <div className='flex items-center space-x-2'>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
              <Input
                id='amount'
                type='number'
                step='0.01'
                min='0'
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder='0,00'
                className={errors.amount ? 'border-red-500' : ''}
              />
            </div>
            {selectedContract && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={calculateInstallmentValue}
                className='mt-2'
              >
                Calcular Valor Automático
              </Button>
            )}
            {errors.amount && (
              <p className='text-sm text-red-500'>{errors.amount}</p>
            )}
          </div>

          {/* Data de Vencimento */}
          <div className='space-y-2'>
            <Label htmlFor='dueDate'>Data de Vencimento *</Label>
            <div className='flex items-center space-x-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <Input
                id='dueDate'
                type='date'
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
            </div>
            {errors.dueDate && (
              <p className='text-sm text-red-500'>{errors.dueDate}</p>
            )}
          </div>

          {/* Status */}
          <div className='space-y-2'>
            <Label htmlFor='status'>Status</Label>
            <select
              id='status'
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='pending'>Pendente</option>
              <option value='paid'>Pago</option>
              <option value='overdue'>Vencido</option>
            </select>
          </div>

          {/* Data de Pagamento (condicional) */}
          {formData.status === 'paid' && (
            <div className='space-y-2'>
              <Label htmlFor='paymentDate'>Data de Pagamento *</Label>
              <div className='flex items-center space-x-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <Input
                  id='paymentDate'
                  type='date'
                  value={formData.paymentDate || ''}
                  onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                  className={errors.paymentDate ? 'border-red-500' : ''}
                />
              </div>
              {errors.paymentDate && (
                <p className='text-sm text-red-500'>{errors.paymentDate}</p>
              )}
            </div>
          )}
        </div>

        {/* Observações */}
        <div className='space-y-2'>
          <Label htmlFor='observations'>Observações</Label>
          <textarea
            id='observations'
            value={formData.observations}
            onChange={(e) => handleInputChange('observations', e.target.value)}
            placeholder='Informações adicionais sobre a parcela'
            className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            rows={3}
          />
        </div>

        {/* Botões */}
        <div className='flex items-center justify-end space-x-2 pt-6 border-t'>
          <Button type='button' variant='outline' onClick={handleCancel}>
            <X className='h-4 w-4 mr-2' />
            Cancelar
          </Button>
          <Button variant='outline' type='submit'>
            <Save className='h-4 w-4 mr-2' />
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  )
}
