import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Logo from '@/components/ui/Logo';

const BitrixCallback = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    if (errorParam) {
      setError(errorDesc || `Битрикс отклонил авторизацию: ${errorParam}`);
      setLoading(false);
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      setError('Не получен код авторизации от Битрикс');
      setLoading(false);
      return;
    }

    const exchangeCode = async () => {
      try {
        const resp = await fetch(
          `${API_ENDPOINTS.bitrixAuth}?endpoint=callback&code=${encodeURIComponent(code)}`
        );
        const data = await resp.json();

        if (!resp.ok) {
          setError(data.error || 'Ошибка авторизации через Битрикс');
          setLoading(false);
          return;
        }

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('remember_me', 'true');

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
      } catch {
        setError('Ошибка соединения с сервером');
        setLoading(false);
      }
    };

    exchangeCode();
  }, [searchParams, navigate, setToken, setUser]);

  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1729] to-[#1b254b] p-4">
        <Card className="w-full max-w-md border-[#7551e9]/30 bg-card/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(117,81,233,0.18)]">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Icon name="Loader2" size={40} className="animate-spin text-[#7551e9]" />
            <p className="text-foreground font-medium">Авторизация через Битрикс24...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1729] to-[#1b254b] p-4">
      <Card className="w-full max-w-md border-[#7551e9]/30 bg-card/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(117,81,233,0.18)]">
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #7551e9, #a78bfa)', borderRadius: '8px 8px 0 0' }} />
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <Logo className="h-12 w-auto text-white mb-2" />
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 w-full">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}
          <button
            onClick={() => navigate('/login')}
            className="text-[#a78bfa] hover:text-[#7551e9] text-sm font-medium transition-colors"
          >
            Вернуться на страницу входа
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BitrixCallback;