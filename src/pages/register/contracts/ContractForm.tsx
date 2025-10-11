import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X, FileText, Calendar, DollarSign, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input/input'
import { Label } from '@/components/ui/label/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table/table'

interface ContratoFormData {
  evento: string
  cliente: string
  valorTotal: string
  parcelas: string
  primeiroVencimento: string
  periodicidade: 'Mensal' | 'Bimestral' | 'Trimestral'
  comissaoPercentual: string
  observacoes: string
}

interface Parcela {
  numero: number
  dataVencimento: string
  valor: number
  status: 'A vencer' | 'Pago' | 'Atrasado'
}

export default function ContractForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState<ContratoFormData>({
    evento: '',
    cliente: '',
    valorTotal: '',
    parcelas: '',
    primeiroVencimento: '',
    periodicidade: 'Mensal',
    comissaoPercentual: '',
    observacoes: ''
  })

  const [errors, setErrors] = useState<Partial<ContratoFormData>>({})
  const [parcelasPreview, setParcelasPreview] = useState<Parcela[]>([])

  // Mock data para selects - substituir por dados reais da API
  const mockEventos = [
    { id: 1, nome: 'Casamento João & Maria', cliente: 'João Silva' },
    { id: 2, nome: 'Aniversário Pedro', cliente: 'Pedro Oliveira' },
    { id: 3, nome: 'Formatura Ana', cliente: 'Ana Santos' }
  ]

  const handleInputChange = (field: keyof ContratoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const calculateParcelas = () => {
    if (!formData.valorTotal || !formData.parcelas || !formData.primeiroVencimento) {
      setParcelasPreview([])
      return
    }

    const valorTotal = parseFloat(formData.valorTotal.replace(',', '.'))
    const numeroParcelas = parseInt(formData.parcelas)
    const primeiroVencimento = new Date(formData.primeiroVencimento)

    if (isNaN(valorTotal) || isNaN(numeroParcelas) || valorTotal <= 0 || numeroParcelas <= 0) {
      setParcelasPreview([])
      return
    }

    const valorParcela = valorTotal / numeroParcelas
    const parcelas: Parcela[] = []

    for (let i = 0; i < numeroParcelas; i++) {
      const dataVencimento = new Date(primeiroVencimento)
      
      // Calcular data baseada na periodicidade
      switch (formData.periodicidade) {
        case 'Mensal':
          dataVencimento.setMonth(dataVencimento.getMonth() + i)
          break
        case 'Bimestral':
          dataVencimento.setMonth(dataVencimento.getMonth() + (i * 2))
          break
        case 'Trimestral':
          dataVencimento.setMonth(dataVencimento.getMonth() + (i * 3))
          break
      }

      parcelas.push({
        numero: i + 1,
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        valor: valorParcela,
        status: 'A vencer'
      })
    }

    setParcelasPreview(parcelas)
  }

  const calculateComissao = () => {
    if (!formData.valorTotal || !formData.comissaoPercentual) {
      return 0
    }

    const valorTotal = parseFloat(formData.valorTotal.replace(',', '.'))
    const percentualComissao = parseFloat(formData.comissaoPercentual.replace(',', '.'))

    if (isNaN(valorTotal) || isNaN(percentualComissao)) {
      return 0
    }

    return (valorTotal * percentualComissao) / 100
  }

  useEffect(() => {
    calculateParcelas()
  }, [formData.valorTotal, formData.parcelas, formData.primeiroVencimento, formData.periodicidade])

  const validateForm = (): boolean => {
    const newErrors: Partial<ContratoFormData> = {}

    if (!formData.evento.trim()) {
      newErrors.evento = 'Evento é obrigatório'
    }

    if (!formData.cliente.trim()) {
      newErrors.cliente = 'Cliente é obrigatório'
    }

    if (!formData.valorTotal.trim()) {
      newErrors.valorTotal = 'Valor total é obrigatório'
    } else if (isNaN(parseFloat(formData.valorTotal.replace(',', '.'))) || parseFloat(formData.valorTotal.replace(',', '.')) <= 0) {
      newErrors.valorTotal = 'Valor total deve ser um número válido maior que zero'
    }

    if (!formData.parcelas.trim()) {
      newErrors.parcelas = 'Número de parcelas é obrigatório'
    } else if (isNaN(parseInt(formData.parcelas)) || parseInt(formData.parcelas) <= 0) {
      newErrors.parcelas = 'Número de parcelas deve ser um número válido maior que zero'
    }

    if (!formData.primeiroVencimento.trim()) {
      newErrors.primeiroVencimento = 'Primeiro vencimento é obrigatório'
    }

    if (!formData.comissaoPercentual.trim()) {
      newErrors.comissaoPercentual = 'Percentual de comissão é obrigatório'
    } else if (isNaN(parseFloat(formData.comissaoPercentual.replace(',', '.'))) || parseFloat(formData.comissaoPercentual.replace(',', '.')) < 0) {
      newErrors.comissaoPercentual = 'Percentual de comissão deve ser um número válido'
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
    console.log('Salvando contrato:', formData)
    console.log('Parcelas:', parcelasPreview)
    console.log('Comissão total:', calculateComissao())
    
    // Simular salvamento
    setTimeout(() => {
      navigate('/cadastros/contratos')
    }, 1000)
  }

  const handleCancel = () => {
    navigate('/cadastros/contratos')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center space-x-4'>
        <Button variant='outline' size='sm' onClick={handleCancel}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Voltar
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
          </h1>
          <p className='text-muted-foreground'>
            {isEditing 
              ? 'Atualize as informações do contrato' 
              : 'Preencha os dados do novo contrato'
            }
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Formulário */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center space-x-2'>
              <FileText className='h-5 w-5' />
              <span>Dados do Contrato</span>
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Evento */}
              <div className='space-y-2'>
                <Label htmlFor='evento'>Evento *</Label>
                <select
                  id='evento'
                  value={formData.evento}
                  onChange={(e) => {
                    const eventoSelecionado = mockEventos.find(evento => evento.nome === e.target.value)
                    handleInputChange('evento', e.target.value)
                    if (eventoSelecionado) {
                      handleInputChange('cliente', eventoSelecionado.cliente)
                    }
                  }}
                  className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.evento ? 'border-red-500' : ''}`}
                >
                  <option value=''>Selecione um evento</option>
                  {mockEventos.map((evento) => (
                    <option key={evento.id} value={evento.nome}>
                      {evento.nome}
                    </option>
                  ))}
                </select>
                {errors.evento && (
                  <p className='text-sm text-red-500'>{errors.evento}</p>
                )}
              </div>

              {/* Cliente */}
              <div className='space-y-2'>
                <Label htmlFor='cliente'>Cliente *</Label>
                <Input
                  id='cliente'
                  value={formData.cliente}
                  onChange={(e) => handleInputChange('cliente', e.target.value)}
                  placeholder='Nome do cliente'
                  className={errors.cliente ? 'border-red-500' : ''}
                />
                {errors.cliente && (
                  <p className='text-sm text-red-500'>{errors.cliente}</p>
                )}
              </div>

              {/* Valor Total */}
              <div className='space-y-2'>
                <Label htmlFor='valorTotal'>Valor Total *</Label>
                <Input
                  id='valorTotal'
                  value={formData.valorTotal}
                  onChange={(e) => handleInputChange('valorTotal', e.target.value)}
                  placeholder='0,00'
                  className={errors.valorTotal ? 'border-red-500' : ''}
                />
                {errors.valorTotal && (
                  <p className='text-sm text-red-500'>{errors.valorTotal}</p>
                )}
              </div>

              {/* Parcelas */}
              <div className='space-y-2'>
                <Label htmlFor='parcelas'>Número de Parcelas *</Label>
                <Input
                  id='parcelas'
                  type='number'
                  value={formData.parcelas}
                  onChange={(e) => handleInputChange('parcelas', e.target.value)}
                  placeholder='Ex: 5'
                  min='1'
                  className={errors.parcelas ? 'border-red-500' : ''}
                />
                {errors.parcelas && (
                  <p className='text-sm text-red-500'>{errors.parcelas}</p>
                )}
              </div>

              {/* Primeiro Vencimento */}
              <div className='space-y-2'>
                <Label htmlFor='primeiroVencimento'>Primeiro Vencimento *</Label>
                <Input
                  id='primeiroVencimento'
                  type='date'
                  value={formData.primeiroVencimento}
                  onChange={(e) => handleInputChange('primeiroVencimento', e.target.value)}
                  className={errors.primeiroVencimento ? 'border-red-500' : ''}
                />
                {errors.primeiroVencimento && (
                  <p className='text-sm text-red-500'>{errors.primeiroVencimento}</p>
                )}
              </div>

              {/* Periodicidade */}
              <div className='space-y-2'>
                <Label htmlFor='periodicidade'>Periodicidade *</Label>
                <select
                  id='periodicidade'
                  value={formData.periodicidade}
                  onChange={(e) => handleInputChange('periodicidade', e.target.value as 'Mensal' | 'Bimestral' | 'Trimestral')}
                  className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <option value='Mensal'>Mensal</option>
                  <option value='Bimestral'>Bimestral</option>
                  <option value='Trimestral'>Trimestral</option>
                </select>
              </div>

              {/* Comissão */}
              <div className='space-y-2'>
                <Label htmlFor='comissaoPercentual'>Comissão (%) *</Label>
                <Input
                  id='comissaoPercentual'
                  value={formData.comissaoPercentual}
                  onChange={(e) => handleInputChange('comissaoPercentual', e.target.value)}
                  placeholder='Ex: 10'
                  className={errors.comissaoPercentual ? 'border-red-500' : ''}
                />
                {errors.comissaoPercentual && (
                  <p className='text-sm text-red-500'>{errors.comissaoPercentual}</p>
                )}
                {formData.comissaoPercentual && !errors.comissaoPercentual && (
                  <p className='text-sm text-green-600 font-medium'>
                    Total da comissão: {formatCurrency(calculateComissao())}
                  </p>
                )}
              </div>
            </div>

            {/* Observações */}
            <div className='space-y-2'>
              <Label htmlFor='observacoes'>Observações</Label>
              <textarea
                id='observacoes'
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder='Informações adicionais sobre o contrato'
                className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                rows={3}
              />
            </div>
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

        {/* Preview das Parcelas */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold flex items-center space-x-2'>
            <Calculator className='h-5 w-5' />
            <span>Preview das Parcelas</span>
          </h3>

          {parcelasPreview.length > 0 ? (
            <div className='space-y-4'>
              <div className='bg-blue-50 p-4 rounded-lg'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>Valor por parcela:</span>
                  <span className='font-bold text-blue-600'>
                    {formatCurrency(parcelasPreview[0]?.valor || 0)}
                  </span>
                </div>
                <div className='flex items-center justify-between mt-2'>
                  <span className='font-medium'>Total de parcelas:</span>
                  <span className='font-bold'>{parcelasPreview.length}</span>
                </div>
              </div>

              <div className='max-h-96 overflow-y-auto border rounded-lg'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parcelasPreview.map((parcela) => (
                      <TableRow key={parcela.numero}>
                        <TableCell className='font-medium'>{parcela.numero}</TableCell>
                        <TableCell>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='h-4 w-4 text-muted-foreground' />
                            <span>{formatDate(parcela.dataVencimento)}</span>
                          </div>
                        </TableCell>
                        <TableCell className='font-medium'>
                          <div className='flex items-center space-x-2'>
                            <DollarSign className='h-4 w-4 text-muted-foreground' />
                            <span>{formatCurrency(parcela.valor)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800'>
                            {parcela.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              <Calculator className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p>Preencha os dados do contrato para visualizar as parcelas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
