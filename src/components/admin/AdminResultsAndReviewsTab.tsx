import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import ResultFiltersCard from "./ResultFiltersCard";
import ResultCard from "./ResultCard";
import ReviewCard from "./ReviewCard";
import ResultEditModal from "./ResultEditModal";

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

interface ResultFilters {
  contest_name: string;
  full_name: string;
  result: string;
  date: Date | undefined;
}

interface AdminResultsTabProps {
  activeTab: 'results' | 'reviews';
  filteredResults: Result[];
  resultFilters: ResultFilters;
  setResultFilters: (v: ResultFilters) => void;
  isResultModalOpen: boolean;
  setIsResultModalOpen: (v: boolean) => void;
  editingResult: Result | null;
  setEditingResult: (v: Result | null) => void;
  handleSaveResult: (e: React.FormEvent) => void;
  handleDeleteResult: (id: number) => void;
  reviews: Review[];
  loadReviews: () => void;
  REVIEWS_API_URL: string;
  toast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

const AdminResultsAndReviewsTab = ({
  activeTab,
  filteredResults,
  resultFilters,
  setResultFilters,
  isResultModalOpen,
  setIsResultModalOpen,
  editingResult,
  setEditingResult,
  handleSaveResult,
  handleDeleteResult,
  reviews,
  loadReviews,
  REVIEWS_API_URL,
  toast,
}: AdminResultsTabProps) => {
  return (
    <>
      {activeTab === 'results' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-primary">Результаты конкурсов</h2>
          </div>

          <ResultFiltersCard resultFilters={resultFilters} setResultFilters={setResultFilters} />

          <div className="grid gap-4">
            {filteredResults.length === 0 ? (
              <Card className="rounded-2xl p-8 text-center">
                <Icon name="Award" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">Результатов пока нет</p>
              </Card>
            ) : (
              filteredResults.map((result) => (
                <ResultCard key={result.id} result={result} handleDeleteResult={handleDeleteResult} />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-primary">Модерация отзывов</h2>
          </div>

          <div className="grid gap-4">
            {reviews.length === 0 ? (
              <Card className="rounded-2xl p-8 text-center">
                <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">Отзывов пока нет</p>
              </Card>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  REVIEWS_API_URL={REVIEWS_API_URL}
                  loadReviews={loadReviews}
                  toast={toast}
                />
              ))
            )}
          </div>
        </div>
      )}

      <ResultEditModal
        isResultModalOpen={isResultModalOpen}
        setIsResultModalOpen={setIsResultModalOpen}
        editingResult={editingResult}
        setEditingResult={setEditingResult}
        handleSaveResult={handleSaveResult}
      />
    </>
  );
};

export default AdminResultsAndReviewsTab;
