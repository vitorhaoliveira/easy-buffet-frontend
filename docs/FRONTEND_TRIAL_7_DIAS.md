# Frontend: Trial de 7 dias sem cartão

Este documento descreve o que o frontend deve fazer para suportar os **7 dias de acesso gratuito sem cadastro de cartão**, alinhado às alterações feitas no backend.

---

## O que o backend envia

No login e no endpoint de usuário atual (ex.: `/me`), o backend retorna um objeto **`subscription`** no payload do usuário:

```ts
subscription: {
  status: 'trialing' | 'active' | 'expired' | null | ...,
  stripeCustomerId: string | null,
  stripeSubscriptionId: string | null,
  trialEndsAt: Date | null,      // fim do período de trial
  subscriptionEndsAt: Date | null
}
```

- **Novo cadastro (após a alteração no backend):** `status === 'trialing'` e `trialEndsAt` definido para 7 dias à frente. Nenhum cartão foi cadastrado.
- **Após os 7 dias:** um job no backend marca a assinatura como `expired`; o usuário perde acesso até assinar (checkout com cartão).
- Rotas protegidas podem retornar **402** com código/mensagem de assinatura obrigatória quando não houver trial ou assinatura ativa.

---

## O que fazer no frontend

### 1. Não exigir cartão durante o trial

- **Antes:** o frontend provavelmente redirecionava para o checkout (Stripe) logo após o cadastro ou no primeiro acesso.
- **Agora:**  
  - Se `subscription?.status === 'trialing'` e `subscription?.trialEndsAt` for uma data **no futuro**, **não** redirecionar para a tela de “cadastre seu cartão” / checkout.  
  - Deixar o usuário usar o app normalmente durante esses 7 dias.

Ou seja: a regra “só pode usar se tiver cartão” deve ser trocada por “só exige cartão se **não** tiver trial ativo”.

### 2. Mostrar que está em trial

- Usar `subscription.trialEndsAt` para exibir algo como:  
  **“Acesso trial até DD/MM/AAAA”** ou **“X dias restantes no período de teste”**.
- Opcional: aviso quando estiver perto do fim (ex.: últimos 1–2 dias).

### 3. Quando pedir o cartão (checkout)

Redirecionar para o fluxo de checkout (cadastro de cartão / assinatura) apenas quando:

- `subscription?.status === 'expired'`, ou  
- `subscription?.status === 'trialing'` e `trialEndsAt` já passou, ou  
- A API retornar **402** com código/mensagem de assinatura obrigatória (ex.: `SUBSCRIPTION_REQUIRED`).

Nesses casos, exibir uma tela do tipo **“Seu período de teste acabou. Cadastre um cartão para continuar”** e um botão que chama a API que gera a sessão de checkout e redireciona para o Stripe.

### 4. Tratar 402 nas chamadas à API

- No interceptor (axios/fetch) ou no tratamento de erro das requisições:  
  - Se a resposta for **402** e o código/mensagem for de assinatura obrigatória, redirecionar para a página de checkout/assinatura (ou modal “cadastre seu cartão”) em vez de mostrar só uma mensagem genérica.

### 5. Fluxo pós-cadastro

- Após o usuário se cadastrar, o backend já retorna `subscription: { status: 'trialing', trialEndsAt: ... }`.
- O frontend não deve mais considerar “sem cartão = bloqueado”. Deve considerar **“trial ativo = liberado por 7 dias”**.

---

## Checklist resumido

| Item | Ação no frontend |
|------|-------------------|
| **Trial ativo** | Se `status === 'trialing'` e `trialEndsAt > agora` → **não** redirecionar para checkout; liberar uso. |
| **UI do trial** | Exibir “Acesso trial até [trialEndsAt]” (e opcionalmente dias restantes). |
| **Quando pedir cartão** | Só quando trial expirado (`expired` ou `trialEndsAt` no passado) ou quando a API retornar 402. |
| **402** | Interceptor/tratamento de erro: ao receber 402 de subscription → redirecionar para fluxo de checkout. |
| **Pós-registro** | Não forçar checkout logo após cadastro; usar o `subscription` do `/me` para decidir. |

---

## Exemplo de verificação (JavaScript/TypeScript)

```ts
function hasActiveTrial(subscription: { status?: string; trialEndsAt?: string | null } | null): boolean {
  if (!subscription || subscription.status !== 'trialing') return false;
  if (!subscription.trialEndsAt) return false;
  return new Date(subscription.trialEndsAt) > new Date();
}

function shouldRequireCheckout(subscription: { status?: string; trialEndsAt?: string | null } | null): boolean {
  if (!subscription) return false;
  if (subscription.status === 'expired') return true;
  if (subscription.status === 'trialing' && subscription.trialEndsAt) {
    return new Date(subscription.trialEndsAt) <= new Date();
  }
  return false;
}
```

- Use `hasActiveTrial(subscription)` para **liberar** o uso sem pedir cartão.
- Use `shouldRequireCheckout(subscription)` para **exibir** a tela de “cadastre seu cartão” e redirecionar para o checkout.
