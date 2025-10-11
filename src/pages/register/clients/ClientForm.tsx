import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input/input'
import { Label } from '@/components/ui/label/label'

interface ClientFormData {
  name: string
  email: string
  telefone: string
  endereco: string
  observacoes: string
}

export default function ClientForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    telefone: '',
    endereco: '',
    observacoes: ''
  })

  const [errors, setErrors] = useState<Partial<ClientFormData>>({})

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório'
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
    console.log('Salvando cliente:', formData)
    
    // Simular salvamento
    setTimeout(() => {
      navigate('/cadastros/clientes')
    }, 1000)
  }

  const handleCancel = () => {
    navigate('/cadastros/clientes')
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
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className='text-muted-foreground'>
            {isEditing 
              ? 'Atualize as informações do cliente' 
              : 'Preencha os dados do novo cliente'
            }
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Nome */}
          <div className='space-y-2'>
            <Label htmlFor='name'>Nome *</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder='Nome completo do cliente'
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className='text-sm text-red-500'>{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className='space-y-2'>
            <Label htmlFor='email'>Email *</Label>
            <Input
              id='email'
              type='email'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder='email@exemplo.com'
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className='text-sm text-red-500'>{errors.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div className='space-y-2'>
            <Label htmlFor='telefone'>Telefone *</Label>
            <Input
              id='telefone'
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder='(11) 99999-9999'
              className={errors.telefone ? 'border-red-500' : ''}
            />
            {errors.telefone && (
              <p className='text-sm text-red-500'>{errors.telefone}</p>
            )}
          </div>

          {/* Endereço */}
          <div className='space-y-2'>
            <Label htmlFor='endereco'>Endereço</Label>
            <Input
              id='endereco'
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              placeholder='Endereço completo'
            />
          </div>
        </div>

        {/* Observações */}
        <div className='space-y-2'>
          <Label htmlFor='observacoes'>Observações</Label>
          <textarea
            id='observacoes'
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            placeholder='Informações adicionais sobre o cliente'
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
