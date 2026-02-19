import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';

interface DepartmentUser {
  department_name: string;
  user_count: number;
}

const ActiveTeamCard = () => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [departments, setDepartments] = useState<DepartmentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiFetch(API_ENDPOINTS.statsApi);
      const data = await response.json();
      
      setActiveUsers(data.active_users?.active_users || 0);
      setDepartments(data.department_users || []);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColor = (index: number) => {
    const colors = ['#7551e9', '#01b574', '#ffb547', '#3965ff', '#ff6b6b'];
    return colors[index] || '#7551e9';
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
          background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
          padding: '8px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)',
          display: 'inline-flex',
          marginBottom: '14px'
        }} className="sm:p-3 sm:mb-5">
          <Icon name="Users" size={18} style={{ color: '#fff' }} className="sm:w-6 sm:h-6" />
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'hsl(var(--foreground))', marginBottom: '12px' }} className="sm:text-lg sm:mb-4">
          Активная Команда
        </h3>
        <div style={{ 
          color: '#7551e9', 
          fontSize: '32px', 
          fontWeight: '900',
          textShadow: '0 0 30px rgba(117, 81, 233, 0.6)',
          marginBottom: '8px'
        }} className="sm:text-[42px] sm:mb-3">
          {activeUsers}
        </div>
        <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px', marginBottom: '14px' }} className="sm:text-sm sm:mb-5">
          Сотрудников работают с системой
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="sm:gap-2.5">
          {departments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Нет данных об активности
            </div>
          ) : (
            departments.map((dept, index) => (
              <div key={index} style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: 'hsl(var(--muted))',
                borderRadius: '6px',
                border: '1px solid hsl(var(--border))'
              }}>
                <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '11px' }} className="sm:text-xs">
                  {dept.department_name}
                </span>
                <span style={{ 
                  color: getColor(index), 
                  fontSize: '12px', 
                  fontWeight: '700' 
                }} className="sm:text-sm">
                  {dept.user_count}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveTeamCard;