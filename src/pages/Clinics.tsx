import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import { useCrudPage } from '@/hooks/useCrudPage';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Clinic {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

const Clinics = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);

  const {
    menuOpen,
    setMenuOpen,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSidebarTouch();

  const {
    items: clinics,
    loading,
    dialogOpen,
    setDialogOpen,
    editingItem: editingClinic,
    formData,
    setFormData,
    loadData: loadClinics,
    handleEdit,
    handleSubmit,
    handleDelete: handleDeleteBase,
  } = useCrudPage<Clinic>({
    endpoint: 'clinics',
    initialFormData: {
      name: '',
      description: '',
      is_active: true,
    },
  });

  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  const handleDeleteClick = (clinic: Clinic) => {
    setClinicToDelete(clinic);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!clinicToDelete) return;
    try {
      await handleDeleteBase(clinicToDelete.id);
      setDeleteDialogOpen(false);
      setClinicToDelete(null);
    } catch (error) {
      console.error('Failed to delete clinic:', error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setFormData({ name: '', description: '', is_active: true });
  };

  return (
    <div className="min-h-screen bg-background">
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

      <div className="lg:ml-[250px] p-4 md:p-8 overflow-x-hidden max-w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-foreground p-2 hover:bg-accent rounded-lg"
            >
              <Icon name="Menu" size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Клиники</h1>
              <p className="text-muted-foreground mt-1">Отдельный портал по каждой клинике</p>
            </div>
          </div>
          {hasPermission('clinics', 'create') && (
            <Button onClick={() => setDialogOpen(true)}>
              <Icon name="Plus" size={18} />
              Добавить клинику
            </Button>
          )}

          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingClinic ? 'Редактировать клинику' : 'Новая клиника'}
                </DialogTitle>
                <DialogDescription>
                  {editingClinic
                    ? 'Измените информацию о клинике'
                    : 'Создайте новую клинику'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название клиники</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Клиника на Ленина"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание клиники"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Отмена
                  </Button>
                  <Button type="submit">
                    {editingClinic ? 'Сохранить' : 'Создать'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={32} className="text-primary animate-spin" />
          </div>
        ) : clinics.length === 0 ? (
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icon name="Hospital" size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">Нет клиник</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinics.map((clinic) => (
              <Card key={clinic.id} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Icon name="Hospital" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{clinic.name}</h3>
                      {clinic.description && (
                        <p className="text-sm text-muted-foreground mt-1">{clinic.description}</p>
                      )}
                    </div>
                  </div>

                  {hasPermission('clinics', 'dashboard') && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/clinics/${clinic.id}/dashboard`)}
                      className="w-full mb-2"
                    >
                      <Icon name="LogIn" size={16} />
                      Войти в портал
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(clinic)}
                      className="flex-1"
                    >
                      <Icon name="Edit" size={16} />
                      Изменить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(clinic)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить клинику?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить клинику "{clinicToDelete?.name}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clinics;
