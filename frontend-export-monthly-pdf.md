# API - Exportação de Relatório Mensal em PDF

## Endpoint

```
GET /reports/monthly/pdf
```

## Parâmetros de Query (obrigatórios)

| Parâmetro | Tipo | Descrição | Valores |
|-----------|------|-----------|---------|
| `month` | number | Número do mês | 1-12 (Janeiro = 1, Dezembro = 12) |
| `year` | number | Ano | Ex: 2024 |

## Headers Obrigatórios

| Header | Tipo | Descrição |
|--------|------|-----------|
| `Authorization` | string | Token de autenticação no formato `Bearer {token}` |
| `X-Organization-Id` | string | ID da organização |

## Exemplo de Requisição

```
GET /reports/monthly/pdf?month=1&year=2024
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Organization-Id: 123e4567-e89b-12d3-a456-426614174000
```

## Resposta

### Sucesso (200 OK)

**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="relatorio-mensal-{Mês}-{Ano}.pdf"`

**Body:**
- Arquivo PDF binário

**Exemplo de nome de arquivo:**
- `relatorio-mensal-Janeiro-2024.pdf`

### Erros

| Status Code | Descrição |
|-------------|-----------|
| 400 | Parâmetros inválidos (month ou year ausentes/inválidos) |
| 401 | Não autorizado (token inválido ou ausente) |
| 403 | Sem permissão para exportar relatórios |
| 404 | Organização não encontrada |
| 500 | Erro interno do servidor |

## Implementação no Frontend

### Requisitos Técnicos

1. **Tipo de Resposta**: A resposta é um arquivo binário (PDF), não JSON
2. **Response Type**: Configure o cliente HTTP para receber `blob` ou `arraybuffer`
3. **Download**: Após receber o blob, criar um link temporário e disparar o download
4. **Limpeza**: Revogar a URL do blob após o download para evitar vazamentos de memória

### Fluxo de Implementação

1. Fazer requisição GET com parâmetros `month` e `year`
2. Incluir headers `Authorization` e `X-Organization-Id`
3. Configurar response type como `blob` (ou `arraybuffer`)
4. Verificar se a resposta é bem-sucedida (status 200)
5. Extrair o nome do arquivo do header `Content-Disposition` (opcional)
6. Criar um `Blob` a partir da resposta
7. Criar uma URL temporária com `URL.createObjectURL()`
8. Criar um elemento `<a>` com atributo `download`
9. Disparar o clique programático no link
10. Remover o link e revogar a URL com `URL.revokeObjectURL()`

### Exemplo Genérico (JavaScript)

```javascript
async function exportMonthlyReportPDF(month, year, organizationId, token) {
  const url = `${API_BASE_URL}/reports/monthly/pdf?month=${month}&year=${year}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-Id': organizationId,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const blob = await response.blob();
  const urlBlob = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = urlBlob;
  
  // Extrair nome do arquivo do header (opcional)
  const contentDisposition = response.headers.get('content-disposition');
  let filename = `relatorio-mensal-${month}-${year}.pdf`;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
    if (filenameMatch) filename = filenameMatch[1];
  }
  
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(urlBlob);
}
```

### Com Axios

```javascript
const response = await axios.get('/reports/monthly/pdf', {
  params: { month, year },
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Organization-Id': organizationId,
  },
  responseType: 'blob', // Importante!
});

const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.download = 'relatorio-mensal.pdf'; // ou extrair do header
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
window.URL.revokeObjectURL(url);
```

## Validações

- `month`: Deve ser um número entre 1 e 12
- `year`: Deve ser um número válido (recomendado: 2000-2100)
- `token`: Deve ser um JWT válido
- `organizationId`: Deve ser um UUID válido da organização

## Tratamento de Erros

Trate os seguintes cenários:

1. **401 Unauthorized**: Token inválido ou expirado - redirecionar para login
2. **403 Forbidden**: Usuário sem permissão - exibir mensagem apropriada
3. **400 Bad Request**: Parâmetros inválidos - validar antes de enviar
4. **404 Not Found**: Organização não encontrada - verificar organização selecionada
5. **500 Internal Server Error**: Erro do servidor - exibir mensagem genérica

## Notas Importantes

- A resposta é um arquivo binário, não JSON
- Sempre use `responseType: 'blob'` ou `arraybuffer` no cliente HTTP
- O download é iniciado pelo navegador quando o link é clicado
- Sempre revogue a URL do blob após o download (`URL.revokeObjectURL()`)
- O nome do arquivo pode ser extraído do header `Content-Disposition` ou gerado localmente
