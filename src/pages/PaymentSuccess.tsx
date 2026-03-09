import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Спасибо за оплату!
        </h1>

        <div className="space-y-4 text-lg text-gray-700 mb-8">
          <p className="font-semibold text-green-600">
            Ваша заявка принята
          </p>
          
          <p>
            Оплата прошла успешно, и ваша работа зарегистрирована в нашей системе.
          </p>

          <p>
            В случае возникновения вопросов мы свяжемся с вами по электронной почте.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700">
            Следите за результатами конкурса на главной странице. 
            Мы оповестим вас о публикации результатов.
          </p>
        </div>

        <Button
          onClick={() => navigate('/')}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Вернуться на главную
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
