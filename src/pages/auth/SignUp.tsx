import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input/input'
import { Label } from '@/components/ui/label/label'
import { useAuth } from '@/context/AuthContext'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await signup(name, email, password, confirmPassword)
      if (success) {
        navigate('/signin')
      } else {
        setError('Erro ao criar conta. Verifique os dados e tente novamente.')
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-start justify-center gap-2 w-[80%] max-w-[420px]'>
      <div className='flex flex-col items-start justify-center mb-4'>
        <h2 className='m-0 text-[2rem] leading-none font-bold max-[950px]:text-primary-50'>Criar Conta</h2>
        <p className='m-0 text-black max-[950px]:text-primary-50'>Cadastre-se para começar</p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col items-start justify-center gap-4 w-full'>
        {error && (
          <div className='w-full p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
            {error}
          </div>
        )}

        <div className='grid w-full items-center gap-3'>
          <Label htmlFor='name'>Nome</Label>
          <Input 
            type='text' 
            id='name' 
            placeholder='Seu nome completo'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className='grid w-full items-center gap-3'>
          <Label htmlFor='email'>Email</Label>
          <Input 
            type='email' 
            id='email' 
            placeholder='voce@gmail.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className='grid w-full items-center gap-3'>
          <Label htmlFor='password'>Senha</Label>
          <Input 
            type='password' 
            id='password' 
            placeholder='•••••••'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className='grid w-full items-center gap-3'>
          <Label htmlFor='confirmPassword'>Confirmar Senha</Label>
          <Input 
            type='password' 
            id='confirmPassword' 
            placeholder='•••••••'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <Button
          type='submit'
          disabled={isLoading}
          className='
            w-full items-center gap-2 rounded-md bg-primary-700 px-3 py-1.5 text-sm/6 font-semibold text-primary-50 
            shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-primary-50 
            data-hover:bg-primary-600 data-open:bg-primary-700 cursor-pointer transition-colors hover:bg-primary-500
            disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? 'Criando conta...' : 'Criar Conta'}
        </Button>

        <div className='w-full flex justify-center'>
          <a
            href='/signin'
            className='mt-4 text-sm text-primary-600 underline font-bold max-[950px]:text-primary-50 hover:text-primary-700'
          >
            Já tem uma conta? Faça login
          </a>
        </div>
      </form>
    </div>
  )
}