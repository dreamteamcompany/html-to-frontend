import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Logo from '@/components/ui/Logo';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import BiometricSetupModal from '@/components/auth/BiometricSetupModal';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [postLoginToken, setPostLoginToken] = useState<string | null>(null);
  const { login, setToken, setUser } = useAuth();
  const navigate = useNavigate();
  const webAuthn = useWebAuthn();

  useEffect(() => {
    const webauthnEnabled = localStorage.getItem('webauthn_enabled') === '1';
    if (!webauthnEnabled) return;
    webAuthn.isPlatformAuthAvailable().then(available => {
      setBiometricAvailable(available);
    });
  }, []);

  const navigateAfterLogin = (userData: { roles?: { name: string }[]; permissions?: { resource: string; action: string }[] }) => {
    const isCEO = userData.roles?.some((role) =>
      role.name === 'CEO' || role.name === 'Генеральный директор'
    );
    const hasPaymentsAccess = userData.permissions?.some(
      (p) => p.resource === 'payments' && p.action === 'read'
    );
    if (isCEO && hasPaymentsAccess) {
      navigate('/pending-approvals');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(username, password, rememberMe);
      const alreadyEnabled = localStorage.getItem('webauthn_enabled') === '1';
      const platform = await webAuthn.isPlatformAuthAvailable();
      if (!alreadyEnabled && platform) {
        const currentToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        setPostLoginToken(currentToken);
        setShowBiometricSetup(true);
      } else {
        navigateAfterLogin(userData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError('');
    const result = await webAuthn.authenticate();
    if (result) {
      const rememberMe = false;
      const { token, user } = result as { token: string; user: { roles?: { name: string }[]; permissions?: { resource: string; action: string }[] } };
      if (rememberMe) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('remember_me', 'true');
      } else {
        sessionStorage.setItem('auth_token', token);
      }
      setToken(token);
      setUser(user as Parameters<typeof setUser>[0]);
      navigateAfterLogin(user);
    } else if (webAuthn.error) {
      setError(webAuthn.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1729] to-[#1b254b] p-4">
      <Card className="w-full max-w-md border-white/10 bg-card/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Logo className="h-12 w-auto text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Вход в систему</CardTitle>
          <CardDescription>
            Введите логин и пароль для доступа
          </CardDescription>
        </CardHeader>
        <CardContent>
          {biometricAvailable && (
            <div className="mb-5">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-white/20 hover:border-primary/50 hover:bg-primary/5"
                onClick={handleBiometricLogin}
                disabled={webAuthn.loading}
              >
                {webAuthn.loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    Ожидание биометрии...
                  </>
                ) : (
                  <>
                    <Icon name="Fingerprint" size={20} />
                    Войти через Face ID / биометрию
                  </>
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card/50 px-2 text-muted-foreground">или</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {(error) && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Запомнить меня
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
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
        </CardContent>
      </Card>

      {showBiometricSetup && postLoginToken && (
        <BiometricSetupModal
          token={postLoginToken}
          onClose={() => {
            setShowBiometricSetup(false);
            navigate('/');
          }}
        />
      )}
    </div>
  );
};

export default Login;