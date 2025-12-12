import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
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
    email: string;
    password: string;
    full_name: string;
    role_ids: number[];
  };
  setFormData: (data: any) => void;
  roles: Role[];
  handleSubmit: (e: React.FormEvent) => void;
}

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
  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => {
      setDialogOpen(open);
      if (!open) {
        setEditingUser(null);
        setFormData({
          username: '',
          email: '',
          password: '',
          full_name: '',
          role_ids: [],
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
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
  );
};

export default UserFormDialog;