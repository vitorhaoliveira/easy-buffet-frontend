Conversão de orçamento em contrato
Contexto
Quando um orçamento é aceito (status "Aceito"), o próximo passo no fluxo é formalizar o acordo em um contrato. O sistema permite converter um orçamento aceito em contrato, preservando valor e itens acordados.
Comportamento
Orçamento é a proposta enviada ao cliente (itens, preços, total, validade). Ao ser aceito, vira o acordo que será formalizado.
Contrato é o documento comercial com valor total, parcelas e datas de vencimento, vinculado ao evento e ao cliente.
A ação "Converter em contrato" está disponível para orçamentos com status "Aceito" e faz o seguinte:
Cria um novo contrato associado ao mesmo evento e cliente do orçamento.
Usa o valor total do orçamento aceito como totalAmount do contrato.
Copia os itens do orçamento para o contrato (descrição, quantidade, preço unitário e total por item).
Exige que o usuário informe as condições de pagamento: número de parcelas, data da primeira parcela e periodicidade (Semanal, Quinzenal ou Mensal).
Vincula o contrato ao orçamento (quoteId) para rastrear a origem.
Assim, o contrato reflete exatamente o que foi aceito no orçamento (total e itens); as únicas informações adicionais são as condições de pagamento (parcelas e datas).
Regras
Só orçamentos com status "Aceito" podem ser convertidos.
O orçamento deve estar vinculado a um evento (obrigatório para ter contrato).
O evento não pode já possuir outro contrato ativo.
Resumo para mudança (changelog / release notes)
Orçamentos e contratos: fluxo de "Converter em contrato" para orçamentos aceitos — ao converter, o sistema cria um contrato usando o valor total e os itens do orçamento, mantendo o acordo já aceito e exigindo apenas as condições de pagamento (parcelas e datas). O contrato fica vinculado ao orçamento de origem.