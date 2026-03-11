import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import BiometricSetupModal from '@/components/auth/BiometricSetupModal';

interface Credential {
  id: number;
  credential_id: string;
  device_name: string;
  created_at: string;
  last_used_at: string | null;
}

const BiometricSettingsPanel = () => {
  const { token } = useAuth();
  const webAuthn = useWebAuthn();
  const [available, setAvailable] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadCredentials = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const creds = await webAuthn.getCredentials(token);
    setCredentials(creds);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    webAuthn.isPlatformAuthAvailable().then(a => {
      setAvailable(a);
      if (a) loadCredentials();
    });
  }, [loadCredentials]);

  if (!available) return null;

  const handleDelete = async (id: number) => {
    if (!token) return;
    setLoading(true);
    await webAuthn.deleteCredential(token, id);
    await loadCredentials();
    setLoading(false);
  };

  const formatDate = (dt: string | null) => {
    if (!dt) return 'Никогда';
    return new Date(dt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon name="Fingerprint" size={16} />
          <span>Биометрия</span>
          {credentials.length > 0 && (
            <span className="rounded-full bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 font-medium">
              {credentials.length}
            </span>
          )}
        </div>
        <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
      </button>

      {expanded && (
        <div className="mx-2 mb-1 rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Icon name="Loader2" size={16} className="animate-spin text-muted-foreground" />
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Биометрия не подключена</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5 text-xs h-8"
                onClick={() => setShowSetup(true)}
              >
                <Icon name="Plus" size={13} />
                Подключить
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                {credentials.map(c => (
                  <div key={c.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{c.device_name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        Вход: {formatDate(c.last_used_at)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="flex-shrink-0 p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Отключить"
                    >
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5 text-xs h-7 mt-1"
                onClick={() => setShowSetup(true)}
              >
                <Icon name="Plus" size={12} />
                Добавить устройство
              </Button>
            </>
          )}
        </div>
      )}

      {showSetup && token && (
        <BiometricSetupModal
          token={token}
          onClose={() => {
            setShowSetup(false);
            loadCredentials();
          }}
        />
      )}
    </>
  );
};

export default BiometricSettingsPanel;
