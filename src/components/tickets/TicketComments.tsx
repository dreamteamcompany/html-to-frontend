import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef } from 'react';

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

interface TicketCommentsProps {
  comments: Comment[];
  loadingComments: boolean;
  newComment: string;
  submittingComment: boolean;
  onCommentChange: (value: string) => void;
  onSubmitComment: (files?: File[]) => void;
  isCustomer: boolean;
  hasAssignee: boolean;
  sendingPing: boolean;
  onSendPing: () => void;
  currentUserId?: number;
  onReaction?: (commentId: number, emoji: string) => void;
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
  currentUserId,
  onReaction,
}: TicketCommentsProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const emojis = ['👍', '❤️', '😊', '🎉', '🚀', '👀', '✅', '❌'];
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
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = () => {
    onSubmitComment(selectedFiles.length > 0 ? selectedFiles : undefined);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon name="MessageSquare" size={18} className="text-muted-foreground" />
        <h3 className="text-base font-semibold">Комментарии</h3>
        <span className="text-sm text-muted-foreground">({comments.length})</span>
      </div>

      <div className="space-y-3 mb-6">
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
            <div key={comment.id} className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="User" size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="font-semibold text-sm">{comment.user_name || 'Пользователь'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
                    {comment.comment}
                  </p>
                  
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {comment.attachments.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded bg-background/50 hover:bg-background transition-colors group"
                        >
                          <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                          <span className="text-xs flex-1 group-hover:text-primary transition-colors">{file.filename}</span>
                          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center gap-2">
                    {comment.reactions && comment.reactions.length > 0 && (
                      <div className="flex gap-1">
                        {comment.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            onClick={() => onReaction?.(comment.id, reaction.emoji)}
                            className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-all hover:scale-110 ${
                              currentUserId && reaction.users.includes(currentUserId)
                                ? 'bg-primary/20 ring-1 ring-primary/50'
                                : 'bg-muted hover:bg-muted/70'
                            }`}
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-[10px] text-muted-foreground">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                        className="p-1 rounded hover:bg-muted transition-colors"
                        title="Добавить реакцию"
                      >
                        <Icon name="Smile" size={14} className="text-muted-foreground" />
                      </button>
                      
                      {showEmojiPicker === comment.id && (
                        <div className="absolute left-0 top-full mt-1 p-2 bg-popover border rounded-lg shadow-lg z-10 flex gap-1">
                          {emojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                onReaction?.(comment.id, emoji);
                                setShowEmojiPicker(null);
                              }}
                              className="p-1 hover:bg-muted rounded transition-colors text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 pt-4 border-t">
        {isCustomer && hasAssignee && (
          <Button
            onClick={onSendPing}
            disabled={sendingPing}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {sendingPing ? (
              <>
                <Icon name="Loader2" size={14} className="mr-2 animate-spin" />
                Отправка запроса...
              </>
            ) : (
              <>
                <Icon name="Bell" size={14} className="mr-2" />
                Запросить статус
              </>
            )}
          </Button>
        )}
        
        <Textarea
          placeholder="Напишите комментарий..."
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          disabled={submittingComment}
          className="min-h-[90px] resize-none"
        />
        
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50 border">
                <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                <span className="text-xs flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                >
                  <Icon name="X" size={12} className="text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="comment-file-input"
        />
        
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={submittingComment}
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
          >
            <Icon name="Paperclip" size={16} className="mr-1" />
            Файлы
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || submittingComment}
            size="sm"
            className="flex-1"
          >
            {submittingComment ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" size={16} className="mr-2" />
                Отправить
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketComments;