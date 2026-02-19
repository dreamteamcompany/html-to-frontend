import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';

const AverageSpeedCard = () => {
  const [avgHours, setAvgHours] = useState<number | null>(null);
  const [changePercent, setChangePercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiFetch(API_ENDPOINTS.statsApi);
      const data = await response.json();
      
      const currentAvg = data.approval_speed?.avg_hours;
      const prevAvg = data.prev_month_speed?.avg_hours;
      
      setAvgHours(currentAvg);
      
      if (currentAvg && prevAvg) {
        const change = ((currentAvg - prevAvg) / prevAvg) * 100;
        setChangePercent(change);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours: number | null) => {
    if (hours === null || hours === undefined || typeof hours !== 'number') return '—';
    if (hours < 1) {
      return `${Math.round(hours * 60)}м`;
    }
    return `${hours.toFixed(1)}ч`;
  };

  if (loading) {
    return (
      <Card style={{ 
        background: 'hsl(var(--card))', 
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ 
      background: 'hsl(var(--card))', 
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent className="p-4 sm:p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
          padding: '8px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
          display: 'inline-flex',
          marginBottom: '14px'
        }} className="sm:p-3 sm:mb-5">
          <Icon name="Zap" size={18} style={{ color: '#000000' }} className="sm:w-6 sm:h-6" />
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#000000', marginBottom: '12px' }} className="sm:text-lg sm:mb-4">
          Средняя Скорость
        </h3>
        <div style={{ 
          color: '#000000', 
          fontSize: '32px', 
          fontWeight: '900',
          marginBottom: '8px'
        }} className="sm:text-[42px] sm:mb-3">
          {formatTime(avgHours)}
        </div>
        <div style={{ color: '#000000', fontSize: '12px', marginBottom: '14px' }} className="sm:text-sm sm:mb-5">
          Обработка платежного запроса
        </div>
        <div style={{ display: 'flex', gap: '6px' }} className="sm:gap-2">
          {changePercent !== null && (
            <div style={{ 
              flex: 1,
              background: 'hsl(var(--muted))',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid hsl(var(--border))',
              textAlign: 'center'
            }}>
              <div style={{ 
                color: '#000000', 
                fontSize: '16px', 
                fontWeight: '700' 
              }} className="sm:text-xl">
                {changePercent > 0 ? '+' : ''}{changePercent.toFixed(0)}%
              </div>
              <div style={{ color: '#000000', fontSize: '9px', marginTop: '3px' }} className="sm:text-[11px] sm:mt-1">vs месяц назад</div>
            </div>
          )}
          <div style={{ 
            flex: 1,
            background: 'rgba(117, 81, 233, 0.15)',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid rgba(117, 81, 233, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ color: '#000000', fontSize: '16px', fontWeight: '700' }} className="sm:text-xl">
              {avgHours ? 'Вкл' : '—'}
            </div>
            <div style={{ color: '#000000', fontSize: '9px', marginTop: '3px' }} className="sm:text-[11px] sm:mt-1">Автоматизация</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AverageSpeedCard;