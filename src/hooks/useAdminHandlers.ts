import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Contest, Application, Result } from "./useAdminData";
import { translateFetchError } from "@/utils/api";

const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";
const RESULTS_API_URL = "https://functions.poehali.dev/e1f9698c-ec8a-4b24-89c2-72bb579d7f9b";
const APPLICATIONS_API_URL = "https://functions.poehali.dev/ff2c7334-750b-418e-8468-152fae1d68ef";
const SUBMIT_APPLICATION_URL = "https://functions.poehali.dev/2d352955-9c6c-4bbb-ad1e-944c7ea04d84";

const DEFAULT_FORM: Contest = {
  title: "",
  description: "",
  categoryId: "visual-arts",
  deadline: "",
  price: 200,
  status: "active",
  rulesLink: "#",
  diplomaImage: "",
  image: ""
};

interface UseAdminHandlersProps {
  loadContests: () => Promise<void>;
  loadApplications: () => Promise<void>;
  loadDeletedApplications: () => Promise<void>;
  loadResults: () => Promise<void>;
}

export const useAdminHandlers = ({
  loadContests,
  loadApplications,
  loadDeletedApplications,
  loadResults,
}: UseAdminHandlersProps) => {
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [appStatus, setAppStatus] = useState<'new' | 'viewed' | 'sent'>('new');
  const [appResult, setAppResult] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'viewed' | 'sent'>('all');
  const [workPreview, setWorkPreview] = useState<string | null>(null);
  const [isWorkPreviewOpen, setIsWorkPreviewOpen] = useState(false);
  const [formData, setFormData] = useState<Contest>(DEFAULT_FORM);
  const [uploadingRules, setUploadingRules] = useState(false);
  const [uploadingDiploma, setUploadingDiploma] = useState(false);
  const [isManualAppModalOpen, setIsManualAppModalOpen] = useState(false);
  const [manualAppFile, setManualAppFile] = useState<File | null>(null);
  const [manualContestName, setManualContestName] = useState("");
  const [submittingManualApp, setSubmittingManualApp] = useState(false);
  const [manualAppUploadProgress, setManualAppUploadProgress] = useState(0);

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

  const handleCreateContest = () => {
    setEditingContest(null);
    setFormData(DEFAULT_FORM);
    setIsModalOpen(true);
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
      toast({ title: "Ошибка", description: translateFetchError(error, "Произошла ошибка при создании заявки"), variant: "destructive" });
      setSubmittingManualApp(false);
      setManualAppUploadProgress(0);
    }
  };

  return {
    isModalOpen, setIsModalOpen,
    isAppModalOpen, setIsAppModalOpen,
    editingContest, setEditingContest,
    editingApplication, setEditingApplication,
    editingResult, setEditingResult,
    isResultModalOpen, setIsResultModalOpen,
    appStatus, setAppStatus,
    appResult, setAppResult,
    statusFilter, setStatusFilter,
    workPreview, setWorkPreview,
    isWorkPreviewOpen, setIsWorkPreviewOpen,
    formData, setFormData,
    uploadingRules, setUploadingRules,
    uploadingDiploma, setUploadingDiploma,
    isManualAppModalOpen, setIsManualAppModalOpen,
    manualAppFile, setManualAppFile,
    manualContestName, setManualContestName,
    submittingManualApp,
    manualAppUploadProgress,
    handleCreateContest,
    handleEditContest,
    handleSubmit,
    handleDelete,
    handleDeleteApplication,
    handlePermanentDeleteApplication,
    handleRestoreApplication,
    handleEditResult,
    handleSaveResult,
    handleDeleteResult,
    handleCreateResultFromApplication,
    handleManualAppSubmit,
    UPLOAD_URL,
    APPLICATIONS_API_URL,
  };
};