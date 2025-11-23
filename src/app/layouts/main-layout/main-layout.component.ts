import { Component } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { CommonModule } from '@angular/common'
import { LucideAngularModule, Home, ClipboardList, DollarSign, Settings, HelpCircle, MessageCircle } from 'lucide-angular'

interface MenuItem {
  title: string;
  url?: string;
  icon: string;
  items?: SubMenuItem[];
  expanded?: boolean;
}

interface SubMenuItem {
  title: string;
  url: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './main-layout.component.html',
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class MainLayoutComponent {
  // Lucide icons
  readonly HomeIcon = Home
  readonly ClipboardListIcon = ClipboardList
  readonly DollarSignIcon = DollarSign
  readonly SettingsIcon = Settings
  readonly HelpCircleIcon = HelpCircle
  readonly MessageCircleIcon = MessageCircle

  sidebarCollapsed = false

  menuItems: MenuItem[] = [
    {
      title: 'Cadastros',
      icon: 'clipboard-list',
      expanded: false,
      items: [
        { title: 'Clientes', url: '/cadastros/clientes' },
        { title: 'Pacotes/Serviços', url: '/cadastros/pacotes' },
        { title: 'Eventos/Reservas', url: '/cadastros/eventos' },
        { title: 'Usuários', url: '/cadastros/usuarios' },
        { title: 'Contratos', url: '/cadastros/contratos' }
      ]
    },
    {
      title: 'Financeiro',
      icon: 'dollar-sign',
      expanded: false,
      items: [
        { title: 'Dashboard', url: '/financeiro' },
        { title: 'Parcelas', url: '/financeiro/parcelas' },
        { title: 'Custos e Despesas', url: '/financeiro/custos' },
        { title: 'Relatório Mensal', url: '/reports/monthly' }
      ]
    },
    {
      title: 'Configurações',
      icon: 'settings',
      expanded: false,
      items: [
        { title: 'Minha Conta', url: '/profile/account', disabled: true },
        { title: 'Empresa', url: '/settings/organization', disabled: true },
        { title: 'Permissões', url: '/settings/permissions', disabled: true }
      ]
    }
  ]

  /**
   * @Function - toggleSidebar
   * @description - Toggle sidebar collapsed state
   * @author - Vitor Hugo
   * @param - void
   * @returns - void
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed
    // Close all expanded menus when collapsing
    if (this.sidebarCollapsed) {
      this.menuItems.forEach(item => item.expanded = false)
    }
  }

  /**
   * @Function - toggleMenu
   * @description - Toggle menu item expansion
   * @author - Vitor Hugo
   * @param - item: MenuItem
   * @returns - void
   */
  toggleMenu(item: MenuItem): void {
    // Don't toggle if sidebar is collapsed
    if (this.sidebarCollapsed) return
    item.expanded = !item.expanded
  }

  /**
   * @Function - getIconComponent
   * @description - Get Lucide icon component for menu item
   * @author - Vitor Hugo
   * @param iconName - string - The icon identifier
   * @returns any - Lucide icon component
   */
  getIconComponent(iconName: string): any {
    const iconMap: { [key: string]: any } = {
      'clipboard-list': this.ClipboardListIcon,
      'dollar-sign': this.DollarSignIcon,
      'settings': this.SettingsIcon
    }
    return iconMap[iconName] || this.ClipboardListIcon
  }
}

