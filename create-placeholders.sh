#!/bin/bash

# Script to create placeholder components for the Angular migration

# Base directory
BASE_DIR="/Users/vitorhugoalvesdeoliveira/Documents/easybuffet-angular/src/app"

# Function to create a placeholder component
create_placeholder() {
    local path=$1
    local component_name=$2
    local display_name=$3
    
    mkdir -p "$BASE_DIR/$path"
    
    cat > "$BASE_DIR/$path/${component_name}.component.ts" <<EOL
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-${component_name}',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">${display_name}</h1>
        <p class="text-muted-foreground">
          Página em desenvolvimento
        </p>
      </div>
      
      <div class="p-6 bg-white rounded-lg border border-border">
        <p>Este componente será implementado em breve.</p>
      </div>
    </div>
  \`,
  styles: []
})
export class ${component_name^}Component {}
EOL
    
    echo "Created: $path/${component_name}.component.ts"
}

# Register - Clients
create_placeholder "features/register/clients/client-list" "client-list" "Lista de Clientes"
create_placeholder "features/register/clients/client-form" "client-form" "Formulário de Cliente"

# Register - Packages
create_placeholder "features/register/packages/package-list" "package-list" "Lista de Pacotes"
create_placeholder "features/register/packages/package-form" "package-form" "Formulário de Pacote"

# Register - Events
create_placeholder "features/register/events/events-list" "events-list" "Lista de Eventos"
create_placeholder "features/register/events/events-form" "events-form" "Formulário de Evento"

# Register - Users
create_placeholder "features/register/users/user-list" "user-list" "Lista de Usuários"
create_placeholder "features/register/users/user-form" "user-form" "Formulário de Usuário"

# Register - Contracts
create_placeholder "features/register/contracts/contracts-list" "contracts-list" "Lista de Contratos"
create_placeholder "features/register/contracts/contract-form" "contract-form" "Formulário de Contrato"
create_placeholder "features/register/contracts/contract-detail" "contract-detail" "Detalhes do Contrato"

# Financial
create_placeholder "features/financial/financial-dashboard" "financial-dashboard" "Dashboard Financeiro"
create_placeholder "features/financial/installments/installments-list" "installments-list" "Lista de Parcelas"
create_placeholder "features/financial/installments/installment-form" "installment-form" "Formulário de Parcela"
create_placeholder "features/financial/installments/installment-detail" "installment-detail" "Detalhes da Parcela"
create_placeholder "features/financial/costs/costs-list" "costs-list" "Lista de Custos"
create_placeholder "features/financial/costs/cost-form" "cost-form" "Formulário de Custo"
create_placeholder "features/financial/costs/cost-detail" "cost-detail" "Detalhes do Custo"

# Reports
create_placeholder "features/reports/monthly-report" "monthly-report" "Relatório Mensal"

# Profile
create_placeholder "features/profile/account-settings" "account-settings" "Configurações da Conta"

# Settings
create_placeholder "features/settings/company-settings" "company-settings" "Configurações da Empresa"
create_placeholder "features/settings/permissions-settings" "permissions-settings" "Configurações de Permissões"

echo "All placeholder components created successfully!"

