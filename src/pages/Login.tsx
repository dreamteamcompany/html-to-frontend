import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Logo from '@/components/ui/Logo';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bitrixLoading, setBitrixLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoBitrixTriggered = useRef(false);

  const navigateAfterLogin = (_userData: { roles?: { name: string }[]; permissions?: { resource: string; action: string }[] }) => {
    let target = '/';
    try {
      const saved = sessionStorage.getItem('post_login_redirect');
      if (saved) {
        sessionStorage.removeItem('post_login_redirect');
        target = saved;
      }
    } catch {
      /* ignore */
    }
    navigate(target);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(username, password, rememberMe);
      navigateAfterLogin(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleBitrixLogin = async () => {
    setError('');
    setBitrixLoading(true);

    try {
      const resp = await fetch(`${API_ENDPOINTS.bitrixAuth}?endpoint=login`);
      const data = await resp.json();

      if (!resp.ok) {
        setError(data.error || 'Ошибка подключения к Битрикс');
        setBitrixLoading(false);
        return;
      }

      window.location.href = data.auth_url;
    } catch {
      setError('Ошибка соединения с сервером');
      setBitrixLoading(false);
    }
  };

  useEffect(() => {
    if (autoBitrixTriggered.current) return;
    if (searchParams.get('auto_bitrix') === '1') {
      autoBitrixTriggered.current = true;
      handleBitrixLogin();
    }
  }, [searchParams]);

  const autoBitrix = searchParams.get('auto_bitrix') === '1';

  if (autoBitrix && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1729] to-[#1b254b] p-4">
        <Card className="w-full max-w-md border-[#7551e9]/30 bg-card/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(117,81,233,0.18)]">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Logo className="h-12 w-auto text-white mb-2" />
            <Icon name="Loader2" size={40} className="animate-spin text-[#7551e9]" />
            <p className="text-foreground font-medium">Перенаправляем в Битрикс24...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1729] to-[#1b254b] p-4">
      <Card className="w-full max-w-md border-[#7551e9]/30 bg-card/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(117,81,233,0.18)]">
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #7551e9, #a78bfa)', borderRadius: '8px 8px 0 0' }} />
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Logo className="h-12 w-auto text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Вход в систему</CardTitle>
          <CardDescription className="text-muted-foreground/90 text-sm">
            Введите логин и пароль для доступа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error) && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">Логин</Label>
              <Input
                id="username"
                type="text"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="bg-background/80 border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:border-[#7551e9] focus:ring-[#7551e9]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="bg-background/80 border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:border-[#7551e9] focus:ring-[#7551e9]/20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border/60 bg-background/80 text-[#7551e9] focus:ring-[#7551e9] focus:ring-offset-0 accent-[#7551e9]"
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-foreground/80">
                Запомнить меня
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#7551e9] hover:bg-[#6341d4] text-white shadow-[0_4px_16px_rgba(117,81,233,0.35)]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  Вход...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={18} />
                  Войти
                </>
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground/60">или</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-[#2fc7f7]/40 text-[#2fc7f7] hover:bg-[#2fc7f7]/10 hover:text-[#2fc7f7] hover:border-[#2fc7f7]/60"
            disabled={bitrixLoading}
            onClick={handleBitrixLogin}
          >
            {bitrixLoading ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                Подключение...
              </>
            ) : (
              <>
                <Icon name="Building2" size={18} />
                Войти через Битрикс24
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;