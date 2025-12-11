import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  user_count: number;
}

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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

  useEffect(() => {
    setRoles([
      {
        id: 1,
        name: 'Администратор',
        description: 'Полный доступ ко всем функциям системы',
        user_count: 1,
        permissions: [
          { id: 1, name: 'payments.view', resource: 'payments', action: 'view', description: 'Просмотр платежей' },
          { id: 2, name: 'payments.create', resource: 'payments', action: 'create', description: 'Создание платежей' },
          { id: 3, name: 'payments.edit', resource: 'payments', action: 'edit', description: 'Редактирование платежей' },
          { id: 4, name: 'payments.delete', resource: 'payments', action: 'delete', description: 'Удаление платежей' },
          { id: 5, name: 'users.view', resource: 'users', action: 'view', description: 'Просмотр пользователей' },
          { id: 6, name: 'users.create', resource: 'users', action: 'create', description: 'Создание пользователей' },
          { id: 7, name: 'users.edit', resource: 'users', action: 'edit', description: 'Редактирование пользователей' },
          { id: 8, name: 'users.delete', resource: 'users', action: 'delete', description: 'Удаление пользователей' },
          { id: 9, name: 'roles.view', resource: 'roles', action: 'view', description: 'Просмотр ролей' },
          { id: 10, name: 'roles.edit', resource: 'roles', action: 'edit', description: 'Редактирование ролей' },
        ],
      },
      {
        id: 2,
        name: 'Бухгалтер',
        description: 'Управление платежами и справочниками',
        user_count: 0,
        permissions: [
          { id: 1, name: 'payments.view', resource: 'payments', action: 'view', description: 'Просмотр платежей' },
          { id: 2, name: 'payments.create', resource: 'payments', action: 'create', description: 'Создание платежей' },
          { id: 3, name: 'payments.edit', resource: 'payments', action: 'edit', description: 'Редактирование платежей' },
          { id: 11, name: 'categories.view', resource: 'categories', action: 'view', description: 'Просмотр категорий' },
          { id: 12, name: 'categories.edit', resource: 'categories', action: 'edit', description: 'Редактирование категорий' },
        ],
      },
      {
        id: 3,
        name: 'Просмотр',
        description: 'Только просмотр данных без возможности изменения',
        user_count: 0,
        permissions: [
          { id: 1, name: 'payments.view', resource: 'payments', action: 'view', description: 'Просмотр платежей' },
          { id: 11, name: 'categories.view', resource: 'categories', action: 'view', description: 'Просмотр категорий' },
        ],
      },
    ]);
    setLoading(false);
  }, []);

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'payments':
        return 'CreditCard';
      case 'users':
        return 'Users';
      case 'roles':
        return 'Shield';
      case 'categories':
        return 'Tag';
      default:
        return 'Circle';
    }
  };

  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'payments':
        return 'text-blue-500 bg-blue-500/10';
      case 'users':
        return 'text-green-500 bg-green-500/10';
      case 'roles':
        return 'text-purple-500 bg-purple-500/10';
      case 'categories':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
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
              placeholder="Поиск ролей..." 
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

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Права доступа</h1>
          <p className="text-sm md:text-base text-muted-foreground">Роли и разрешения в системе</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card key={role.id} className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">{role.name}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Icon name="Shield" size={24} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                    <Icon name="Users" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {role.user_count} {role.user_count === 1 ? 'пользователь' : 'пользователей'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                      Разрешения ({role.permissions.length})
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {role.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getResourceColor(permission.resource)}`}>
                            <Icon name={getResourceIcon(permission.resource)} size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{permission.description}</div>
                            <div className="text-xs text-muted-foreground truncate">{permission.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Roles;
