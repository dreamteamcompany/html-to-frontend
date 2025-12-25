import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Comment {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  comment: string;
  is_internal: boolean;
  created_at?: string;
}

interface TicketCommentsProps {
  comments: Comment[];
  loadingComments: boolean;
  newComment: string;
  submittingComment: boolean;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  isCustomer: boolean;
  hasAssignee: boolean;
  sendingPing: boolean;
  onSendPing: () => void;
}

const TicketComments = ({
  comments,
  loadingComments,
  newComment,
  submittingComment,
  onCommentChange,
  onSubmitComment,
  isCustomer,
  hasAssignee,
  sendingPing,
  onSendPing,
}: TicketCommentsProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-sm font-semibold mb-4 text-muted-foreground flex items-center gap-2">
        <Icon name="MessageSquare" size={16} />
        Комментарии ({comments.length})
      </h3>

      <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
        {loadingComments ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="MessageSquare" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Пока нет комментариев</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="User" size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-sm">{comment.user_name || 'Пользователь'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {comment.comment}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        {isCustomer && hasAssignee && (
          <Button
            onClick={onSendPing}
            disabled={sendingPing}
            variant="outline"
            className="w-full"
          >
            {sendingPing ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Отправка запроса...
              </>
            ) : (
              <>
                <Icon name="Bell" size={16} className="mr-2" />
                Запросить статус у исполнителя
              </>
            )}
          </Button>
        )}
        
        <Textarea
          placeholder="Добавить комментарий..."
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          disabled={submittingComment}
          className="min-h-[80px]"
        />
        <Button
          onClick={onSubmitComment}
          disabled={!newComment.trim() || submittingComment}
          className="w-full"
        >
          {submittingComment ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Icon name="Send" size={16} className="mr-2" />
              Отправить комментарий
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TicketComments;