# WhatsApp (Twilio) – Envio de orçamentos e confirmação de equipe

O backend pode enviar mensagens via WhatsApp usando a API do Twilio para:

1. **Orçamentos** – ao enviar um orçamento ao cliente, se houver telefone (no body ou no cadastro do cliente) e Twilio configurado, uma mensagem WhatsApp é enviada (conforme configuração).
2. **Confirmação de equipe** – ao gerar o link de confirmação para um membro da escala, se o membro tiver telefone e Twilio configurado, o link é enviado (conforme configuração).

O uso do Twilio é **opcional**: se as variáveis de ambiente não estiverem definidas, o envio por WhatsApp é ignorado e o restante do sistema funciona normalmente.

---

## Configuração por organização: email, WhatsApp ou ambos

Em **Configurações** (dados da empresa), a organização pode definir **por onde** enviar cada tipo de mensagem:

- **Envio de orçamento** (`quoteSend`): `email` | `whatsapp` | `both` (padrão: `both`)
- **Confirmação de equipe** (`teamConfirmation`): `email` | `whatsapp` | `both` (padrão: `both`)

**API:**

- **GET** `/settings/company` – retorna `notificationChannels: { quoteSend, teamConfirmation }`
- **PUT** `/settings/company` – aceita no body `notificationChannels: { quoteSend?, teamConfirmation? }` (valores: `"email"`, `"whatsapp"` ou `"both"`)

O envio real (email e/ou WhatsApp) respeita essa configuração: por exemplo, se `quoteSend` for `email`, apenas o email do orçamento é enviado; se for `whatsapp`, apenas o WhatsApp (e o cliente precisa ter telefone e Twilio configurado).

---

## Variáveis de ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `TWILIO_ACCOUNT_SID` | Sim (para WhatsApp) | Account SID do Twilio (Console) |
| `TWILIO_AUTH_TOKEN` | Sim (para WhatsApp) | Auth Token do Twilio |
| `TWILIO_WHATSAPP_FROM` | Sim (para WhatsApp) | Número do remetente no formato `whatsapp:+14155238886` (Sandbox) ou seu número WhatsApp Business |
| `TWILIO_WHATSAPP_QUOTE_TEMPLATE_SID` | Sim (para orçamentos) | Content SID do template de orçamento (criado no Twilio/Meta) |
| `TWILIO_WHATSAPP_TEAM_TEMPLATE_SID` | Sim (para equipe) | Content SID do template de confirmação de equipe |

Sem `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` e `TWILIO_WHATSAPP_FROM`, o envio por WhatsApp não é feito. Os template SIDs são necessários apenas para o tipo de mensagem correspondente (orçamento ou equipe).

---

## Configuração no Twilio

1. Crie uma conta em [Twilio](https://www.twilio.com).
2. Ative o **Sandbox do WhatsApp** em [Try WhatsApp](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn) para testes, ou configure um número WhatsApp Business para produção.
3. No Sandbox, o `TWILIO_WHATSAPP_FROM` é o número do sandbox (ex.: `whatsapp:+14155238886`). O destinatário precisa ter enviado "join &lt;código&gt;" ao sandbox para receber mensagens.
4. Para **mensagens iniciadas pelo negócio** (orçamento, confirmação de equipe), é obrigatório usar **templates aprovados** pela Meta. Crie os templates no [Content Template Builder](https://console.twilio.com/us1/develop/content) ou via API e use os Content SIDs nas variáveis acima.

---

## Templates e variáveis

As mensagens são enviadas com `contentSid` (template) e `contentVariables`. Os placeholders do template devem ser `{{1}}`, `{{2}}`, etc., e os valores são passados como JSON com chaves `"1"`, `"2"`, etc.

### Template de orçamento (quote)

Use `TWILIO_WHATSAPP_QUOTE_TEMPLATE_SID` com um template que tenha 4 variáveis, por exemplo:

- **Exemplo de texto:**  
  `Olá {{1}}, seu orçamento do buffet {{2}} está pronto. Valor: {{3}}. Acesse: {{4}}`

| Placeholder | Conteúdo |
|-------------|----------|
| {{1}} | Nome do cliente |
| {{2}} | Nome do buffet/organização |
| {{3}} | Valor total formatado (ex.: R$ 1.500,00) |
| {{4}} | URL da proposta (ex.: https://seu-dominio.com/proposal/TOKEN) |

### Template de confirmação de equipe (team)

Use `TWILIO_WHATSAPP_TEAM_TEMPLATE_SID` com um template que tenha 4 variáveis, por exemplo:

- **Exemplo de texto:**  
  `Olá {{1}}, confirme sua presença no evento {{2}} em {{3}}. Acesse: {{4}}`

| Placeholder | Conteúdo |
|-------------|----------|
| {{1}} | Nome do membro da equipe |
| {{2}} | Nome do evento |
| {{3}} | Data do evento (formatada pt-BR) |
| {{4}} | URL de confirmação |

---

## API

### Enviar orçamento (com WhatsApp opcional)

- **Endpoint:** `PATCH /quotes/:id/send`
- **Body:** além de `clientEmail` e `clientName`, pode enviar `clientPhone` (opcional).  
  Se `clientPhone` for omitido, o sistema usa o telefone do cliente vinculado ao orçamento (se existir).
- Se houver telefone válido e Twilio + template de orçamento configurados, o WhatsApp é enviado após o email (falhas no WhatsApp não falham a requisição).

### Link de confirmação para membro da equipe

- **Endpoint:** `POST /events/:eventId/schedules/:id/send-confirmation` (ou equivalente no seu roteamento).
- **Resposta:** além de `confirmationUrl`, `whatsappUrl`, `emailSent`, a API retorna `whatsappSent: true` quando o membro tem telefone (indica que o envio por WhatsApp foi tentado; o Twilio pode ainda falhar por template/número).

---

## Formato do telefone

Os números são normalizados para E.164 (ex.: `+5521999999999`). O serviço aceita formatos comuns no Brasil, por exemplo:

- `21999999999`
- `(21) 99999-9999`
- `+55 21 99999-9999`

Assume-se DDD + 9 dígitos para celular. Se forem 10 dígitos, é adicionado o 9 na frente (celular).

---

## Frontend (Angular)

### O que o frontend faz

1. **Envio de orçamento**  
   Na tela de pré-visualização do orçamento, ao clicar em "Enviar orçamento", o app chama `PATCH /quotes/:id/send` com:
   - `clientEmail`, `clientName`, `customMessage` (já existentes)
   - **`clientPhone`** (opcional): enviado quando o cliente vinculado ao orçamento possui telefone (`quote.client?.phone`). Se omitido, o backend usa o telefone do cliente cadastrado. O backend usa esse número para envio por WhatsApp quando Twilio e o canal `quoteSend` estiverem configurados.

2. **Configuração dos canais de notificação**  
   Em **Minha Conta** → aba **Empresa** (dados da empresa), o usuário admin pode definir:
   - **Envio de orçamento** (`quoteSend`): apenas e-mail, apenas WhatsApp ou ambos (padrão: ambos).
   - **Confirmação de equipe** (`teamConfirmation`): apenas e-mail, apenas WhatsApp ou ambos (padrão: ambos).  
   Os valores são persistidos via `PUT /settings/company` no body `notificationChannels: { quoteSend?, teamConfirmation? }`. O backend usa essa configuração para decidir se envia por e-mail, WhatsApp ou ambos.

3. **Link de confirmação para membro da equipe**  
   Na lista de escalas do evento, ao enviar o link de confirmação para um membro, o app chama `POST /events/:eventId/team-schedules/:scheduleId/send-confirmation`.  
   - Se a API retornar `whatsappUrl`, o frontend abre essa URL no navegador (WhatsApp Web ou app) para o usuário enviar manualmente, se desejar (o backend pode já ter enviado via Twilio conforme `teamConfirmation`).  
   - O toast de sucesso indica por quais canais o link foi enviado (`emailSent` e `whatsappSent` retornados pela API).

### Como configurar o envio das mensagens

| Onde | O que configurar |
|------|-------------------|
| **Backend** | Variáveis de ambiente do Twilio (ver seção "Variáveis de ambiente"). Sem elas, o envio por WhatsApp não é feito. |
| **Frontend – Minha Conta → Empresa** | Canais de notificação: escolher "E-mail e WhatsApp", "Apenas e-mail" ou "Apenas WhatsApp" para envio de orçamento e para confirmação de equipe. |
| **Cliente do orçamento** | Ter **e-mail** cadastrado (obrigatório hoje no frontend para enviar orçamento). Para receber também por WhatsApp, ter **telefone** cadastrado no cliente. |
| **Membro da equipe** | Ter **telefone** cadastrado para receber o link por WhatsApp (e e-mail para receber por e-mail). |

O envio efetivo (e-mail e/ou WhatsApp) é feito pelo backend conforme a configuração da organização e a disponibilidade de Twilio e dados do destinatário.
