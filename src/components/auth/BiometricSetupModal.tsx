import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useWebAuthn } from '@/hooks/useWebAuthn';

interface BiometricSetupModalProps {
  token: string;
  onClose: () => void;
}

const BiometricSetupModal = ({ token, onClose }: BiometricSetupModalProps) => {
  const [open, setOpen] = useState(true);
  const [available, setAvailable] = useState(false);
  const [done, setDone] = useState(false);
  const webAuthn = useWebAuthn();

  useEffect(() => {
    webAuthn.isPlatformAuthAvailable().then(setAvailable);
  }, []);

  const handleEnable = async () => {
    const ok = await webAuthn.register(token);
    if (ok) setDone(true);
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  if (!available) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Icon name="Fingerprint" size={28} className="text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {done ? 'Биометрия подключена!' : 'Быстрый вход'}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {done
              ? 'Теперь вы можете входить через Face ID или биометрию, без ввода пароля.'
              : 'Включите вход через Face ID, Touch ID или биометрию устройства — быстро и безопасно.'}
          </DialogDescription>
        </DialogHeader>

        {webAuthn.error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-500 text-sm text-center">
            {webAuthn.error}
          </div>
        )}

        <div className="flex flex-col gap-2 mt-2">
          {done ? (
            <Button onClick={handleClose} className="w-full gap-2">
              <Icon name="Check" size={16} />
              Готово
            </Button>
          ) : (
            <>
              <Button
                onClick={handleEnable}
                disabled={webAuthn.loading}
                className="w-full gap-2"
              >
                {webAuthn.loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Настройка...
                  </>
                ) : (
                  <>
                    <Icon name="Fingerprint" size={16} />
                    Включить биометрию
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={handleClose} className="w-full text-muted-foreground">
                Не сейчас
              </Button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-1">
          Биометрические данные хранятся только на вашем устройстве
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default BiometricSetupModal;
