import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { useAuth } from '@/contexts/AuthContext';

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

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role_id: undefined as string | undefined,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      setMenuOpen(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/621b0a81-03f7-4d24-8532-81f40fb3bc2b', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/597de3a8-5db2-4e46-8835-5a37042b00f1?action=me', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const rolesResponse = await fetch('https://functions.poehali.dev/621b0a81-03f7-4d24-8532-81f40fb3bc2b', {
          headers: {
            'X-Auth-Token': token || '',
          },
        });
        
        if (rolesResponse.ok) {
          const data = await rolesResponse.json();
          setRoles([
            { id: 1, name: 'Администратор', description: 'Полный доступ' },
            { id: 2, name: 'Бухгалтер', description: 'Управление платежами' },
            { id: 3, name: 'Просмотр', description: 'Только чтение' },
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://functions.poehali.dev/597de3a8-5db2-4e46-8835-5a37042b00f1?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role_id: formData.role_id ? parseInt(formData.role_id) : null,
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          full_name: '',
          role_id: undefined,
        });
        loadUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при создании пользователя');
      }
    } catch (err) {
      console.error('Failed to create user:', err);
      alert('Ошибка при создании пользователя');
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/621b0a81-03f7-4d24-8532-81f40fb3bc2b?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      if (response.ok) {
        loadUsers();
      }
    } catch (err) {
      console.error('Failed to toggle user status:', err);
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

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-[30px] px-4 md:px-[25px] py-4 md:py-[18px] bg-[#1b254b]/50 backdrop-blur-[20px] rounded-[15px] border border-white/10">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-white"
          >
            <Icon name="Menu" size={24} />
          </button>
          <div className="flex items-center gap-3 bg-card border border-white/10 rounded-[15px] px-4 md:px-5 py-2 md:py-[10px] w-full sm:w-[300px] lg:w-[400px]">
            <Icon name="Search" size={20} className="text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Поиск пользователей..." 
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>
          <div className="flex items-center gap-2 md:gap-3 px-3 md:px-[15px] py-2 md:py-[10px] rounded-[12px] bg-white/5 border border-white/10">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-[10px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-sm md:text-base">
              А
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium">Администратор</div>
              <div className="text-xs text-muted-foreground">Администратор</div>
            </div>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Пользователи</h1>
            <p className="text-sm md:text-base text-muted-foreground">Управление пользователями системы</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto">
                <Icon name="UserPlus" size={18} />
                <span>Добавить пользователя</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Новый пользователь</DialogTitle>
                <DialogDescription>
                  Создайте нового пользователя системы
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
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Роль</Label>
                  <Select
                    value={formData.role_id}
                    onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Создать пользователя
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Нет пользователей. Добавьте первого пользователя.
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Пользователь</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Email</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Роли</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Последний вход</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Статус</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {user.full_name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{user.full_name}</div>
                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">{user.email}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {user.roles.map((role) => (
                                <span key={role.id} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                                  {role.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {user.last_login 
                              ? new Date(user.last_login).toLocaleDateString('ru-RU')
                              : 'Никогда'
                            }
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.is_active 
                                ? 'bg-green-500/10 text-green-500' 
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {user.is_active ? 'Активен' : 'Заблокирован'}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                              className="gap-2"
                            >
                              <Icon name={user.is_active ? 'Ban' : 'Check'} size={16} />
                              {user.is_active ? 'Заблокировать' : 'Активировать'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="md:hidden space-y-3 p-4">
                  {users.map((user) => (
                    <Card key={user.id} className="border-white/10 bg-white/5">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.full_name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_active 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {user.is_active ? 'Активен' : 'Заблокирован'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <span key={role.id} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                              {role.name}
                            </span>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className="w-full gap-2"
                        >
                          <Icon name={user.is_active ? 'Ban' : 'Check'} size={16} />
                          {user.is_active ? 'Заблокировать' : 'Активировать'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Users;
