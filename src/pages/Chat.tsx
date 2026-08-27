import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import UserAvatar from '@/components/ui/user-avatar';

interface ChatMessage {
  id: number;
  bitrix_user_id: string;
  user_id: number;
  message_text: string;
  created_at: string;
  direction: 'user' | 'bot';
  user_full_name?: string;
  user_username?: string;
  user_photo_url?: string;
}

interface ChatThread {
  userId: number;
  name: string;
  photoUrl?: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage;
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

const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const Chat = () => {
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openThreadUserId, setOpenThreadUserId] = useState<number | null>(null);

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
      const res = await apiFetch(`${API_ENDPOINTS.approvalsApi}?endpoint=chat-messages&limit=500`);
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

  const threads = useMemo<ChatThread[]>(() => {
    const map = new Map<number, ChatMessage[]>();
    messages.forEach((msg) => {
      const arr = map.get(msg.user_id) || [];
      arr.push(msg);
      map.set(msg.user_id, arr);
    });

    const result: ChatThread[] = [];
    map.forEach((msgs, userId) => {
      const sorted = [...msgs].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const last = sorted[sorted.length - 1];
      result.push({
        userId,
        name: last.user_full_name || last.user_username || `Пользователь #${userId}`,
        photoUrl: last.user_photo_url,
        messages: sorted,
        lastMessage: last,
      });
    });

    return result.sort(
      (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  }, [messages]);

  const openThread = threads.find((t) => t.userId === openThreadUserId) || null;

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
                Сообщения, которые пишут напрямую боту в Битрикс24
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
          ) : threads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Сообщений пока нет</h3>
              <p className="font-medium text-foreground/70">
                Когда кто-то напишет боту в Битрикс24, переписка появится здесь
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {threads.map((thread) => (
                <Card
                  key={thread.userId}
                  className="border-border bg-card hover:border-primary/40 transition-all cursor-pointer"
                  onClick={() => setOpenThreadUserId(thread.userId)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <UserAvatar photoUrl={thread.photoUrl} name={thread.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-foreground">{thread.name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(thread.lastMessage.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/70 truncate">
                        {thread.lastMessage.message_text}
                      </p>
                      {thread.messages.length > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Сообщений: {thread.messages.length}
                        </p>
                      )}
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground flex-shrink-0 mt-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!openThread} onOpenChange={(open) => !open && setOpenThreadUserId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <UserAvatar photoUrl={openThread?.photoUrl} name={openThread?.name} size="sm" />
              {openThread?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1">
            {openThread?.messages.map((msg, idx) => {
              const prevDate = idx > 0 ? formatShortDate(openThread.messages[idx - 1].created_at) : null;
              const currDate = formatShortDate(msg.created_at);
              const showDateSeparator = currDate !== prevDate;
              const isBot = msg.direction === 'bot';
              return (
                <div key={msg.id}>
                  {showDateSeparator && (
                    <div className="text-center text-xs text-muted-foreground my-3">{currDate}</div>
                  )}
                  <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 ${isBot ? 'bg-primary/10' : 'bg-muted/50'}`}>
                      {isBot && (
                        <p className="text-xs font-medium text-primary mb-1">Бот</p>
                      )}
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {msg.message_text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;