'use client'

import * as React from 'react'
import {
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Users,
  Calendar,
  Package,
  UserCheck,
  DollarSign,
  FileText
} from 'lucide-react'

import { NavMain } from '@/components/ui/nav-menu/nav-main'
// import { NavProjects } from '@/components/nav-projects'
import { NavSecondary } from '@/components/ui/nav-menu/nav-secondary'
import { NavUser } from '@/components/ui/nav-menu/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar/sidebar'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: PieChart,
      isActive: true
    },
    {
      title: 'Cadastros',
      url: '#',
      icon: SquareTerminal,
      items: [
        {
          title: 'Clientes',
          url: '/cadastros/clientes',
          icon: Users,
          items: [
            {
              title: 'Listar',
              url: '/cadastros/clientes'
            },
            {
              title: 'Novo Cliente',
              url: '/cadastros/clientes/novo'
            }
          ]
        },
        {
          title: 'Pacotes/Serviços',
          url: '/cadastros/pacotes',
          icon: Package,
          items: [
            {
              title: 'Listar',
              url: '/cadastros/pacotes'
            },
            {
              title: 'Novo Pacote',
              url: '/cadastros/pacotes/novo'
            }
          ]
        },
        {
          title: 'Eventos/Reservas',
          url: '/cadastros/eventos',
          icon: Calendar,
          items: [
            {
              title: 'Listar',
              url: '/cadastros/eventos'
            },
            {
              title: 'Nova Reserva',
              url: '/cadastros/eventos/novo'
            }
          ]
        },
        {
          title: 'Usuários',
          url: '/cadastros/usuarios',
          icon: UserCheck,
          items: [
            {
              title: 'Listar',
              url: '/cadastros/usuarios'
            },
            {
              title: 'Novo Usuário',
              url: '/cadastros/usuarios/novo'
            }
          ]
        },
        {
          title: 'Contratos',
          url: '/cadastros/contratos',
          icon: FileText,
          items: [
            {
              title: 'Listar',
              url: '/cadastros/contratos'
            },
            {
              title: 'Novo Contrato',
              url: '/cadastros/contratos/novo'
            }
          ]
        }
      ]
    },
    {
      title: 'Financeiro',
      url: '/financeiro',
      icon: DollarSign,
      items: [
        {
          title: 'Dashboard',
          url: '/financeiro'
        },
        {
          title: 'Parcelas de Entrada',
          url: '/financeiro/parcelas'
        },
        {
          title: 'Custos e Despesas',
          url: '/financeiro/custos'
        },
        {
          title: 'Resumo Financeiro',
          url: '/financeiro/resumo'
        },
        {
          title: 'Relatórios',
          url: '/financeiro/relatorio'
        }
      ]
    },
    {
      title: 'Configurações',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'Geral',
          url: '#'
        },
        {
          title: 'Time',
          url: '#'
        },
        {
          title: 'Pagamento',
          url: '#'
        },
        {
          title: 'Limites',
          url: '#'
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: 'Suporte',
      url: '#',
      icon: LifeBuoy
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send
    }
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='/'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <Command className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Acme Inc</span>
                  <span className='truncate text-xs'>Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
