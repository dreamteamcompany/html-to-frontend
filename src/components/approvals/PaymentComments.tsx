import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import UserAvatar from '@/components/ui/user-avatar';

interface Comment {
  id: number;
  payment_id: number;
  user_id: number;
  username: string;
  full_name: string;
  photo_url?: string;
  parent_comment_id: number | null;
  comment_text: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  created_at: string;
  updated_at: string;
  likes_count: number;
  user_liked: boolean;
}

const CHUNK_SIZE = 2 * 1024 * 1024;
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const uploadAttachment = async (file: File, token: string): Promise<{ url: string; name: string }> => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadId = '';
  let fileUrl = '';

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const chunkBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(chunk);
    });

    const res = await fetch(API_ENDPOINTS.uploadFile, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({
        chunk: chunkBase64,
        chunkIndex,
        totalChunks,
        fileName: file.name,
        fileType: file.type,
        folder: 'documents',
        uploadId: uploadId || undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Не удалось загрузить файл');
    }

    const data = await res.json();
    if (data.uploadId) uploadId = data.uploadId;
    if (data.url) fileUrl = data.url;
  }

  if (!fileUrl) throw new Error('Не удалось загрузить файл');
  return { url: fileUrl, name: file.name };
};

interface PaymentCommentsProps {
  paymentId: number;
}

const PaymentComments = ({ paymentId }: PaymentCommentsProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadComments();
  }, [paymentId]);

  const loadComments = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.main}?endpoint=comments&payment_id=${paymentId}`,
        {
          headers: { 'X-Auth-Token': token! },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() && !attachedFile) return;

    setUploading(true);
    try {
      let attachment_url: string | undefined;
      let attachment_name: string | undefined;

      if (attachedFile) {
        const uploaded = await uploadAttachment(attachedFile, token!);
        attachment_url = uploaded.url;
        attachment_name = uploaded.name;
      }

      const response = await fetch(
        `${API_ENDPOINTS.main}?endpoint=comments`,
        {
          method: 'POST',
          headers: {
            'X-Auth-Token': token!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_id: paymentId,
            comment_text: newComment,
            attachment_url,
            attachment_name,
          }),
        }
      );

      if (response.ok) {
        setNewComment('');
        setAttachedFile(null);
        await loadComments();
        toast({
          title: 'Комментарий добавлен',
        });
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Не удалось добавить комментарий',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Файл слишком большой',
        description: 'Максимальный размер файла — 15 МБ',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }
    setAttachedFile(file);
    e.target.value = '';
  };

  const handleReply = async (parentId: number) => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.main}?endpoint=comments`,
        {
          method: 'POST',
          headers: {
            'X-Auth-Token': token!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_id: paymentId,
            comment_text: replyText,
            parent_comment_id: parentId,
          }),
        }
      );

      if (response.ok) {
        setReplyText('');
        setReplyingTo(null);
        await loadComments();
        toast({
          title: 'Ответ добавлен',
        });
      }
    } catch (err) {
      console.error('Failed to reply:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить ответ',
        variant: 'destructive',
      });
    }
  };

  const handleLike = async (commentId: number, isLiked: boolean) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.main}?endpoint=comment-likes`,
        {
          method: isLiked ? 'DELETE' : 'POST',
          headers: {
            'X-Auth-Token': token!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment_id: commentId }),
        }
      );

      if (response.ok) {
        await loadComments();
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const parentComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (parentId: number) => comments.filter(c => c.parent_comment_id === parentId);

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const replies = getReplies(comment.id);

    return (
      <div className={`${isReply ? 'ml-6 sm:ml-12' : ''}`}>
        <div className="flex gap-2 sm:gap-3 group">
          <div className="flex-shrink-0">
            <UserAvatar photoUrl={comment.photo_url} name={comment.full_name || comment.username} size="sm" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-card border border-white/10 rounded-lg p-2 sm:p-3 mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 mb-1">
                <span className="font-medium text-xs sm:text-sm">{comment.full_name || comment.username}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              {comment.comment_text && (
                <p className="text-xs sm:text-sm whitespace-pre-wrap">{comment.comment_text}</p>
              )}
              {comment.attachment_url && (
                <a
                  href={comment.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-primary hover:underline bg-primary/10 rounded-md px-2 py-1.5 w-fit"
                >
                  <Icon name="Paperclip" size={14} />
                  <span className="truncate max-w-[200px]">{comment.attachment_name || 'Файл'}</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <button
                onClick={() => handleLike(comment.id, comment.user_liked)}
                className={`flex items-center gap-1 text-[10px] sm:text-xs transition-colors ${
                  comment.user_liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Icon name={comment.user_liked ? 'Heart' : 'Heart'} size={12} fill={comment.user_liked ? 'currentColor' : 'none'} />
                {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Ответить
                </button>
              )}
            </div>

            {replyingTo === comment.id && (
              <div className="mb-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Напишите ответ..."
                  className="w-full bg-background border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyText.trim()}
                    className="px-2 sm:px-3 py-1 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Отправить
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-2 sm:px-3 py-1 bg-white/5 hover:bg-white/10 text-xs sm:text-sm rounded-lg transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {replies.length > 0 && (
              <div className="space-y-3 mt-3">
                {replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="space-y-3 sm:space-y-4">
          {parentComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Пока нет комментариев. Будьте первым!
            </p>
          ) : (
            parentComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>

      <div className="border-t border-white/10 p-3 sm:p-6">
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 bg-primary/10 rounded-md px-2 py-1.5 w-fit max-w-full">
            <Icon name="Paperclip" size={14} className="text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate max-w-[200px]">{attachedFile.name}</span>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        )}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Напишите комментарий..."
          className="w-full bg-background border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={2}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 text-xs sm:text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Icon name="Paperclip" size={14} />
          </button>
          <button
            onClick={handleAddComment}
            disabled={(!newComment.trim() && !attachedFile) || uploading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
            ) : (
              <Icon name="Send" size={14} />
            )}
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentComments;