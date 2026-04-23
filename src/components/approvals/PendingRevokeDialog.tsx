import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface PendingRevokeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment: string;
  onCommentChange: (value: string) => void;
  isRevoking: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const PendingRevokeDialog = ({
  open,
  onOpenChange,
  comment,
  onCommentChange,
  isRevoking,
  onCancel,
  onConfirm,
}: PendingRevokeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={comment}
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
            className="flex-1 bg-orange-600 hover:bg-orange-700"
            disabled={isRevoking || !comment.trim()}
          >
            {isRevoking ? 'Отзыв...' : 'Отозвать'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PendingRevokeDialog;
