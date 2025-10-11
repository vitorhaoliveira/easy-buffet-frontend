import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input/input'
import { Label } from '@/components/ui/label/label'

interface PacoteFormData {
  nome: string
  tipo: 'Pacote' | 'Serviço'
  descricao: string
  preco: string
  duracao: string
  observacoes: string
}

export default function PacoteForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState<PacoteFormData>({
    nome: '',
    tipo: 'Pacote',
    descricao: '',
    preco: '',
    duracao: '',
    observacoes: ''
  })

  const [errors, setErrors] = useState<Partial<PacoteFormData>>({})

  const handleInputChange = (field: keyof PacoteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<PacoteFormData> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória'
    }

    if (!formData.preco.trim()) {
      newErrors.preco = 'Preço é obrigatório'
    } else if (isNaN(Number(formData.preco.replace(',', '.')))) {
      newErrors.preco = 'Preço deve ser um número válido'
    }

    if (!formData.duracao.trim()) {
      newErrors.duracao = 'Duração é obrigatória'
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
    console.log('Salvando pacote/serviço:', formData)
    
    // Simular salvamento
    setTimeout(() => {
      navigate('/cadastros/pacotes')
    }, 1000)
  }

  const handleCancel = () => {
    navigate('/cadastros/pacotes')
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
            {isEditing ? 'Editar Pacote/Serviço' : 'Novo Pacote/Serviço'}
          </h1>
          <p className='text-muted-foreground'>
            {isEditing 
              ? 'Atualize as informações do pacote/serviço' 
              : 'Preencha os dados do novo pacote/serviço'
            }
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Nome */}
          <div className='space-y-2'>
            <Label htmlFor='nome'>Nome *</Label>
            <Input
              id='nome'
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder='Nome do pacote ou serviço'
              className={errors.nome ? 'border-red-500' : ''}
            />
            {errors.nome && (
              <p className='text-sm text-red-500'>{errors.nome}</p>
            )}
          </div>

          {/* Tipo */}
          <div className='space-y-2'>
            <Label htmlFor='tipo'>Tipo *</Label>
            <select
              id='tipo'
              value={formData.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value as 'Pacote' | 'Serviço')}
              className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='Pacote'>Pacote</option>
              <option value='Serviço'>Serviço</option>
            </select>
          </div>

          {/* Preço */}
          <div className='space-y-2'>
            <Label htmlFor='preco'>Preço *</Label>
            <Input
              id='preco'
              value={formData.preco}
              onChange={(e) => handleInputChange('preco', e.target.value)}
              placeholder='0,00'
              className={errors.preco ? 'border-red-500' : ''}
            />
            {errors.preco && (
              <p className='text-sm text-red-500'>{errors.preco}</p>
            )}
          </div>

          {/* Duração */}
          <div className='space-y-2'>
            <Label htmlFor='duracao'>Duração *</Label>
            <Input
              id='duracao'
              value={formData.duracao}
              onChange={(e) => handleInputChange('duracao', e.target.value)}
              placeholder='Ex: 4 horas, 1 dia'
              className={errors.duracao ? 'border-red-500' : ''}
            />
            {errors.duracao && (
              <p className='text-sm text-red-500'>{errors.duracao}</p>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div className='space-y-2'>
          <Label htmlFor='descricao'>Descrição *</Label>
          <textarea
            id='descricao'
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            placeholder='Descreva o pacote ou serviço oferecido'
            className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            rows={3}
          />
          {errors.descricao && (
            <p className='text-sm text-red-500'>{errors.descricao}</p>
          )}
        </div>

        {/* Observações */}
        <div className='space-y-2'>
          <Label htmlFor='observacoes'>Observações</Label>
          <textarea
            id='observacoes'
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            placeholder='Informações adicionais sobre o pacote/serviço'
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
