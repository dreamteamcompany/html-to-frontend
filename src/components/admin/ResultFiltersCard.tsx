import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface ResultFilters {
  contest_name: string;
  full_name: string;
  result: string;
  date: Date | undefined;
}

interface ResultFiltersCardProps {
  resultFilters: ResultFilters;
  setResultFilters: (v: ResultFilters) => void;
}

const ResultFiltersCard = ({ resultFilters, setResultFilters }: ResultFiltersCardProps) => {
  return (
    <Card className="rounded-2xl shadow-md mb-6 p-6">
      <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Название конкурса</Label>
          <Input
            placeholder="Поиск по названию..."
            value={resultFilters.contest_name}
            onChange={(e) => setResultFilters({...resultFilters, contest_name: e.target.value})}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>ФИО участника</Label>
          <Input
            placeholder="Поиск по ФИО..."
            value={resultFilters.full_name}
            onChange={(e) => setResultFilters({...resultFilters, full_name: e.target.value})}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Результат</Label>
          <Select
            value={resultFilters.result}
            onValueChange={(value) => setResultFilters({...resultFilters, result: value})}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все результаты</SelectItem>
              <SelectItem value="grand_prix">🏆 Гран-При</SelectItem>
              <SelectItem value="first_degree">🥇 Диплом 1 степени</SelectItem>
              <SelectItem value="second_degree">🥈 Диплом 2 степени</SelectItem>
              <SelectItem value="third_degree">🥉 Диплом 3 степени</SelectItem>
              <SelectItem value="participant">✨ Участник</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Дата участия</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl">
                {resultFilters.date ? format(resultFilters.date, 'dd.MM.yyyy', { locale: ru }) : 'Выберите дату'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={resultFilters.date}
                onSelect={(date) => setResultFilters({...resultFilters, date: date})}
                locale={ru}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
};

export default ResultFiltersCard;
