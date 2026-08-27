import { useState, useEffect, useCallback } from 'react';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import UserAvatar from '@/components/ui/user-avatar';

interface ChatMessage {
  id: number;
  bitrix_user_id: string;
  user_id: number | null;
  message_text: string;
  created_at: string;
  user_full_name?: string;
  user_username?: string;
  user_photo_url?: string;
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Chat = () => {
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    menuOpen,
    setMenuOpen,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSidebarTouch();

  const loadMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await apiFetch(`${API_ENDPOINTS.chatApi}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
        setError(null);
      } else if (res.status === 403) {
        setError('Нет доступа к разделу «Чат»');
      } else {
        setError('Не удалось загрузить сообщения');
      }
    } catch {
      setError('Проверьте подключение к интернету');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => loadMessages(true), 30000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  return (
    <div className="flex min-h-screen">
      <PaymentsSidebar
        menuOpen={menuOpen}
        dictionariesOpen={dictionariesOpen}
        setDictionariesOpen={setDictionariesOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="lg:ml-[250px] min-h-screen flex-1 overflow-x-hidden max-w-full">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 -ml-2 text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
            >
              <Icon name="Menu" size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Чат</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Сообщения, которые CEO пишет напрямую боту в Битрикс24
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{error}</h3>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Сообщений пока нет</h3>
              <p className="font-medium text-foreground/70">
                Когда CEO напишет что-то боту в Битрикс24, сообщение появится здесь
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {messages.map((msg) => (
                <Card key={msg.id} className="border-border bg-card">
                  <CardContent className="p-4 flex items-start gap-3">
                    <UserAvatar photoUrl={msg.user_photo_url} name={msg.user_full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {msg.user_full_name || msg.user_username || 'Неизвестный пользователь'}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                        {msg.message_text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chat;
