import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { API_ENDPOINTS } from "@/config/api";

export const useAdminAuth = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.authApi}?endpoint=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: login, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        const isAdmin = data.user?.roles?.some(
          (r: { name: string }) => r.name === 'Администратор' || r.name === 'Admin'
        );
        if (isAdmin) {
          setIsAuthenticated(true);
          sessionStorage.setItem('admin_token', data.token);
          toast({ title: "Вход выполнен", description: "Добро пожаловать в админ-панель!" });
        } else {
          toast({ title: "Доступ запрещён", description: "Недостаточно прав для входа в админ-панель", variant: "destructive" });
        }
      } else {
        toast({ title: "Ошибка входа", description: data.error || "Неверный логин или пароль", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка сети", description: "Проверьте подключение к интернету", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLogin("");
    setPassword("");
    sessionStorage.removeItem('admin_token');
    toast({ title: "Выход выполнен", description: "Вы вышли из админ-панели" });
  };

  return { isAuthenticated, login, setLogin, password, setPassword, handleLogin, handleLogout, isLoading };
};
