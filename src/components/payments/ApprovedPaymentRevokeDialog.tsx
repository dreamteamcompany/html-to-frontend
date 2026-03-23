import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ApprovedPaymentRevokeDialogProps {
  open: boolean;
  isRevoking: boolean;
  revokeComment: string;
  onCommentChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ApprovedPaymentRevokeDialog = ({
  open,
  isRevoking,
  revokeComment,
  onCommentChange,
  onConfirm,
  onCancel,
}: ApprovedPaymentRevokeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Отзыв платежа</DialogTitle>
          <DialogDescription>
            Платёж будет возвращён в черновики. Укажите причину отзыва.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Причина отзыва <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={revokeComment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Укажите причину отзыва платежа..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isRevoking}
          >
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            variant="destructive"
            className="flex-1"
            disabled={isRevoking || !revokeComment.trim()}
          >
            {isRevoking ? 'Отзываем...' : 'Отозвать'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovedPaymentRevokeDialog;
