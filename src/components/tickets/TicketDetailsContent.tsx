import Icon from '@/components/ui/icon';
import TicketComments from '@/components/tickets/TicketComments';

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  value: string;
}

interface Ticket {
  id: number;
  title: string;
  description?: string;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  priority_id?: number;
  priority_name?: string;
  priority_color?: string;
  status_id?: number;
  status_name?: string;
  status_color?: string;
  department_id?: number;
  department_name?: string;
  created_by: number;
  creator_name?: string;
  creator_email?: string;
  assigned_to?: number;
  assignee_name?: string;
  assignee_email?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  closed_at?: string;
  custom_fields?: CustomField[];
}

interface Comment {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  comment: string;
  is_internal: boolean;
  created_at?: string;
  attachments?: {
    id: number;
    filename: string;
    url: string;
    size: number;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    users: number[];
  }[];
}

interface TicketDetailsContentProps {
  ticket: Ticket;
  comments: Comment[];
  loadingComments: boolean;
  newComment: string;
  submittingComment: boolean;
  sendingPing: boolean;
  userId?: number;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  onSendPing: () => void;
  onReaction: (commentId: number, emoji: string) => void;
}

const TicketDetailsContent = ({
  ticket,
  comments,
  loadingComments,
  newComment,
  submittingComment,
  sendingPing,
  userId,
  onCommentChange,
  onSubmitComment,
  onSendPing,
  onReaction,
}: TicketDetailsContentProps) => {
  return (
    <div className="flex-1 p-6">
      {/* Суть заявки */}
      <div className="mb-6 border rounded-lg p-5 bg-card">
        <button className="flex items-center gap-2 text-sm font-semibold mb-4 w-full">
          <Icon name="ChevronDown" size={16} />
          Суть заявки
        </button>
        
        <div className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Тема:</span>
            <p className="text-sm font-medium">{ticket.title}</p>
          </div>
          
          {ticket.description && (
            <div>
              <span className="text-sm text-muted-foreground">Описание:</span>
              <p className="text-sm whitespace-pre-wrap leading-relaxed mt-1">{ticket.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Комментарии и Файлы (вкладки) */}
      <div className="border-b mb-4">
        <div className="flex gap-6">
          <button className="pb-2 border-b-2 border-primary text-sm font-medium">
            Комментарии ({comments.length})
          </button>
          <button className="pb-2 border-b-2 border-transparent text-sm text-muted-foreground hover:text-foreground">
            Файлы (0)
          </button>
        </div>
      </div>

      {/* Форма комментария */}
      <div className="mb-6">
        <TicketComments
          comments={comments}
          loadingComments={loadingComments}
          newComment={newComment}
          submittingComment={submittingComment}
          onCommentChange={onCommentChange}
          onSubmitComment={onSubmitComment}
          isCustomer={ticket.created_by === userId}
          hasAssignee={!!ticket.assigned_to}
          sendingPing={sendingPing}
          onSendPing={onSendPing}
          currentUserId={userId}
          onReaction={onReaction}
        />
      </div>
    </div>
  );
};

export default TicketDetailsContent;
