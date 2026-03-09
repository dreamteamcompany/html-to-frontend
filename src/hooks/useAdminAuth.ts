import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useAdminAuth = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      toast({ title: "Вход выполнен", description: "Добро пожаловать в админ-панель!" });
    } else {
      toast({ title: "Ошибка входа", description: "Неверный логин или пароль", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLogin("");
    setPassword("");
    toast({ title: "Выход выполнен", description: "Вы вышли из админ-панели" });
  };

  return { isAuthenticated, login, setLogin, password, setPassword, handleLogin, handleLogout };
};
