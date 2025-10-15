import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X, DollarSign, Calendar, FileText, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input/input'
import { Label } from '@/components/ui/label/label'

interface CostFormData {
  eventId: string
  eventName: string
  eventDate: string
  description: string
  amount: string
  category: 'food' | 'staff' | 'equipment' | 'transport' | 'other'
  observations: string
}

// Mock data para eventos - substituir por dados reais da API
const mockEvents = [
  {
    id: 'EV001',
    name: 'Casamento João & Maria',
    date: '2024-01-15',
    client: 'João Silva',
    status: 'Confirmado'
  },
  {
    id: 'EV002',
    name: 'Aniversário 50 anos',
    date: '2024-01-25',
    client: 'Ana Costa',
    status: 'Confirmado'
  },
  {
    id: 'EV003',
    name: 'Formatura Medicina',
    date: '2024-02-10',
    client: 'Pedro Santos',
    status: 'Confirmado'
  },
  {
    id: 'EV004',
    name: 'Batizado do Lucas',
    date: '2024-02-20',
    client: 'Maria Oliveira',
    status: 'Confirmado'
  },
  {
    id: 'EV005',
    name: 'Festa de 15 anos da Sofia',
    date: '2024-03-05',
    client: 'Carlos Mendes',
    status: 'Confirmado'
  },
  {
    id: 'EV006',
    name: 'Chá de Bebê',
    date: '2024-03-20',
    client: 'Fernanda Lima',
    status: 'Confirmado'
  },
  {
    id: 'EV007',
    name: 'Aniversário de 60 anos',
    date: '2024-04-10',
    client: 'Roberto Alves',
    status: 'Confirmado'
  },
  {
    id: 'EV008',
    name: 'Formatura de Direito',
    date: '2024-05-15',
    client: 'Patricia Costa',
    status: 'Confirmado'
  },
  {
    id: 'EV009',
    name: 'Casamento de Prata',
    date: '2024-06-30',
    client: 'Marcos Silva',
    status: 'Confirmado'
  },
  {
    id: 'EV010',
    name: 'Festa Junina',
    date: '2024-06-24',
    client: 'Lucia Ferreira',
    status: 'Confirmado'
  }
]

export default function CostForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState<CostFormData>({
    eventId: '',
    eventName: '',
    eventDate: '',
    description: '',
    amount: '',
    category: 'food',
    observations: ''
  })

  const [errors, setErrors] = useState<Partial<CostFormData>>({})
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  // Carregar dados do evento quando selecionado
  useEffect(() => {
    if (formData.eventId) {
      const event = mockEvents.find(e => e.id === formData.eventId)
      if (event) {
        setSelectedEvent(event)
        setFormData(prev => ({
          ...prev,
          eventName: event.name,
          eventDate: event.date
        }))
      }
    }
  }, [formData.eventId])

  const handleInputChange = (field: keyof CostFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CostFormData> = {}

    if (!formData.eventId.trim()) {
      newErrors.eventId = 'Evento é obrigatório'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Valor é obrigatório'
    } else {
      const amount = parseFloat(formData.amount)
      if (amount <= 0) {
        newErrors.amount = 'Valor deve ser maior que zero'
      }
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
    console.log('Salvando custo:', formData)
    
    // Simular salvamento
    setTimeout(() => {
      navigate('/financeiro/custos')
    }, 1000)
  }

  const handleCancel = () => {
    navigate('/financeiro/custos')
  }

  const categories = [
    { value: 'food', label: 'Alimentação', icon: '🍔' },
    { value: 'staff', label: 'Equipe', icon: '👥' },
    { value: 'equipment', label: 'Equipamentos', icon: '🔧' },
    { value: 'transport', label: 'Transporte', icon: '🚚' },
    { value: 'other', label: 'Outros', icon: '📦' }
  ]

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
            {isEditing ? 'Editar Custo' : 'Novo Custo'}
          </h1>
          <p className='text-muted-foreground'>
            {isEditing 
              ? 'Atualize as informações do custo' 
              : 'Cadastre um novo custo ou despesa operacional'
            }
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Seleção do Evento */}
          <div className='space-y-2'>
            <Label htmlFor='eventId'>Evento *</Label>
            <select
              id='eventId'
              value={formData.eventId}
              onChange={(e) => handleInputChange('eventId', e.target.value)}
              className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.eventId ? 'border-red-500' : ''
              }`}
            >
              <option value=''>Selecione um evento</option>
              {mockEvents.map(event => (
                <option key={event.id} value={event.id}>
                  {event.id} - {event.name} ({event.client})
                </option>
              ))}
            </select>
            {errors.eventId && (
              <p className='text-sm text-red-500'>{errors.eventId}</p>
            )}
          </div>

          {/* Nome do Evento (preenchido automaticamente) */}
          <div className='space-y-2'>
            <Label htmlFor='eventName'>Nome do Evento</Label>
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

          {/* Categoria */}
          <div className='space-y-2'>
            <Label htmlFor='category'>Categoria *</Label>
            <select
              id='category'
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div className='space-y-2 md:col-span-2'>
            <Label htmlFor='description'>Descrição *</Label>
            <Input
              id='description'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder='Ex: Ingredientes para buffet, Aluguel de equipamentos, etc.'
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className='text-sm text-red-500'>{errors.description}</p>
            )}
          </div>

          {/* Valor */}
          <div className='space-y-2'>
            <Label htmlFor='amount'>Valor *</Label>
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
            {errors.amount && (
              <p className='text-sm text-red-500'>{errors.amount}</p>
            )}
          </div>

          {/* Preview da Categoria */}
          {formData.category && (
            <div className='space-y-2'>
              <Label>Preview da Categoria</Label>
              <div className='flex items-center space-x-2 p-3 rounded-lg border bg-gray-50'>
                <Tag className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>
                  {categories.find(c => c.value === formData.category)?.icon}{' '}
                  {categories.find(c => c.value === formData.category)?.label}
                </span>
              </div>
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
            placeholder='Informações adicionais sobre este custo'
            className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            rows={3}
          />
        </div>

        {/* Preview do Evento Selecionado */}
        {selectedEvent && (
          <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
            <h3 className='font-semibold text-blue-800 mb-2'>Evento Selecionado</h3>
            <div className='grid grid-cols-2 gap-2 text-sm text-blue-700'>
              <div>
                <span className='font-medium'>ID:</span> {selectedEvent.id}
              </div>
              <div>
                <span className='font-medium'>Cliente:</span> {selectedEvent.client}
              </div>
              <div>
                <span className='font-medium'>Data:</span> {new Date(selectedEvent.date).toLocaleDateString('pt-BR')}
              </div>
              <div>
                <span className='font-medium'>Status:</span> {selectedEvent.status}
              </div>
            </div>
          </div>
        )}

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
