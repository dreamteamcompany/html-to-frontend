import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

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

interface ReviewCardProps {
  review: Review;
  REVIEWS_API_URL: string;
  loadReviews: () => void;
  toast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

const ReviewCard = ({ review, REVIEWS_API_URL, loadReviews, toast }: ReviewCardProps) => {
  return (
    <Card className={`rounded-2xl shadow-md ${review.status === 'pending' ? 'border-2 border-orange-400' : review.status === 'approved' ? 'border-2 border-green-400' : 'border-2 border-red-400 opacity-60'}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Icon key={`star-${i}`} name="Star" className="text-secondary fill-secondary" size={18} />
                ))}
              </div>
              <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                review.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                review.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {review.status === 'pending' ? '⏳ На модерации' :
                 review.status === 'approved' ? '✅ Опубликован' : '❌ Отклонен'}
              </span>
            </div>

            <p className="text-lg mb-4 italic">"{review.text}"</p>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Автор</p>
                <p className="font-semibold">{review.author_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Роль</p>
                <p className="font-semibold">{review.author_role || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Дата создания</p>
                <p className="font-semibold">
                  {new Date(review.created_at).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {review.published_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Дата публикации</p>
                  <p className="font-semibold">
                    {new Date(review.published_at).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            {review.status === 'pending' && (
              <>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(REVIEWS_API_URL, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: review.id, status: 'approved' })
                      });
                      if (response.ok) {
                        toast({ title: 'Успешно', description: 'Отзыв опубликован' });
                        loadReviews();
                      }
                    } catch {
                      toast({ title: 'Ошибка', description: 'Не удалось опубликовать отзыв', variant: 'destructive' });
                    }
                  }}
                  variant="default"
                  size="sm"
                  className="rounded-xl bg-green-600 hover:bg-green-700"
                >
                  <Icon name="Check" size={16} className="mr-1" />
                  Одобрить
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(REVIEWS_API_URL, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: review.id, status: 'rejected' })
                      });
                      if (response.ok) {
                        toast({ title: 'Успешно', description: 'Отзыв отклонен' });
                        loadReviews();
                      }
                    } catch {
                      toast({ title: 'Ошибка', description: 'Не удалось отклонить отзыв', variant: 'destructive' });
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <Icon name="X" size={16} className="mr-1" />
                  Отклонить
                </Button>
              </>
            )}
            {review.status === 'approved' && (
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch(REVIEWS_API_URL, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: review.id, status: 'rejected' })
                    });
                    if (response.ok) {
                      toast({ title: 'Успешно', description: 'Отзыв снят с публикации' });
                      loadReviews();
                    }
                  } catch {
                    toast({ title: 'Ошибка', description: 'Не удалось снять с публикации', variant: 'destructive' });
                  }
                }}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <Icon name="EyeOff" size={16} className="mr-1" />
                Снять
              </Button>
            )}
            <Button
              onClick={async () => {
                if (!confirm('Удалить этот отзыв?')) return;
                try {
                  const response = await fetch(`${REVIEWS_API_URL}?id=${review.id}`, {
                    method: 'DELETE'
                  });
                  if (response.ok) {
                    toast({ title: 'Успешно', description: 'Отзыв удален' });
                    loadReviews();
                  }
                } catch {
                  toast({ title: 'Ошибка', description: 'Не удалось удалить отзыв', variant: 'destructive' });
                }
              }}
              variant="destructive"
              size="sm"
              className="rounded-xl"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;