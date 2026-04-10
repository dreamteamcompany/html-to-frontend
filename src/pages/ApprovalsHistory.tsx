import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import PaymentApprovalHistoryModal from '@/components/approvals/PaymentApprovalHistoryModal';

interface Approval {
  id: number;
  payment_id: number;
  approver_id: number;
  approver_name: string;
  approver_role: string;
  action: string;
  comment: string;
  created_at: string;
  amount?: number;
  description?: string;
}

const ApprovalsHistory = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<{ payment_id: number; amount?: number; description?: string } | null>(null);

  const {
    menuOpen,
    setMenuOpen,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSidebarTouch();

  const loadApprovals = () => {
    if (!token) return;

    fetch(`${API_ENDPOINTS.main}?endpoint=approvals`, {
      headers: {
        'X-Auth-Token': token,
      },
    })
      .then(res => res.json())
      .then(data => {
        setApprovals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load approvals:', err);
        setApprovals([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadApprovals();
  }, [token]);

  const handleDeleteApproval = async (approvalId: number) => {
    if (!confirm('Удалить эту запись из истории согласований?')) return;
    
    setDeletingId(approvalId);
    try {
      const response = await fetch(`${API_ENDPOINTS.main}?endpoint=approvals&id=${approvalId}`, {
        method: 'DELETE',
        headers: { 'X-Auth-Token': token || '' },
      });

      if (!response.ok) throw new Error('Failed to delete approval');

      setApprovals(approvals.filter(a => a.id !== approvalId));
      toast({
        title: 'Успешно',
        description: 'Запись удалена из истории согласований',
      });
    } catch (err) {
      console.error('Failed to delete approval:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить запись',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'submit':
      case 'submitted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">Отправлен на согласование</span>;
      case 'approve':
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30">Согласован</span>;
      case 'reject':
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30">Отклонён</span>;
      case 'revoke':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30">Отозван</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30">{action}</span>;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'tech_director':
        return 'Технический директор';
      case 'ceo':
        return 'CEO';
      case 'creator':
      case 'submitter':
        return 'Инициатор';
      case 'intermediate_approver':
        return 'Согласующий';
      case 'final_approver':
        return 'Финальный согласующий';
      case 'admin':
        return 'Администратор';
      default:
        return role;
    }
  };

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

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1 overflow-x-hidden max-w-full">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors mb-4"
        >
          <Icon name="Menu" size={24} />
        </button>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">История согласований</h1>
          <p className="text-sm md:text-base text-muted-foreground">Все действия по согласованию платежей</p>
        </div>

        <Card className="border border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] dark:border-white/5">
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Загрузка...</div>
            ) : approvals.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Пока нет истории согласований
              </div>
            ) : (
              <div className="space-y-3">
                {approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className="rounded-xl p-4 cursor-pointer group transition-all
                      border border-border bg-background shadow-sm
                      hover:border-primary/30 hover:shadow-md hover:bg-accent/30
                      dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:shadow-none"
                    onClick={() => setSelectedPayment({ payment_id: approval.payment_id, amount: approval.amount, description: approval.description })}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                            <Icon name="FileCheck" size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                              <span className="whitespace-nowrap">Платёж #{approval.payment_id}</span>
                              {approval.amount && (
                                <span className="font-bold text-foreground whitespace-nowrap">
                                  — {approval.amount.toLocaleString('ru-RU')} ₽
                                </span>
                              )}
                              <Icon name="ChevronRight" size={14} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                            </div>
                            {approval.description && (
                              <div className="text-sm text-muted-foreground mt-0.5 overflow-hidden"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {approval.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <div className="flex items-start gap-1.5 min-w-0">
                            <Icon name="User" size={13} className="text-muted-foreground/60 flex-shrink-0 mt-1" />
                            <span className="text-muted-foreground break-anywhere">{approval.approver_name}</span>
                            <span className="text-muted-foreground/60 text-xs whitespace-nowrap">({getRoleName(approval.approver_role)})</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Icon name="Clock" size={13} className="text-muted-foreground/60" />
                            <span className="text-muted-foreground text-xs whitespace-nowrap">
                              {new Date(approval.created_at).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                        {approval.comment && (
                          <div className="mt-2 p-2 bg-muted/50 rounded-lg text-sm border border-border/50">
                            <span className="text-muted-foreground/70 text-xs">Комментарий: </span>
                            <span className="text-foreground/80">{approval.comment}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
                        <div className="flex-shrink-0">{getActionBadge(approval.action)}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDeleteApproval(approval.id); }}
                          disabled={deletingId === approval.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 flex-shrink-0"
                        >
                          {deletingId === approval.id ? (
                            <Icon name="Loader2" size={16} className="animate-spin" />
                          ) : (
                            <Icon name="Trash2" size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <PaymentApprovalHistoryModal
        paymentInfo={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  );
};

export default ApprovalsHistory;