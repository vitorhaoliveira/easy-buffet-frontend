import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input/input'
import { Label } from '@/components/ui/label/label'

interface EventFormData {
  cliente: string
  pacote: string
  data: string
  horario: string
  local: string
  convidados: string
  observacoes: string
  status: 'Confirmado' | 'Pendente' | 'Cancelado'
}

export default function EventForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState<EventFormData>({
    cliente: '',
    pacote: '',
    data: '',
    horario: '',
    local: '',
    convidados: '',
    observacoes: '',
    status: 'Pendente'
  })

  const [errors, setErrors] = useState<Partial<EventFormData>>({})

  // Mock data para selects - substituir por dados reais da API
  const mockClients = ['João Silva', 'Maria Santos', 'Pedro Oliveira']
  const mockPacotes = ['Pacote Básico', 'Pacote Premium', 'Serviço de DJ', 'Decoração Premium']

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {}

    if (!formData.cliente.trim()) {
      newErrors.cliente = 'Cliente é obrigatório'
    }

    if (!formData.pacote.trim()) {
      newErrors.pacote = 'Pacote é obrigatório'
    }

    if (!formData.data.trim()) {
      newErrors.data = 'Data é obrigatória'
    }

    if (!formData.horario.trim()) {
      newErrors.horario = 'Horário é obrigatório'
    }

    if (!formData.local.trim()) {
      newErrors.local = 'Local é obrigatório'
    }

    if (!formData.convidados.trim()) {
      newErrors.convidados = 'Número de convidados é obrigatório'
    } else if (isNaN(Number(formData.convidados)) || Number(formData.convidados) <= 0) {
      newErrors.convidados = 'Número de convidados deve ser um número válido'
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
    console.log('Salvando evento:', formData)
    
    // Simular salvamento
    setTimeout(() => {
      navigate('/cadastros/eventos')
    }, 1000)
  }

  const handleCancel = () => {
    navigate('/cadastros/eventos')
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
            {isEditing ? 'Editar Evento' : 'Nova Reserva'}
          </h1>
          <p className='text-muted-foreground'>
            {isEditing 
              ? 'Atualize as informações do evento' 
              : 'Preencha os dados da nova reserva'
            }
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Cliente */}
          <div className='space-y-2'>
            <Label htmlFor='cliente'>Cliente *</Label>
            <select
              id='cliente'
              value={formData.cliente}
              onChange={(e) => handleInputChange('cliente', e.target.value)}
              className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.cliente ? 'border-red-500' : ''}`}
            >
              <option value=''>Selecione um cliente</option>
              {mockClients.map((cliente) => (
                <option key={cliente} value={cliente}>
                  {cliente}
                </option>
              ))}
            </select>
            {errors.cliente && (
              <p className='text-sm text-red-500'>{errors.cliente}</p>
            )}
          </div>

          {/* Pacote */}
          <div className='space-y-2'>
            <Label htmlFor='pacote'>Pacote/Serviço *</Label>
            <select
              id='pacote'
              value={formData.pacote}
              onChange={(e) => handleInputChange('pacote', e.target.value)}
              className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.pacote ? 'border-red-500' : ''}`}
            >
              <option value=''>Selecione um pacote</option>
              {mockPacotes.map((pacote) => (
                <option key={pacote} value={pacote}>
                  {pacote}
                </option>
              ))}
            </select>
            {errors.pacote && (
              <p className='text-sm text-red-500'>{errors.pacote}</p>
            )}
          </div>

          {/* Data */}
          <div className='space-y-2'>
            <Label htmlFor='data'>Data *</Label>
            <Input
              id='data'
              type='date'
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              className={errors.data ? 'border-red-500' : ''}
            />
            {errors.data && (
              <p className='text-sm text-red-500'>{errors.data}</p>
            )}
          </div>

          {/* Horário */}
          <div className='space-y-2'>
            <Label htmlFor='horario'>Horário *</Label>
            <Input
              id='horario'
              type='time'
              value={formData.horario}
              onChange={(e) => handleInputChange('horario', e.target.value)}
              className={errors.horario ? 'border-red-500' : ''}
            />
            {errors.horario && (
              <p className='text-sm text-red-500'>{errors.horario}</p>
            )}
          </div>

          {/* Local */}
          <div className='space-y-2'>
            <Label htmlFor='local'>Local *</Label>
            <Input
              id='local'
              value={formData.local}
              onChange={(e) => handleInputChange('local', e.target.value)}
              placeholder='Local do evento'
              className={errors.local ? 'border-red-500' : ''}
            />
            {errors.local && (
              <p className='text-sm text-red-500'>{errors.local}</p>
            )}
          </div>

          {/* Convidados */}
          <div className='space-y-2'>
            <Label htmlFor='convidados'>Número de Convidados *</Label>
            <Input
              id='convidados'
              type='number'
              value={formData.convidados}
              onChange={(e) => handleInputChange('convidados', e.target.value)}
              placeholder='Ex: 50'
              min='1'
              className={errors.convidados ? 'border-red-500' : ''}
            />
            {errors.convidados && (
              <p className='text-sm text-red-500'>{errors.convidados}</p>
            )}
          </div>

          {/* Status */}
          <div className='space-y-2'>
            <Label htmlFor='status'>Status</Label>
            <select
              id='status'
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'Confirmado' | 'Pendente' | 'Cancelado')}
              className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='Pendente'>Pendente</option>
              <option value='Confirmado'>Confirmado</option>
              <option value='Cancelado'>Cancelado</option>
            </select>
          </div>
        </div>

        {/* Observações */}
        <div className='space-y-2'>
          <Label htmlFor='observacoes'>Observações</Label>
          <textarea
            id='observacoes'
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            placeholder='Informações adicionais sobre o evento'
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
          <Button type='submit' variant='outline'>
            <Save className='h-4 w-4 mr-2' />
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  )
}
