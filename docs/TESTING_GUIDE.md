# Guia de Testes - Feature de Orçamentos

## 🚀 Iniciando o Servidor de Desenvolvimento

```bash
ng serve
```

Acesso: `http://localhost:4200`

## ✅ Testes Funcionar - Frontend (100% Completo)

### 1. **Página de Lista de Orçamentos**
- URL: `http://localhost:4200/cadastros/orcamentos`
- ✅ Listar orçamentos com filtros
- ✅ Filtrar por status (5 status disponíveis)
- ✅ Buscar por cliente/evento
- ✅ Botão "Ver" → abre visualização interna
- ✅ Botão "Link" → abre proposta pública (novo!)
- ✅ Botão "PDF" → exporta em PDF
- ✅ Botão "Editar" → edita orçamento
- ✅ Botão "Excluir" → remove com confirmação

### 2. **Criar/Editar Orçamento (Interno)**
- URL: `http://localhost:4200/cadastros/orcamentos/novo`
- URL: `http://localhost:4200/cadastros/orcamentos/editar/:id`
- ✅ Selecionar cliente
- ✅ Selecionar evento
- ✅ Adicionar itens com descrição, qtd, valor
- ✅ Cálculo automático do total
- ✅ Salvar orçamento

### 3. **Visualizar Orçamento (Interno)**
- URL: `http://localhost:4200/cadastros/orcamentos/visualizar/:id`
- ✅ Ver detalhes do orçamento
- ✅ Botão "Enviar" → envia proposta pública
- ✅ Botão "Aceitar" → marca como aceito (interno)
- ✅ Botão "Rejeitar" → marca como rejeitado (interno)
- ✅ Botão "PDF" → exporta em PDF
- ✅ Botão "Gerar Contrato" → gera contrato (backend)

### 4. **Proposta Pública (Cliente)**
- 🆕 Nova rota: `http://localhost:4200/proposal/:token`
- ✅ Ver orçamento sem autenticação
- ✅ Status visual (Aceito, Rejeitado, Expirado)
- ✅ Detalhes do evento
- ✅ Itens e valores
- ✅ Formulário de aceitação:
  - Nome do cliente*
  - Email
  - Telefone
  - CPF
  - Checkbox de termos
- ✅ Botão "Aceitar Proposta"
- ✅ Botão "Rejeitar Proposta"
- ✅ Botão "Baixar PDF"

## 🔗 Como Testar a Proposta Pública

### Opção 1: Via Botão na Lista (Recomendado)
1. Vá para `http://localhost:4200/cadastros/orcamentos`
2. Localize um orçamento com status "Enviado" ou superior
3. Clique no botão **"Link"** (verde)
4. A proposta pública abrirá em uma nova aba

### Opção 2: URL Direta (após enviar orçamento)
1. Crie/abra um orçamento
2. Clique em "Enviar" para gerar `publicLinkToken`
3. Copie o token do console (ou use Opção 1)
4. Acesse: `http://localhost:4200/proposal/{token}`

### Opção 3: Teste com Token Mocado
Se tiver um token válido no banco de dados:
```
http://localhost:4200/proposal/seu-token-aqui
```

## 📝 Ciclo de Vida Completo (Teste End-to-End)

```
1. Criar Orçamento
   ↓
2. Visualizar Orçamento
   ↓
3. Clicar "Enviar" (gera token público)
   ↓
4. Clicar "Link" na lista
   ↓
5. Na aba nova: cliente preenche formulário
   ↓
6. Cliente clica "Aceitar Proposta"
   ↓
7. Voltar à aba original: status = "Aceito"
   ↓
8. Clicar "Gerar Contrato" (backend)
   ↓
9. Contrato disponível para download
```

## 🐛 Troubleshooting

### "Proposta não encontrada"
- **Causa**: Token inválido ou expirado
- **Solução**: Enviar um novo orçamento para gerar novo token

### "Página em branco"
- **Causa**: Erro no carregamento
- **Solução**: Abrir console (F12) e verificar erros

### "Erro ao carregar cliente/evento"
- **Causa**: Backend não retornando dados
- **Solução**: Verificar se backend está rodando e base de dados tem registros

### "Botão 'Link' não aparece"
- **Causa**: Orçamento ainda não foi enviado (sem publicLinkToken)
- **Solução**: Visualizar orçamento e clicar "Enviar" primeiro

## ✨ Features de Frontend Implementadas

| Feature | Status | Arquivo |
|---------|--------|---------|
| Lista de orçamentos | ✅ Completo | `quote-list.component.ts` |
| Criar orçamento | ✅ Completo | `quote-form.component.ts` |
| Editar orçamento | ✅ Completo | `quote-form.component.ts` |
| Visualizar orçamento | ✅ Completo | `quote-preview.component.ts` |
| **Proposta pública** | ✅ **Novo** | `proposal-page.component.ts` |
| Filtros avançados | ✅ Completo | `quote-list.component.ts` |
| Exportar PDF | ✅ Completo | Via `ExportService` |
| Resposta mobile | ✅ Completo | Todos os componentes |

## 🔄 Backend - Próximas Etapas

Quando o backend estiver pronto (confira `BACKEND_QUOTES_SPEC.md`):

### Endpoints Necessários
```
PATCH /api/quotes/:id/send          → enviar proposta
GET  /api/quotes/public/:token      → obter proposta pública
POST /api/quotes/public/:token/accept → aceitar (cliente)
POST /api/quotes/public/:token/reject → rejeitar (cliente)
POST /api/quotes/:id/generate-contract → gerar contrato
GET  /api/quotes/:id/contract       → obter contrato
GET  /api/quotes/download/:id       → PDF interno
GET  /api/quotes/public/:token/download → PDF público
```

### Integrações
- 📧 **Resend**: Enviar email com link da proposta
- 📄 **HTML2PDF**: Gerar PDF do contrato
- 💾 **Database**: Tabela `quote_contracts` e campos em `quotes`

## 📞 Contato

Para dúvidas ou problemas:
1. Verificar console (F12) para erros
2. Conferir status do backend
3. Revisar `BACKEND_QUOTES_SPEC.md` para integração
