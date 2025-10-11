import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input/input'
import { Label } from '@/components/ui/label/label'

interface UserFormData {
  nome: string
  email: string
  senha: string
  confirmarSenha: string
  perfil: 'Administrador' | 'Atendimento' | 'Vendedor'
  status: 'Ativo' | 'Inativo'
  observacoes: string
}

export default function UserForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState<UserFormData>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    perfil: 'Atendimento',
    status: 'Ativo',
    observacoes: ''
  })

  const [errors, setErrors] = useState<Partial<UserFormData>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!isEditing && !formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!isEditing && formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem'
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
    console.log('Salvando usuário:', formData)
    
    // Simular salvamento
    setTimeout(() => {
      navigate('/cadastros/usuarios')
    }, 1000)
  }

  const handleCancel = () => {
    navigate('/cadastros/usuarios')
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
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
          <p className='text-muted-foreground'>
            {isEditing 
              ? 'Atualize as informações do usuário' 
              : 'Preencha os dados do novo usuário'
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
              placeholder='Nome completo do usuário'
              className={errors.nome ? 'border-red-500' : ''}
            />
            {errors.nome && (
              <p className='text-sm text-red-500'>{errors.nome}</p>
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

          {/* Perfil */}
          <div className='space-y-2'>
            <Label htmlFor='perfil'>Perfil *</Label>
            <select
              id='perfil'
              value={formData.perfil}
              onChange={(e) => handleInputChange('perfil', e.target.value as 'Administrador' | 'Atendimento' | 'Vendedor')}
              className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='Atendimento'>Atendimento</option>
              <option value='Vendedor'>Vendedor</option>
              <option value='Administrador'>Administrador</option>
            </select>
          </div>

          {/* Status */}
          <div className='space-y-2'>
            <Label htmlFor='status'>Status</Label>
            <select
              id='status'
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'Ativo' | 'Inativo')}
              className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='Ativo'>Ativo</option>
              <option value='Inativo'>Inativo</option>
            </select>
          </div>

          {/* Senha */}
          <div className='space-y-2'>
            <Label htmlFor='senha'>
              Senha {!isEditing && '*'}
            </Label>
            <div className='relative'>
              <Input
                id='senha'
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                placeholder={isEditing ? 'Deixe em branco para manter a senha atual' : 'Digite a senha'}
                className={errors.senha ? 'border-red-500' : ''}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
            {errors.senha && (
              <p className='text-sm text-red-500'>{errors.senha}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          {!isEditing && (
            <div className='space-y-2'>
              <Label htmlFor='confirmarSenha'>Confirmar Senha *</Label>
              <div className='relative'>
                <Input
                  id='confirmarSenha'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmarSenha}
                  onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                  placeholder='Confirme a senha'
                  className={errors.confirmarSenha ? 'border-red-500' : ''}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </Button>
              </div>
              {errors.confirmarSenha && (
                <p className='text-sm text-red-500'>{errors.confirmarSenha}</p>
              )}
            </div>
          )}
        </div>

        {/* Observações */}
        <div className='space-y-2'>
          <Label htmlFor='observacoes'>Observações</Label>
          <textarea
            id='observacoes'
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            placeholder='Informações adicionais sobre o usuário'
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
