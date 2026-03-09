import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const subjects = [
  {
    name: "Математика",
    icon: "Calculator",
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Русский язык",
    icon: "BookOpen",
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Английский язык",
    icon: "Languages",
    color: "bg-green-100 text-green-600",
  },
  { name: "Информатика", icon: "Code", color: "bg-indigo-100 text-indigo-600" },
  {
    name: "Химия",
    icon: "FlaskConical",
    color: "bg-orange-100 text-orange-600",
  },
  { name: "Биология", icon: "Leaf", color: "bg-emerald-100 text-emerald-600" },
  { name: "Обществознание", icon: "Users", color: "bg-pink-100 text-pink-600" },
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Здравствуйте! Меня зовут ${formData.name}. Хочу записаться на пробное занятие по предмету "${formData.subject}". Мой телефон: ${formData.phone}`;
    const vkUrl = `https://vk.me/repcentrperfekz?text=${encodeURIComponent(message)}`;
    window.open(vkUrl, "_blank");
    toast.success("Переходим в чат ВКонтакте...");
  };

  return (
    <section id="contacts" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl md:text-5xl font-bold font-montserrat mb-4">
            Записаться на бесплатное занятие
          </h2>
          <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-6 mb-8 max-w-lg mx-auto">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Что вас ждёт на занятии:
            </p>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <Icon
                  name="Check"
                  className="text-accent flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Индивидуальный формат • 60 минут</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  name="Check"
                  className="text-accent flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Определим уровень знаний ребёнка</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  name="Check"
                  className="text-accent flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Составим персональный план</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  name="Check"
                  className="text-accent flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Объясним, как работает контроль</span>
              </li>
            </ul>
          </div>
          <p className="text-lg text-gray-600">
            Оставьте заявку — мы свяжемся в течение 30 минут
          </p>
        </div>
        <Card className="animate-on-scroll shadow-2xl border-2 border-gray-200">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Ваше имя</Label>
                <Input
                  id="name"
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject">Предмет</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject, idx) => (
                      <SelectItem key={idx} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="terms" required />
                <Label
                  htmlFor="terms"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  Я соглашаюсь на{" "}
                  <a
                    href="http://perfekz.ru/docs/docs/8) СОГЛАСИЕ_НА_ОБРАБОТКУ_signed.pdf"
                    target="_blank"
                    className="text-yellow-400 underline font-bold"
                  >
                    обработку персональных данных
                  </a>{" "}
                  и принимаю условия{" "}
                  <a
                    href="http://perfekz.ru/docs/docs/7) ПОЛОЖЕНИЕ_ЗАЩИТА_ПЕРС_ДАННЫХ_signed.pdf"
                    target="_blank"
                    className="text-yellow-400 underline font-bold"
                  >
                    политики конфиденциальности
                  </a>
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold text-lg py-6 shadow-lg"
              >
                <Icon name="Sparkles" className="mr-2" size={20} />
                Записаться на бесплатное занятие
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
