import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import AdminContestsTab from "@/components/admin/AdminContestsTab";
import AdminApplicationsTab from "@/components/admin/AdminApplicationsTab";
import AdminResultsAndReviewsTab from "@/components/admin/AdminResultsAndReviewsTab";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminNavbar, { AdminTabs } from "@/components/admin/AdminNavbar";
import AdminCertificatesTab from "@/components/admin/AdminCertificatesTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";

interface Contest {
  id?: number;
  title: string;
  description: string;
  categoryId: string;
  deadline: string;
  price: number;
  status: string;
  rulesLink: string;
  diplomaImage: string;
  image: string;
  isPopular?: boolean;
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

interface Result {
  id: number;
  application_id: number | null;
  full_name: string;
  age: number | null;
  teacher: string | null;
  institution: string | null;
  work_title: string | null;
  email: string | null;
  contest_id: number | null;
  contest_name: string | null;
  work_file_url: string | null;
  result: string | null;
  place: number | null;
  score: number | null;
  diploma_url: string | null;
  notes: string | null;
  gallery_consent: boolean;
  diploma_issued_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Review {
  id: number;
  author_name: string;
  author_role: string | null;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";
const RESULTS_API_URL = "https://functions.poehali.dev/e1f9698c-ec8a-4b24-89c2-72bb579d7f9b";
const APPLICATIONS_API_URL = "https://functions.poehali.dev/ff2c7334-750b-418e-8468-152fae1d68ef";
const SUBMIT_APPLICATION_URL = "https://functions.poehali.dev/2d352955-9c6c-4bbb-ad1e-944c7ea04d84";
const REVIEWS_API_URL = "https://functions.poehali.dev/3daafc39-174c-4669-8e8a-71172a246929";
const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
const CERTIFICATES_LOG_URL = "https://functions.poehali.dev/15416f51-5386-4500-b770-4dea40b824e5";

const Admin = () => {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<'contests' | 'applications' | 'results' | 'reviews' | 'certificates' | 'settings'>('contests');
  const [certificatesLog, setCertificatesLog] = useState<{id: number; result_id: number; full_name: string; contest_name: string; issued_at: string}[]>([]);
  const [certLoading, setCertLoading] = useState(false);
  const [applicationsSubTab, setApplicationsSubTab] = useState<'active' | 'archive' | 'trash'>('active');
  const [contests, setContests] = useState<Contest[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deletedApplications, setDeletedApplications] = useState<Application[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [applicationsWithResults, setApplicationsWithResults] = useState<Set<number>>(new Set());
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [resultFilters, setResultFilters] = useState({
    contest_name: '',
    full_name: '',
    result: 'all',
    date: undefined as Date | undefined
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [appStatus, setAppStatus] = useState<'new' | 'viewed' | 'sent'>('new');
  const [appResult, setAppResult] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'viewed' | 'sent'>('all');
  const [workPreview, setWorkPreview] = useState<string | null>(null);
  const [isWorkPreviewOpen, setIsWorkPreviewOpen] = useState(false);
  const [formData, setFormData] = useState<Contest>({
    title: "",
    description: "",
    categoryId: "visual-arts",
    deadline: "",
    price: 200,
    status: "active",
    rulesLink: "#",
    diplomaImage: "",
    image: ""
  });
  const [uploadingRules, setUploadingRules] = useState(false);
  const [uploadingDiploma, setUploadingDiploma] = useState(false);
  const [uploadingAppForm, setUploadingAppForm] = useState(false);
  const [applicationFormUrl, setApplicationFormUrl] = useState<string>('');
  const [isManualAppModalOpen, setIsManualAppModalOpen] = useState(false);
  const [manualAppFile, setManualAppFile] = useState<File | null>(null);
  const [manualContestName, setManualContestName] = useState("");
  const [submittingManualApp, setSubmittingManualApp] = useState(false);
  const [manualAppUploadProgress, setManualAppUploadProgress] = useState(0);
  const { toast } = useToast();

  const loadContests = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setContests(data);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить конкурсы", variant: "destructive" });
    }
  };

  const loadApplications = async () => {
    try {
      const response = await fetch(APPLICATIONS_API_URL);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить заявки", variant: "destructive" });
    }
  };

  const loadDeletedApplications = async () => {
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?deleted=true`);
      const data = await response.json();
      setDeletedApplications(data);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить корзину", variant: "destructive" });
    }
  };

  const loadResults = async () => {
    try {
      const response = await fetch(RESULTS_API_URL);
      const data = await response.json();
      setResults(data);
      const appIds = new Set(data.filter((r: Result) => r.application_id).map((r: Result) => r.application_id));
      setApplicationsWithResults(appIds);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить результаты", variant: "destructive" });
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`${REVIEWS_API_URL}?status=all`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить отзывы", variant: "destructive" });
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(SETTINGS_API_URL);
      const data = await response.json();
      if (data.application_form_url) {
        setApplicationFormUrl(data.application_form_url);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadContests();
      loadApplications();
      loadDeletedApplications();
      loadResults();
      loadReviews();
      loadSettings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = [...results];
    if (resultFilters.contest_name) {
      filtered = filtered.filter(r =>
        r.contest_name?.toLowerCase().includes(resultFilters.contest_name.toLowerCase())
      );
    }
    if (resultFilters.full_name) {
      filtered = filtered.filter(r =>
        r.full_name?.toLowerCase().includes(resultFilters.full_name.toLowerCase())
      );
    }
    if (resultFilters.result !== 'all') {
      filtered = filtered.filter(r => r.result === resultFilters.result);
    }
    if (resultFilters.date) {
      filtered = filtered.filter(r => {
        if (!r.created_at) return false;
        const resultDate = new Date(r.created_at);
        const filterDate = new Date(resultFilters.date!);
        return resultDate.toDateString() === filterDate.toDateString();
      });
    }
    setFilteredResults(filtered);
  }, [results, resultFilters]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      toast({ title: "Вход выполнен", description: "Добро пожаловать в админ-панель!" });
    } else {
      toast({ title: "Ошибка входа", description: "Неверный логин или пароль", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLogin("");
    setPassword("");
    toast({ title: "Выход выполнен", description: "Вы вышли из админ-панели" });
  };

  const handleCreateContest = () => {
    setEditingContest(null);
    setFormData({
      title: "",
      description: "",
      categoryId: "visual-arts",
      deadline: "",
      price: 200,
      status: "active",
      rulesLink: "#",
      diplomaImage: "",
      image: ""
    });
    setIsModalOpen(true);
  };

  const parseRussianDate = (dateStr: string): string => {
    const months: Record<string, string> = {
      'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
      'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
      'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12',
      'january': '01', 'february': '02', 'march': '03', 'april': '04',
      'may': '05', 'june': '06', 'july': '07', 'august': '08',
      'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };
    const parts = dateStr.trim().split(' ');
    if (parts.length === 3 && months[parts[1].toLowerCase()]) {
      return `${parts[2]}-${months[parts[1].toLowerCase()]}-${parts[0].padStart(2, '0')}`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  const handleEditContest = (contest: Contest) => {
    setEditingContest(contest);
    setFormData({
      ...contest,
      deadline: contest.deadline ? parseRussianDate(contest.deadline) : ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingContest ? 'PUT' : 'POST';
      const body = editingContest ? { ...formData, id: editingContest.id } : formData;
      const response = await fetch(API_URL, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        toast({ title: "Успешно", description: editingContest ? "Конкурс обновлен" : "Конкурс создан" });
        setIsModalOpen(false);
        loadContests();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось сохранить конкурс", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот конкурс?")) return;
    try {
      const response = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Успешно", description: "Конкурс удален" });
        loadContests();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить конкурс", variant: "destructive" });
    }
  };

  const handleDeleteApplication = async (id: number) => {
    if (!confirm("Переместить заявку в корзину?")) return;
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Успешно", description: "Заявка перемещена в корзину" });
        loadApplications();
        loadDeletedApplications();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить заявку", variant: "destructive" });
    }
  };

  const handlePermanentDeleteApplication = async (id: number) => {
    if (!confirm("Удалить заявку навсегда? Это действие нельзя отменить.")) return;
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?id=${id}&permanent=true`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Удалено", description: "Заявка удалена безвозвратно" });
        loadDeletedApplications();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить заявку", variant: "destructive" });
    }
  };

  const handleRestoreApplication = async (id: number) => {
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?id=${id}&restore=true`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Успешно", description: "Заявка восстановлена" });
        loadApplications();
        loadDeletedApplications();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось восстановить заявку", variant: "destructive" });
    }
  };

  const handleEditResult = (result: Result) => {
    setEditingResult(result);
    setIsResultModalOpen(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;
    try {
      const response = await fetch(RESULTS_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingResult)
      });
      if (response.ok) {
        toast({ title: "Успешно", description: "Результат обновлен" });
        setIsResultModalOpen(false);
        loadResults();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось сохранить результат", variant: "destructive" });
    }
  };

  const handleDeleteResult = async (id: number) => {
    if (!confirm("Удалить этот результат?")) return;
    try {
      const response = await fetch(`${RESULTS_API_URL}?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Успешно", description: "Результат удален" });
        loadResults();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить результат", variant: "destructive" });
    }
  };

  const handleCreateResultFromApplication = async (app: Application) => {
    if (!app.result) {
      toast({ title: "Результат не указан", description: "Сначала установите результат в заявке", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(RESULTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: app.id,
          full_name: app.full_name,
          age: app.age,
          teacher: app.teacher,
          institution: app.institution,
          work_title: app.work_title,
          email: app.email,
          contest_id: app.contest_id,
          contest_name: app.contest_name,
          work_file_url: app.work_file_url,
          result: app.result,
          gallery_consent: app.gallery_consent,
          notes: null,
          diploma_issued_at: app.diploma_issued_at || null
        })
      });
      if (response.ok) {
        toast({ title: "Успешно", description: "Результат создан из заявки" });
        loadResults();
      } else if (response.status === 409) {
        toast({ title: "Дубликат", description: "Результат из этой заявки уже существует", variant: "destructive" });
      } else {
        toast({ title: "Ошибка", description: "Не удалось создать результат", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось создать результат", variant: "destructive" });
    }
  };

  const handleManualAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAppFile) {
      toast({ title: "Ошибка", description: "Загрузите файл работы", variant: "destructive" });
      return;
    }
    if (!manualContestName) {
      toast({ title: "Ошибка", description: "Выберите конкурс", variant: "destructive" });
      return;
    }
    setSubmittingManualApp(true);
    setManualAppUploadProgress(5);

    try {
      const formEl = e.currentTarget as HTMLFormElement;
      const fd = new FormData(formEl);

      const CHUNK_SIZE = 2 * 1024 * 1024;
      const totalChunks = Math.ceil(manualAppFile.size / CHUNK_SIZE);
      let uploadId = '';
      let file_url = '';

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, manualAppFile.size);
        const chunk = manualAppFile.slice(start, end);

        const chunkBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = () => reject(new Error('Ошибка чтения файла'));
          reader.readAsDataURL(chunk);
        });

        const chunkProgress = 5 + Math.round((chunkIndex / totalChunks) * 45);
        setManualAppUploadProgress(chunkProgress);

        const uploadResponse = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chunk: chunkBase64,
            chunkIndex,
            totalChunks,
            fileName: manualAppFile.name,
            fileType: manualAppFile.type,
            folder: 'works',
            uploadId: uploadId || undefined
          })
        });

        if (!uploadResponse.ok) throw new Error('Не удалось загрузить файл');

        const result = await uploadResponse.json();
        if (!uploadId) uploadId = result.uploadId;
        if (result.complete) file_url = result.url;
      }

      setManualAppUploadProgress(60);

      const response = await fetch(SUBMIT_APPLICATION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fd.get('manualFullName'),
          age: parseInt(fd.get('manualAge') as string),
          teacher: fd.get('manualTeacher') || null,
          institution: fd.get('manualInstitution') || null,
          work_title: fd.get('manualWorkTitle'),
          email: fd.get('manualEmail'),
          contest_name: manualContestName,
          work_file_url: file_url,
          gallery_consent: fd.get('manualGallery') === 'on'
        })
      });

      setManualAppUploadProgress(90);

      const result = await response.json();
      if (response.ok && result.success) {
        setManualAppUploadProgress(100);
        toast({ title: "Успешно", description: "Заявка добавлена вручную" });
        setIsManualAppModalOpen(false);
        setManualAppFile(null);
        setManualAppUploadProgress(0);
        loadApplications();
      } else {
        toast({ title: "Ошибка", description: result.error || "Не удалось создать заявку", variant: "destructive" });
      }
      setSubmittingManualApp(false);
    } catch (error) {
      console.error('Ошибка при создании заявки:', error);
      toast({ title: "Ошибка", description: error instanceof Error ? error.message : "Произошла ошибка при создании заявки", variant: "destructive" });
      setSubmittingManualApp(false);
      setManualAppUploadProgress(0);
    }
  };

  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        login={login}
        setLogin={setLogin}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />
    );
  }

  const handleCertificatesClick = () => {
    setActiveTab('certificates');
    if (certificatesLog.length === 0) {
      setCertLoading(true);
      fetch(CERTIFICATES_LOG_URL)
        .then(r => r.json())
        .then(data => setCertificatesLog(data))
        .finally(() => setCertLoading(false));
    }
  };

  const handleCertificatesRefresh = () => {
    setCertLoading(true);
    fetch(CERTIFICATES_LOG_URL)
      .then(r => r.json())
      .then(data => setCertificatesLog(data))
      .finally(() => setCertLoading(false));
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicationsCount={applications.length}
        deletedApplicationsCount={deletedApplications.length}
        resultsCount={results.length}
        reviewsCount={reviews.length}
        certificatesLogLength={certificatesLog.length}
        onCertificatesClick={handleCertificatesClick}
        handleLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-12">
        <AdminTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          applicationsCount={applications.length}
          deletedApplicationsCount={deletedApplications.length}
          resultsCount={results.length}
          reviewsCount={reviews.length}
          onCertificatesClick={handleCertificatesClick}
        />

        {activeTab === 'contests' && (
          <AdminContestsTab
            contests={contests}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            editingContest={editingContest}
            formData={formData}
            setFormData={setFormData}
            uploadingRules={uploadingRules}
            setUploadingRules={setUploadingRules}
            uploadingDiploma={uploadingDiploma}
            setUploadingDiploma={setUploadingDiploma}
            handleCreateContest={handleCreateContest}
            handleEditContest={handleEditContest}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            UPLOAD_URL={UPLOAD_URL}
          />
        )}

        {activeTab === 'applications' && (
          <AdminApplicationsTab
            contests={contests}
            applications={applications}
            deletedApplications={deletedApplications}
            applicationsSubTab={applicationsSubTab}
            setApplicationsSubTab={setApplicationsSubTab}
            applicationsWithResults={applicationsWithResults}
            isAppModalOpen={isAppModalOpen}
            setIsAppModalOpen={setIsAppModalOpen}
            editingApplication={editingApplication}
            setEditingApplication={setEditingApplication}
            appResult={appResult}
            setAppResult={setAppResult}
            appStatus={appStatus}
            setAppStatus={setAppStatus}
            isWorkPreviewOpen={isWorkPreviewOpen}
            setIsWorkPreviewOpen={setIsWorkPreviewOpen}
            workPreview={workPreview}
            setWorkPreview={setWorkPreview}
            isManualAppModalOpen={isManualAppModalOpen}
            setIsManualAppModalOpen={setIsManualAppModalOpen}
            manualAppFile={manualAppFile}
            setManualAppFile={setManualAppFile}
            manualContestName={manualContestName}
            setManualContestName={setManualContestName}
            submittingManualApp={submittingManualApp}
            manualAppUploadProgress={manualAppUploadProgress}
            handleCreateResultFromApplication={handleCreateResultFromApplication}
            handleDeleteApplication={handleDeleteApplication}
            handlePermanentDeleteApplication={handlePermanentDeleteApplication}
            handleRestoreApplication={handleRestoreApplication}
            handleManualAppSubmit={handleManualAppSubmit}
            loadApplications={loadApplications}
            loadDeletedApplications={loadDeletedApplications}
            APPLICATIONS_API_URL={APPLICATIONS_API_URL}
            UPLOAD_URL={UPLOAD_URL}
            toast={toast}
          />
        )}

        {(activeTab === 'results' || activeTab === 'reviews') && (
          <AdminResultsAndReviewsTab
            activeTab={activeTab}
            filteredResults={filteredResults}
            resultFilters={resultFilters}
            setResultFilters={setResultFilters}
            isResultModalOpen={isResultModalOpen}
            setIsResultModalOpen={setIsResultModalOpen}
            editingResult={editingResult}
            setEditingResult={setEditingResult}
            handleSaveResult={handleSaveResult}
            handleDeleteResult={handleDeleteResult}
            reviews={reviews}
            loadReviews={loadReviews}
            REVIEWS_API_URL={REVIEWS_API_URL}
            toast={toast}
          />
        )}

        {activeTab === 'certificates' && (
          <AdminCertificatesTab
            certificatesLog={certificatesLog}
            certLoading={certLoading}
            onRefresh={handleCertificatesRefresh}
            toast={toast}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsTab
            applicationFormUrl={applicationFormUrl}
            setApplicationFormUrl={setApplicationFormUrl}
            toast={toast}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
