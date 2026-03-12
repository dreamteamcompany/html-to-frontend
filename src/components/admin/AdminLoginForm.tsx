import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface AdminLoginFormProps {
  login: string;
  setLogin: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

const AdminLoginForm = ({ login, setLogin, password, setPassword, handleLogin, isLoading = false }: AdminLoginFormProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-heading font-bold text-primary">
            🔐 Вход в админ-панель
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-base font-semibold">Логин</Label>
              <Input
                id="login"
                type="text"
                placeholder="Введите логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full rounded-xl bg-primary hover:bg-primary/90 text-lg py-6">
              <Icon name={isLoading ? "Loader2" : "LogIn"} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginForm;