import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { 
  Calendar, 
  ClipboardList, 
  Home, 
  LogOut, 
  Package, 
  Settings, 
  Stethoscope, 
  Users,
  Activity,
  FileText
} from 'lucide-react';
import { PawIcon } from '@/components/icons/PawIcon';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { currentUser, logout, hasPermission } = useAuth();
  const location = useLocation();

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        path: '/',
        icon: Home,
        roles: ['Admin', 'Veterinario', 'Recepcionista'],
      },
      {
        title: 'Citas',
        path: '/appointments',
        icon: Calendar,
        roles: ['Admin', 'Veterinario', 'Recepcionista'],
      },
      {
        title: 'Mascotas',
        path: '/pets',
        icon: 'Paw',
        roles: ['Admin', 'Veterinario', 'Recepcionista'],
      },
    ];

    const adminVetItems = [
      {
        title: 'Historiales Médicos',
        path: '/records',
        icon: ClipboardList,
        roles: ['Admin', 'Veterinario'],
      },
      {
        title: 'Clientes',
        path: '/clients',
        icon: Users,
        roles: ['Admin', 'Recepcionista'],
      },
    ];

    const adminReceptionistItems = [
      {
        title: 'Productos',
        path: '/products',
        icon: Package,
        roles: ['Admin', 'Recepcionista'],
      },
      {
        title: 'Servicios',
        path: '/services',
        icon: Stethoscope,
        roles: ['Admin', 'Recepcionista'],
      },
      {
        title: 'Facturación',
        path: '/billing',
        icon: FileText,
        roles: ['Admin', 'Recepcionista'],
      },
    ];

    const adminOnlyItems = [
      {
        title: 'Personal',
        path: '/staff',
        icon: Users,
        roles: ['Admin'],
      },
      {
        title: 'Configuración',
        path: '/settings',
        icon: Settings,
        roles: ['Admin'],
      },
    ];

    let allItems = [...baseItems];

    // Add items based on user roles
    if (!currentUser) return baseItems;

    if (currentUser?.role === 'Admin') {
      allItems = [...allItems, ...adminVetItems, ...adminReceptionistItems, ...adminOnlyItems];
    } else if (currentUser?.role === 'Veterinario') {
      allItems = [...allItems, ...adminVetItems.filter(item => item.roles.includes('Veterinario'))];
    } else if (currentUser?.role === 'Recepcionista') {
      allItems = [
        ...allItems, 
        ...adminVetItems.filter(item => item.roles.includes('Recepcionista')),
        ...adminReceptionistItems.filter(item => item.roles.includes('Recepcionista'))
      ];
    }

    return allItems.filter(item => item.roles.includes(currentUser.role));
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-semibold text-xl">VetCare Central</span>
        </div>
        <SidebarTrigger className="absolute right-4 top-4 md:hidden" />
      </SidebarHeader>

      <SidebarContent>
        {currentUser && (
          <SidebarGroup>
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  {currentUser.imageUrl ? (
                    <AvatarImage src={currentUser.imageUrl} alt={currentUser.name} />
                  ) : (
                    <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  <p className="text-xs text-primary truncate capitalize">{currentUser.role}</p>
                </div>
              </div>
            </div>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 w-full",
                      location.pathname === item.path && "font-medium text-primary"
                    )}
                  >
                    {item.icon === 'Paw' ? (
                      <PawIcon className="h-5 w-5" />
                    ) : (
                      <item.icon className="h-5 w-5" />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 justify-center"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
