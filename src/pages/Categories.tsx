import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  id: number;
  name: string;
  icon: string;
  created_at?: string;
}

const availableIcons = [
  'Server', 'MessageSquare', 'Globe', 'Shield', 'Tag', 'Briefcase', 
  'DollarSign', 'TrendingUp', 'ShoppingCart', 'Zap', 'Coffee', 'Wifi'
];

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Tag',
  });
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadCategories = () => {
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=categories')
      .then(res => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = 'https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory 
        ? { id: editingCategory.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', icon: 'Tag' });
        loadCategories();
      }
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, icon: category.icon });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=categories&id=${id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        loadCategories();
      } else {
        const data = await response.json();
        alert(data.error || 'Не удалось удалить категорию');
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCategory(null);
      setFormData({ name: '', icon: 'Tag' });
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className={`w-[250px] bg-[#1b254b] border-r border-white/10 fixed left-0 top-0 h-screen z-50 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <a href="/" className="flex items-center gap-3 px-5 py-5 pb-[30px] border-b border-white/10">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center font-bold text-white">
            V
          </div>
          <span className="text-white font-semibold">Vision UI</span>
        </a>
        <ul className="px-[15px] py-5 space-y-1">
          <li>
            <a href="/" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Icon name="Home" size={20} />
              <span>Дашборд</span>
            </a>
          </li>
          <li>
            <a href="/payments" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Icon name="CreditCard" size={20} />
              <span>Платежи</span>
            </a>
          </li>
          <li>
            <button 
              onClick={() => setDictionariesOpen(!dictionariesOpen)}
              className="w-full flex items-center justify-between px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon name="BookOpen" size={20} />
                <span>Справочники</span>
              </div>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className={`transition-transform ${dictionariesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {dictionariesOpen && (
              <div className="mt-1 space-y-1">
                <a 
                  href="#" 
                  className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground/60 cursor-not-allowed"
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon name="Building2" size={18} />
                  <span>Компании</span>
                </a>
                <a 
                  href="/categories" 
                  className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg bg-primary/20 text-primary"
                >
                  <Icon name="Tag" size={18} />
                  <span>Категории платежей</span>
                </a>
              </div>
            )}
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Icon name="Box" size={20} />
              <span>Сервисы</span>
            </a>
          </li>
        </ul>
      </aside>

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
              placeholder="Поиск категорий..." 
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

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Категории платежей</h1>
            <p className="text-muted-foreground">Управление категориями для классификации расходов</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Icon name="Plus" size={18} />
                Добавить категорию
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Редактировать категорию' : 'Новая категория'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? 'Измените данные категории' 
                    : 'Добавьте новую категорию платежей'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Название категории"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Иконка</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableIcons.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            <Icon name={icon} size={16} />
                            {icon}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingCategory ? 'Сохранить' : 'Добавить'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Загрузка...</div>
            ) : categories.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Нет категорий. Добавьте первую категорию для начала работы.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Icon name={category.icon} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="flex-1"
                      >
                        <Icon name="Edit" size={14} className="mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Categories;