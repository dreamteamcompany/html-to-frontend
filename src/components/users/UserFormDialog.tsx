import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface User {
  id: number;
  username: string;
  full_name: string;
  position: string;
  email?: string;
  bitrix_id?: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  photo_url?: string;
  roles: { id: number; name: string }[];
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface UserFormDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  formData: {
    username: string;
    password: string;
    full_name: string;
    position: string;
    email: string;
    bitrix_id: string;
    role_ids: number[];
    photo_url: string;
  };
  setFormData: (data: UserFormDialogProps['formData']) => void;
  roles: Role[];
  handleSubmit: (e: React.FormEvent) => void;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const UserFormDialog = ({
  dialogOpen,
  setDialogOpen,
  editingUser,
  setEditingUser,
  formData,
  setFormData,
  roles,
  handleSubmit,
}: UserFormDialogProps) => {
  const { hasPermission, token } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Ошибка',
        description: 'Файл слишком большой. Максимум 5 МБ',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: 'Ошибка',
        description: 'Допустимые форматы: JPG, PNG, GIF',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
      });

      const uploadResponse = await fetch(API_ENDPOINTS.uploadFile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          chunk: base64Data,
          fileName: file.name,
          fileType: file.type,
          folder: 'avatars',
          chunkIndex: 0,
          totalChunks: 1,
        }),
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        if (data.url) {
          setFormData({ ...formData, photo_url: data.url });
          toast({ title: 'Успешно', description: 'Фото загружено' });
        } else {
          throw new Error('No URL in response');
        }
      } else {
        const errData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
      toast({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Не удалось загрузить фото',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <>
      {hasPermission('users', 'create') && (
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingUser(null);
            setFormData({
              username: '',
              password: '',
              full_name: '',
              position: '',
              email: '',
              bitrix_id: '',
              role_ids: [],
              photo_url: '',
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto">
              <Icon name="UserPlus" size={18} />
              <span>Добавить пользователя</span>
            </Button>
          </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}</DialogTitle>
          <DialogDescription>
            {editingUser ? 'Измените данные пользователя' : 'Создайте нового пользователя системы'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Фото профиля</Label>
            <div className="flex items-center gap-4">
              {formData.photo_url ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/10">
                  <img src={formData.photo_url} alt="Фото профиля" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photo_url: '' })}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Icon name="Trash2" size={20} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center">
                  <Icon name="User" size={32} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {uploading ? 'Загрузка...' : 'JPG, PNG или GIF, до 5 МБ'}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Логин</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Полное имя</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Иван Иванов"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Должность</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Менеджер"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Почта</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@company.ru"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bitrix_id">ID учётки в Битрикс</Label>
            <Input
              id="bitrix_id"
              value={formData.bitrix_id}
              onChange={(e) => setFormData({ ...formData, bitrix_id: e.target.value })}
              placeholder="123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{editingUser ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required={!editingUser}
              minLength={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Роли</Label>
            <div className="space-y-2 border border-white/10 rounded-md p-3 bg-white/5">
              {!roles || roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Загрузка ролей...</p>
              ) : (
                roles.map((role) => (
                  <div key={role.id} className="flex items-start gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      checked={formData.role_ids.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, role_ids: [...formData.role_ids, role.id] });
                        } else {
                          setFormData({ ...formData, role_ids: formData.role_ids.filter(id => id !== role.id) });
                        }
                      }}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1 cursor-pointer" onClick={() => {
                      const checkbox = document.getElementById(`role-${role.id}`) as HTMLInputElement;
                      checkbox?.click();
                    }}>
                      <Label htmlFor={`role-${role.id}`} className="cursor-pointer font-medium">{role.name}</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <Button type="submit" className="w-full">
            {editingUser ? 'Сохранить изменения' : 'Создать пользователя'}
          </Button>
        </form>
      </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default UserFormDialog;