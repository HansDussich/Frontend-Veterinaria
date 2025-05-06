import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  hasFeatureAccess: (feature: 'billing_view' | 'billing_create' | 'billing_payment' | 'financial_stats' | 'medical_diagnosis' | 'products_pricing') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Paso 1: Verificar credenciales
      const loginResponse = await fetch(`https://veterinariaapi.somee.com/api/usuarios/login/${username}/${password}`);
      
      if (!loginResponse.ok) {
        throw new Error('Error al verificar credenciales');
      }

      const isValid = await loginResponse.json();

      if (!isValid) {
        toast({
          title: 'Error de inicio de sesión',
          description: 'Usuario o contraseña incorrectos.',
          variant: 'destructive',
        });
        return false;
      }

      // Paso 2: Obtener datos del usuario
      const usersResponse = await fetch('https://veterinariaapi.somee.com/api/usuarios');
      const users = await usersResponse.json();
      
      const user = users.find((u: any) => u.nombreUsuario === username);
      
      if (!user) {
        toast({
          title: 'Error de inicio de sesión',
          description: 'Usuario no encontrado en el sistema.',
          variant: 'destructive',
        });
        return false;
      }

      const formattedUser: User = {
        id: user.usuarioId.toString(),
        name: user.nombreUsuario,
        email: user.email,
        role: user.rol as UserRole,
      };
      
      setCurrentUser(formattedUser);
      localStorage.setItem('currentUser', JSON.stringify(formattedUser));
      return true;

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado la sesión correctamente.',
    });
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    return requiredRoles.includes(currentUser.role);
  };

  const hasFeatureAccess = (feature: 'billing_view' | 'billing_create' | 'billing_payment' | 'financial_stats' | 'medical_diagnosis' | 'products_pricing'): boolean => {
    if (!currentUser) return false;
    
    const accessMap = {
      billing_view: ['Admin', 'Recepcionista'],
      billing_create: ['Admin', 'Recepcionista'],
      billing_payment: ['Admin', 'Recepcionista'],
      financial_stats: ['Admin'],
      medical_diagnosis: ['Admin', 'Veterinario'],
      products_pricing: ['Admin', 'Recepcionista']
    };
    
    return accessMap[feature]?.includes(currentUser.role) || false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, hasPermission, hasFeatureAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};