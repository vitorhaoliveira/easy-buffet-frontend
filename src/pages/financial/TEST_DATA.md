# 📊 Dados de Teste - Parcelas Financeiras

Adicionei **17 parcelas adicionais** ao mock para facilitar os testes de edição e visualização!

## 🎯 **Resumo dos Dados**

- **Total de Parcelas**: 24 parcelas
- **Contratos**: 10 contratos diferentes
- **Clientes**: 10 clientes únicos
- **Status Diversos**: Pago, Pendente, Vencido
- **Valores Variados**: R$ 800,00 a R$ 3.500,00

## 📈 **Parcelas por Status**

### **✅ Pagas (8 parcelas)**
- CT001 - Parcela 1 (João Silva) - R$ 2.500,00
- CT001 - Parcela 2 (João Silva) - R$ 2.500,00
- CT002 - Parcela 1 (Ana Costa) - R$ 1.800,00
- CT003 - Parcela 2 (Pedro Santos) - R$ 3.200,00
- CT006 - Parcela 1 (Fernanda Lima) - R$ 800,00
- CT007 - Parcela 1 (Roberto Alves) - R$ 1.500,00
- CT009 - Parcela 1 (Marcos Silva) - R$ 3.500,00
- CT010 - Parcela 1 (Lucia Ferreira) - R$ 950,00

### **⏳ Pendentes (13 parcelas)**
- CT001 - Parcela 3 (João Silva) - R$ 2.500,00
- CT002 - Parcela 2 (Ana Costa) - R$ 1.800,00
- CT003 - Parcela 3 (Pedro Santos) - R$ 3.200,00
- CT003 - Parcela 4 (Pedro Santos) - R$ 3.200,00
- CT005 - Parcela 2 (Carlos Mendes) - R$ 2.200,00
- CT007 - Parcela 2 (Roberto Alves) - R$ 1.500,00
- CT007 - Parcela 3 (Roberto Alves) - R$ 1.500,00
- CT008 - Parcela 2 (Patricia Costa) - R$ 1.800,00
- CT008 - Parcela 3 (Patricia Costa) - R$ 1.800,00
- CT008 - Parcela 4 (Patricia Costa) - R$ 1.800,00
- CT008 - Parcela 5 (Patricia Costa) - R$ 1.800,00
- CT009 - Parcela 2 (Marcos Silva) - R$ 3.500,00
- CT004 - Parcela 1 (Maria Oliveira) - R$ 1.200,00

### **🚨 Vencidas (3 parcelas)**
- CT003 - Parcela 1 (Pedro Santos) - R$ 3.200,00
- CT005 - Parcela 1 (Carlos Mendes) - R$ 2.200,00
- CT008 - Parcela 1 (Patricia Costa) - R$ 1.800,00

## 🏢 **Contratos Disponíveis**

### **CT001 - Casamento João & Maria**
- **Cliente**: João Silva
- **Evento**: 15/01/2024
- **Parcelas**: 3x R$ 2.500,00
- **Status**: 2 pagas, 1 pendente

### **CT002 - Aniversário 50 anos**
- **Cliente**: Ana Costa
- **Evento**: 25/01/2024
- **Parcelas**: 2x R$ 1.800,00
- **Status**: 1 paga, 1 pendente

### **CT003 - Formatura Medicina**
- **Cliente**: Pedro Santos
- **Evento**: 10/02/2024
- **Parcelas**: 4x R$ 3.200,00
- **Status**: 1 vencida, 1 paga, 2 pendentes

### **CT004 - Batizado do Lucas**
- **Cliente**: Maria Oliveira
- **Evento**: 20/02/2024
- **Parcelas**: 1x R$ 1.200,00
- **Status**: 1 pendente

### **CT005 - Festa de 15 anos da Sofia**
- **Cliente**: Carlos Mendes
- **Evento**: 05/03/2024
- **Parcelas**: 2x R$ 2.200,00
- **Status**: 1 vencida, 1 pendente

### **CT006 - Chá de Bebê**
- **Cliente**: Fernanda Lima
- **Evento**: 20/03/2024
- **Parcelas**: 1x R$ 800,00
- **Status**: 1 paga

### **CT007 - Aniversário de 60 anos**
- **Cliente**: Roberto Alves
- **Evento**: 10/04/2024
- **Parcelas**: 3x R$ 1.500,00
- **Status**: 1 paga, 2 pendentes

### **CT008 - Formatura de Direito**
- **Cliente**: Patricia Costa
- **Evento**: 15/05/2024
- **Parcelas**: 5x R$ 1.800,00
- **Status**: 1 vencida, 4 pendentes

### **CT009 - Casamento de Prata**
- **Cliente**: Marcos Silva
- **Evento**: 30/06/2024
- **Parcelas**: 2x R$ 3.500,00
- **Status**: 1 paga, 1 pendente

### **CT010 - Festa Junina**
- **Cliente**: Lucia Ferreira
- **Evento**: 24/06/2024
- **Parcelas**: 1x R$ 950,00
- **Status**: 1 paga

## 🧪 **Cenários de Teste**

### **Para Testar Edição:**
1. **Parcela Pendente**: ID 3, 9, 15, 18, 19, 20, 21, 23
2. **Parcela Paga**: ID 1, 2, 4, 8, 13, 14, 22, 24
3. **Parcela Vencida**: ID 6, 11, 17

### **Para Testar Visualização:**
- **Todas as parcelas** têm páginas de detalhes funcionais
- **Diferentes status** mostram informações específicas
- **Alertas visuais** para parcelas vencidas

### **Para Testar Filtros:**
- **Por Mês**: Janeiro (3), Fevereiro (2), Março (3), Abril (3), Maio (5), Junho (3)
- **Por Status**: Pago (8), Pendente (13), Vencido (3)
- **Por Cliente**: 10 clientes diferentes

### **Para Testar Busca:**
- **Por Nome**: "João", "Ana", "Pedro", "Maria", "Carlos", "Fernanda", "Roberto", "Patricia", "Marcos", "Lucia"
- **Por Evento**: "Casamento", "Aniversário", "Formatura", "Batizado", "Festa", "Chá"
- **Por Contrato**: "CT001", "CT002", "CT003", etc.

## 🎯 **IDs para Testes Rápidos**

### **Edição:**
- **Pendente**: `/financeiro/parcelas/editar/3`
- **Paga**: `/financeiro/parcelas/editar/1`
- **Vencida**: `/financeiro/parcelas/editar/6`

### **Visualização:**
- **Pendente**: `/financeiro/parcelas/visualizar/3`
- **Paga**: `/financeiro/parcelas/visualizar/1`
- **Vencida**: `/financeiro/parcelas/visualizar/6`

### **Diferentes Contratos:**
- **CT001**: `/financeiro/parcelas/visualizar/1` (João Silva)
- **CT005**: `/financeiro/parcelas/visualizar/11` (Carlos Mendes)
- **CT008**: `/financeiro/parcelas/visualizar/17` (Patricia Costa)

## 📊 **Métricas dos Dados**

- **Valor Total**: R$ 47.350,00
- **Valor Pago**: R$ 18.100,00
- **Valor Pendente**: R$ 26.250,00
- **Valor Vencido**: R$ 3.000,00
- **Média por Parcela**: R$ 1.972,92
- **Maior Parcela**: R$ 3.500,00 (CT009)
- **Menor Parcela**: R$ 800,00 (CT006)

## 🚀 **Como Usar para Testes**

1. **Acesse** `/financeiro/parcelas`
2. **Use os filtros** para encontrar parcelas específicas
3. **Clique em "Visualizar"** para ver detalhes
4. **Clique em "Editar"** para testar edição
5. **Teste "Marcar como Pago"** em parcelas pendentes
6. **Use a busca** para encontrar por nome ou evento

---

**🎉 Agora você tem dados suficientes para testar todas as funcionalidades!**

Os dados incluem cenários realistas com diferentes status, valores, datas e clientes para uma experiência de teste completa.
