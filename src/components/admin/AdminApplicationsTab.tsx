import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import ApplicationCard from "./ApplicationCard";
import ApplicationEditModal from "./ApplicationEditModal";
import ApplicationManualModal from "./ApplicationManualModal";

interface Contest {
  id?: number;
  title: string;
}

interface Application {
  id: number;
  full_name: string;
  age: number;
  teacher: string | null;
  institution: string | null;
  work_title: string;
  email: string;
  contest_id: number | null;
  contest_name: string;
  work_file_url: string;
  status: 'new' | 'viewed' | 'sent';
  result: 'grand_prix' | 'first_degree' | 'second_degree' | 'third_degree' | 'participant' | null;
  gallery_consent: boolean;
  diploma_issued_at: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface AdminApplicationsTabProps {
  contests: Contest[];
  applications: Application[];
  deletedApplications: Application[];
  applicationsSubTab: 'active' | 'archive' | 'trash';
  setApplicationsSubTab: (v: 'active' | 'archive' | 'trash') => void;
  applicationsWithResults: Set<number>;
  isAppModalOpen: boolean;
  setIsAppModalOpen: (v: boolean) => void;
  editingApplication: Application | null;
  setEditingApplication: (v: Application | null) => void;
  appResult: string | undefined;
  setAppResult: (v: string | undefined) => void;
  appStatus: 'new' | 'viewed' | 'sent';
  setAppStatus: (v: 'new' | 'viewed' | 'sent') => void;
  isWorkPreviewOpen: boolean;
  setIsWorkPreviewOpen: (v: boolean) => void;
  workPreview: string | null;
  setWorkPreview: (v: string | null) => void;
  isManualAppModalOpen: boolean;
  setIsManualAppModalOpen: (v: boolean) => void;
  manualAppFile: File | null;
  setManualAppFile: (v: File | null) => void;
  manualContestName: string;
  setManualContestName: (v: string) => void;
  submittingManualApp: boolean;
  manualAppUploadProgress: number;
  handleCreateResultFromApplication: (app: Application) => void;
  handleDeleteApplication: (id: number) => void;
  handlePermanentDeleteApplication: (id: number) => void;
  handleRestoreApplication: (id: number) => void;
  handleManualAppSubmit: (e: React.FormEvent) => void;
  loadApplications: () => void;
  loadDeletedApplications: () => void;
  APPLICATIONS_API_URL: string;
  UPLOAD_URL: string;
  toast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

const AdminApplicationsTab = ({
  contests,
  applications,
  deletedApplications,
  applicationsSubTab,
  setApplicationsSubTab,
  applicationsWithResults,
  isAppModalOpen,
  setIsAppModalOpen,
  editingApplication,
  setEditingApplication,
  appResult,
  setAppResult,
  appStatus,
  setAppStatus,
  isWorkPreviewOpen,
  setIsWorkPreviewOpen,
  workPreview,
  setWorkPreview,
  isManualAppModalOpen,
  setIsManualAppModalOpen,
  manualAppFile,
  setManualAppFile,
  manualContestName,
  setManualContestName,
  submittingManualApp,
  manualAppUploadProgress,
  handleCreateResultFromApplication,
  handleDeleteApplication,
  handlePermanentDeleteApplication,
  handleRestoreApplication,
  handleManualAppSubmit,
  loadApplications,
  loadDeletedApplications,
  APPLICATIONS_API_URL,
  UPLOAD_URL,
  toast,
}: AdminApplicationsTabProps) => {
  const handlePreview = (url: string) => {
    setWorkPreview(url);
    setIsWorkPreviewOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-heading font-bold text-primary">Заявки на участие</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { loadApplications(); loadDeletedApplications(); }}
            className="rounded-xl"
          >
            <Icon name="RefreshCw" className="mr-2" size={16} />
            Обновить
          </Button>
          <Button
            onClick={() => { setManualAppFile(null); setManualContestName(""); setIsManualAppModalOpen(true); }}
            className="rounded-xl bg-primary hover:bg-primary/90"
          >
            <Icon name="Plus" className="mr-2" size={16} />
            Добавить заявку
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={applicationsSubTab === 'active' ? 'default' : 'outline'}
          onClick={() => setApplicationsSubTab('active')}
          className="rounded-xl"
        >
          <Icon name="FileText" className="mr-2" size={16} />
          Активные ({applications.filter(a => !applicationsWithResults.has(a.id)).length})
        </Button>
        <Button
          variant={applicationsSubTab === 'archive' ? 'default' : 'outline'}
          onClick={() => setApplicationsSubTab('archive')}
          className="rounded-xl"
        >
          <Icon name="Archive" className="mr-2" size={16} />
          Архив ({applications.filter(a => applicationsWithResults.has(a.id)).length})
        </Button>
        <Button
          variant={applicationsSubTab === 'trash' ? 'default' : 'outline'}
          onClick={() => setApplicationsSubTab('trash')}
          className="rounded-xl"
        >
          <Icon name="Trash2" className="mr-2" size={16} />
          Корзина ({deletedApplications.length})
        </Button>
      </div>

      {applicationsSubTab === 'active' && (
        <div className="grid gap-4">
          {applications.filter(app => !applicationsWithResults.has(app.id)).map((app) => (
            <ApplicationCard
              key={`app-${app.id}`}
              mode="active"
              app={app}
              hasResult={applicationsWithResults.has(app.id)}
              onCreateResult={handleCreateResultFromApplication}
              onEdit={(a) => {
                setEditingApplication(a);
                setAppStatus(a.status);
                setAppResult(a.result || undefined);
                setIsAppModalOpen(true);
              }}
              onDelete={handleDeleteApplication}
              onPreview={handlePreview}
            />
          ))}
        </div>
      )}

      {applicationsSubTab === 'archive' && (
        <div className="grid gap-4">
          {applications.filter(app => applicationsWithResults.has(app.id)).length === 0 ? (
            <Card className="rounded-2xl p-8 text-center">
              <Icon name="Archive" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Архив пуст</p>
              <p className="text-sm text-muted-foreground mt-2">Сюда попадают заявки, по которым опубликованы итоги</p>
            </Card>
          ) : (
            applications.filter(app => applicationsWithResults.has(app.id)).map((app) => (
              <ApplicationCard
                key={`arch-${app.id}`}
                mode="archive"
                app={app}
                onPreview={handlePreview}
              />
            ))
          )}
        </div>
      )}

      {applicationsSubTab === 'trash' && (
        <div className="grid gap-4">
          {deletedApplications.length === 0 ? (
            <Card className="rounded-2xl p-8 text-center">
              <Icon name="Trash2" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Корзина пуста</p>
            </Card>
          ) : (
            deletedApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                mode="trash"
                app={app}
                onRestore={handleRestoreApplication}
                onPermanentDelete={handlePermanentDeleteApplication}
              />
            ))
          )}
        </div>
      )}

      <ApplicationEditModal
        isOpen={isAppModalOpen}
        setIsOpen={setIsAppModalOpen}
        editingApplication={editingApplication}
        appResult={appResult}
        setAppResult={setAppResult}
        appStatus={appStatus}
        setAppStatus={setAppStatus}
        onPreview={handlePreview}
        loadApplications={loadApplications}
        APPLICATIONS_API_URL={APPLICATIONS_API_URL}
        UPLOAD_URL={UPLOAD_URL}
        toast={toast}
      />

      {/* Модал просмотра работы */}
      <Dialog open={isWorkPreviewOpen} onOpenChange={setIsWorkPreviewOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden rounded-3xl">
          <div className="relative w-full h-full flex items-center justify-center bg-black/95">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
              onClick={() => setIsWorkPreviewOpen(false)}
            >
              <Icon name="X" size={24} />
            </Button>
            {workPreview && (
              <>
                {workPreview.toLowerCase().includes('.pdf') ? (
                  <iframe src={workPreview} className="w-full h-[85vh]" title="Работа участника" />
                ) : (
                  <img
                    src={workPreview}
                    alt="Работа участника"
                    className="max-w-full max-h-[85vh] object-contain"
                  />
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ApplicationManualModal
        isOpen={isManualAppModalOpen}
        setIsOpen={setIsManualAppModalOpen}
        contests={contests}
        manualAppFile={manualAppFile}
        setManualAppFile={setManualAppFile}
        manualContestName={manualContestName}
        setManualContestName={setManualContestName}
        submittingManualApp={submittingManualApp}
        manualAppUploadProgress={manualAppUploadProgress}
        handleManualAppSubmit={handleManualAppSubmit}
        toast={toast}
      />
    </div>
  );
};

export default AdminApplicationsTab;
