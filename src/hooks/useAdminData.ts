import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const RESULTS_API_URL = "https://functions.poehali.dev/e1f9698c-ec8a-4b24-89c2-72bb579d7f9b";
const APPLICATIONS_API_URL = "https://functions.poehali.dev/ff2c7334-750b-418e-8468-152fae1d68ef";
const REVIEWS_API_URL = "https://functions.poehali.dev/3daafc39-174c-4669-8e8a-71172a246929";
const SETTINGS_API_URL = "https://functions.poehali.dev/6f549b76-2cfc-4746-a61a-9a946c7a84bd";
const CERTIFICATES_LOG_URL = "https://functions.poehali.dev/15416f51-5386-4500-b770-4dea40b824e5";
const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";

export interface Contest {
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

export interface Application {
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

export interface Result {
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

export interface Review {
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

export interface CertificateRow {
  id: number;
  result_id: number;
  full_name: string;
  contest_name: string;
  issued_at: string;
}

export const useAdminData = (isAuthenticated: boolean) => {
  const { toast } = useToast();

  const [contests, setContests] = useState<Contest[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deletedApplications, setDeletedApplications] = useState<Application[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [applicationsWithResults, setApplicationsWithResults] = useState<Set<number>>(new Set());
  const [applicationFormUrl, setApplicationFormUrl] = useState<string>('');
  const [certificatesLog, setCertificatesLog] = useState<CertificateRow[]>([]);
  const [certLoading, setCertLoading] = useState(false);
  const [resultFilters, setResultFilters] = useState({
    contest_name: '',
    full_name: '',
    result: 'all',
    date: undefined as Date | undefined
  });

  const loadContests = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setContests(data);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось загрузить конкурсы", variant: "destructive" });
    }
  };

  const loadApplications = async () => {
    try {
      const response = await fetch(APPLICATIONS_API_URL);
      const data = await response.json();
      setApplications(data);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось загрузить заявки", variant: "destructive" });
    }
  };

  const loadDeletedApplications = async () => {
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?deleted=true`);
      const data = await response.json();
      setDeletedApplications(data);
    } catch {
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
    } catch {
      toast({ title: "Ошибка", description: "Не удалось загрузить результаты", variant: "destructive" });
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`${REVIEWS_API_URL}?status=all`);
      const data = await response.json();
      setReviews(data);
    } catch {
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

  const loadCertificates = () => {
    setCertLoading(true);
    fetch(CERTIFICATES_LOG_URL)
      .then(r => r.json())
      .then(data => setCertificatesLog(data))
      .finally(() => setCertLoading(false));
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

  return {
    contests, setContests,
    applications, setApplications,
    deletedApplications, setDeletedApplications,
    results, setResults,
    filteredResults,
    reviews, setReviews,
    applicationsWithResults, setApplicationsWithResults,
    applicationFormUrl, setApplicationFormUrl,
    certificatesLog, certLoading,
    resultFilters, setResultFilters,
    loadContests, loadApplications, loadDeletedApplications,
    loadResults, loadReviews, loadSettings, loadCertificates,
  };
};