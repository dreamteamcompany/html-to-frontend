import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Dashboard2NeonCards = () => {
  return (
    <>
      {/* Новые красивые блоки с неоновыми эффектами */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '30px' }}>
        {/* Топ Платежей с неоновым свечением */}
        <Card style={{ 
          background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
          border: '1px solid rgba(117, 81, 233, 0.3)',
          boxShadow: '0 0 30px rgba(117, 81, 233, 0.15), inset 0 0 20px rgba(117, 81, 233, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(117, 81, 233, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
                padding: '12px',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(117, 81, 233, 0.5)'
              }}>
                <Icon name="TrendingUp" size={24} style={{ color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Топ-5 Платежей</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { name: 'AWS Hosting', amount: 45000, percent: 100, color: '#7551e9' },
                { name: 'Google Ads', amount: 38000, percent: 84, color: '#3965ff' },
                { name: 'Зарплата ИТ', amount: 32000, percent: 71, color: '#01b574' },
                { name: 'Софт лицензии', amount: 24000, percent: 53, color: '#ffb547' },
                { name: 'Обучение', amount: 18000, percent: 40, color: '#ff6b6b' }
              ].map((item, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.boxShadow = `0 0 20px ${item.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{item.name}</span>
                    <span style={{ color: item.color, fontSize: '14px', fontWeight: '700' }}>
                      {new Intl.NumberFormat('ru-RU').format(item.amount)} ₽
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${item.percent}%`, 
                      height: '100%', 
                      background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}aa 100%)`,
                      borderRadius: '10px',
                      boxShadow: `0 0 10px ${item.color}`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Статистика в реальном времени */}
        <Card style={{ 
          background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
          border: '1px solid rgba(1, 181, 116, 0.3)',
          boxShadow: '0 0 30px rgba(1, 181, 116, 0.15), inset 0 0 20px rgba(1, 181, 116, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(1, 181, 116, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)',
                padding: '12px',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(1, 181, 116, 0.5)'
              }}>
                <Icon name="Activity" size={24} style={{ color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Live Метрики</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ 
                background: 'rgba(1, 181, 116, 0.1)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(1, 181, 116, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ color: '#01b574', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Обработано сегодня
                </div>
                <div style={{ 
                  color: '#fff', 
                  fontSize: '36px', 
                  fontWeight: '800',
                  textShadow: '0 0 20px rgba(1, 181, 116, 0.5)'
                }}>
                  127
                </div>
                <div style={{ color: '#a3aed0', fontSize: '13px', marginTop: '4px' }}>
                  +18 за последний час
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ 
                  background: 'rgba(255, 181, 71, 0.1)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 181, 71, 0.2)',
                  textAlign: 'center'
                }}>
                  <Icon name="Clock" size={20} style={{ color: '#ffb547', marginBottom: '8px' }} />
                  <div style={{ color: '#ffb547', fontSize: '24px', fontWeight: '700' }}>2.4ч</div>
                  <div style={{ color: '#a3aed0', fontSize: '12px', marginTop: '4px' }}>Ср. время</div>
                </div>
                <div style={{ 
                  background: 'rgba(117, 81, 233, 0.1)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(117, 81, 233, 0.2)',
                  textAlign: 'center'
                }}>
                  <Icon name="CheckCircle2" size={20} style={{ color: '#7551e9', marginBottom: '8px' }} />
                  <div style={{ color: '#7551e9', fontSize: '24px', fontWeight: '700' }}>94%</div>
                  <div style={{ color: '#a3aed0', fontSize: '12px', marginTop: '4px' }}>Согласовано</div>
                </div>
              </div>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#a3aed0', fontSize: '13px' }}>На согласовании</span>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>23</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: '64%', 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #01b574 0%, #01b574aa 100%)',
                    borderRadius: '10px',
                    boxShadow: '0 0 10px #01b574',
                    animation: 'pulse 2s infinite'
                  }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Критичные уведомления */}
        <Card style={{ 
          background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
          border: '1px solid rgba(255, 107, 107, 0.3)',
          boxShadow: '0 0 30px rgba(255, 107, 107, 0.15), inset 0 0 20px rgba(255, 107, 107, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '150%',
            height: '150%',
            background: 'radial-gradient(circle, rgba(255, 107, 107, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                padding: '12px',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
                animation: 'pulse 2s infinite'
              }}>
                <Icon name="AlertTriangle" size={24} style={{ color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Требуют внимания</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: 'Clock3', text: 'Просрочено 4 платежа', color: '#ff6b6b', urgent: true },
                { icon: 'XCircle', text: '2 отклоненных запроса', color: '#ffb547', urgent: false },
                { icon: 'AlertCircle', text: 'Лимит приближается к 80%', color: '#ff6b6b', urgent: true },
                { icon: 'FileWarning', text: '3 документа без подписи', color: '#ffb547', urgent: false }
              ].map((alert, idx) => (
                <div key={idx} style={{ 
                  background: alert.urgent ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 181, 71, 0.1)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${alert.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = `0 0 20px ${alert.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <Icon name={alert.icon} size={20} style={{ color: alert.color, flexShrink: 0 }} />
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{alert.text}</span>
                </div>
              ))}
            </div>
            <div style={{ 
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(117, 81, 233, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(117, 81, 233, 0.2)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(117, 81, 233, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(117, 81, 233, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(117, 81, 233, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <span style={{ color: '#7551e9', fontSize: '14px', fontWeight: '600' }}>
                Посмотреть все уведомления
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Еще один ряд крутых блоков */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '30px' }}>
        {/* Экономия за год */}
        <Card style={{ 
          background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
          border: '1px solid rgba(1, 181, 116, 0.3)',
          boxShadow: '0 0 30px rgba(1, 181, 116, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(1, 181, 116, 0.2) 0%, transparent 70%)',
            top: '-150px',
            left: '-150px',
            animation: 'rotate 20s linear infinite'
          }} />
          <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(1, 181, 116, 0.5)',
              display: 'inline-flex',
              marginBottom: '20px'
            }}>
              <Icon name="PiggyBank" size={24} style={{ color: '#fff' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
              Годовая Экономия
            </h3>
            <div style={{ 
              color: '#01b574', 
              fontSize: '42px', 
              fontWeight: '900',
              textShadow: '0 0 30px rgba(1, 181, 116, 0.6)',
              marginBottom: '12px'
            }}>
              ₽480K
            </div>
            <div style={{ color: '#a3aed0', fontSize: '14px', marginBottom: '20px' }}>
              За счет оптимизации подписок
            </div>
            <div style={{ 
              background: 'rgba(1, 181, 116, 0.1)',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid rgba(1, 181, 116, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#a3aed0', fontSize: '13px' }}>Прогресс цели</span>
                <span style={{ color: '#01b574', fontSize: '13px', fontWeight: '700' }}>73%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '73%', 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #01b574 0%, #01b574aa 100%)',
                  borderRadius: '10px',
                  boxShadow: '0 0 15px #01b574',
                  animation: 'progress 2s ease-out'
                }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Скорость обработки */}
        <Card style={{ 
          background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            bottom: '-100px',
            right: '-100px',
            animation: 'pulse 3s infinite'
          }} />
          <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
              display: 'inline-flex',
              marginBottom: '20px'
            }}>
              <Icon name="Zap" size={24} style={{ color: '#fff' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
              Средняя Скорость
            </h3>
            <div style={{ 
              color: '#a855f7', 
              fontSize: '42px', 
              fontWeight: '900',
              textShadow: '0 0 30px rgba(168, 85, 247, 0.6)',
              marginBottom: '12px'
            }}>
              1.8ч
            </div>
            <div style={{ color: '#a3aed0', fontSize: '14px', marginBottom: '20px' }}>
              Обработка платежного запроса
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ 
                flex: 1,
                background: 'rgba(1, 181, 116, 0.15)',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(1, 181, 116, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ color: '#01b574', fontSize: '20px', fontWeight: '700' }}>-24%</div>
                <div style={{ color: '#a3aed0', fontSize: '11px', marginTop: '4px' }}>vs месяц назад</div>
              </div>
              <div style={{ 
                flex: 1,
                background: 'rgba(117, 81, 233, 0.15)',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(117, 81, 233, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ color: '#7551e9', fontSize: '20px', fontWeight: '700' }}>94%</div>
                <div style={{ color: '#a3aed0', fontSize: '11px', marginTop: '4px' }}>Автоматизация</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Команда */}
        <Card style={{ 
          background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
          border: '1px solid rgba(117, 81, 233, 0.3)',
          boxShadow: '0 0 30px rgba(117, 81, 233, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(117, 81, 233, 0.12) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'breathe 4s infinite'
          }} />
          <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(117, 81, 233, 0.5)',
              display: 'inline-flex',
              marginBottom: '20px'
            }}>
              <Icon name="Users" size={24} style={{ color: '#fff' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
              Активная Команда
            </h3>
            <div style={{ 
              color: '#7551e9', 
              fontSize: '42px', 
              fontWeight: '900',
              textShadow: '0 0 30px rgba(117, 81, 233, 0.6)',
              marginBottom: '12px'
            }}>
              24
            </div>
            <div style={{ color: '#a3aed0', fontSize: '14px', marginBottom: '20px' }}>
              Сотрудников работают с системой
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span style={{ color: '#a3aed0', fontSize: '13px' }}>Финансисты</span>
                <span style={{ color: '#7551e9', fontSize: '14px', fontWeight: '700' }}>12</span>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span style={{ color: '#a3aed0', fontSize: '13px' }}>IT отдел</span>
                <span style={{ color: '#01b574', fontSize: '14px', fontWeight: '700' }}>8</span>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span style={{ color: '#a3aed0', fontSize: '13px' }}>Менеджеры</span>
                <span style={{ color: '#ffb547', fontSize: '14px', fontWeight: '700' }}>4</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Календарь Платежей */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(117, 81, 233, 0.3)',
        boxShadow: '0 0 40px rgba(117, 81, 233, 0.2), inset 0 0 30px rgba(117, 81, 233, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 50%, rgba(117, 81, 233, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
                padding: '14px',
                borderRadius: '14px',
                boxShadow: '0 0 25px rgba(117, 81, 233, 0.6)'
              }}>
                <Icon name="Calendar" size={28} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>Календарь Платежей</h3>
                <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Декабрь 2024 • Распределение по дням</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)', boxShadow: '0 0 10px #01b574' }} />
                  <span style={{ color: '#a3aed0', fontSize: '12px' }}>Малые</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg, #ffb547 0%, #ff9500 100%)', boxShadow: '0 0 10px #ffb547' }} />
                  <span style={{ color: '#a3aed0', fontSize: '12px' }}>Средние</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)', boxShadow: '0 0 10px #ff6b6b' }} />
                  <span style={{ color: '#a3aed0', fontSize: '12px' }}>Крупные</span>
                </div>
              </div>
              <div style={{ 
                background: 'rgba(117, 81, 233, 0.15)',
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(117, 81, 233, 0.3)'
              }}>
                <span style={{ color: '#7551e9', fontSize: '14px', fontWeight: '700' }}>18 платежей</span>
              </div>
            </div>
          </div>

          {/* Days of week header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', marginBottom: '12px' }}>
            {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day, idx) => (
              <div key={idx} style={{ 
                textAlign: 'center', 
                color: '#7551e9', 
                fontSize: '13px', 
                fontWeight: '700',
                padding: '8px'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
            {(() => {
              const days = [];
              const paymentsData = {
                2: { amount: 15000, category: 'small', payments: ['Zoom: ₽8K', 'Slack: ₽7K'] },
                5: { amount: 45000, category: 'large', payments: ['AWS: ₽45K'] },
                8: { amount: 22000, category: 'medium', payments: ['Adobe: ₽22K'] },
                12: { amount: 8500, category: 'small', payments: ['GitHub: ₽8.5K'] },
                15: { amount: 67000, category: 'large', payments: ['Microsoft: ₽42K', 'Security: ₽25K'] },
                16: { amount: 0, category: 'today', payments: [] },
                19: { amount: 18000, category: 'medium', payments: ['Figma: ₽18K'] },
                22: { amount: 12000, category: 'small', payments: ['Postman: ₽12K'] },
                25: { amount: 52000, category: 'large', payments: ['Servers: ₽52K'] },
                28: { amount: 28000, category: 'medium', payments: ['Database: ₽28K'] },
                30: { amount: 95000, category: 'large', payments: ['Azure: ₽60K', 'DevTools: ₽35K'] }
              };

              const today = 16;

              for (let i = 1; i <= 31; i++) {
                const dayData = paymentsData[i];
                const isToday = i === today;
                
                let bgColor = 'rgba(255, 255, 255, 0.02)';
                let borderColor = 'rgba(255, 255, 255, 0.05)';
                let glowColor = 'transparent';
                let textColor = '#a3aed0';
                
                if (isToday) {
                  bgColor = 'rgba(117, 81, 233, 0.2)';
                  borderColor = '#7551e9';
                  glowColor = 'rgba(117, 81, 233, 0.4)';
                  textColor = '#fff';
                } else if (dayData && dayData.amount > 0) {
                  if (dayData.category === 'small') {
                    bgColor = 'rgba(1, 181, 116, 0.15)';
                    borderColor = 'rgba(1, 181, 116, 0.4)';
                    glowColor = 'rgba(1, 181, 116, 0.3)';
                    textColor = '#01b574';
                  } else if (dayData.category === 'medium') {
                    bgColor = 'rgba(255, 181, 71, 0.15)';
                    borderColor = 'rgba(255, 181, 71, 0.4)';
                    glowColor = 'rgba(255, 181, 71, 0.3)';
                    textColor = '#ffb547';
                  } else if (dayData.category === 'large') {
                    bgColor = 'rgba(255, 107, 107, 0.15)';
                    borderColor = 'rgba(255, 107, 107, 0.4)';
                    glowColor = 'rgba(255, 107, 107, 0.3)';
                    textColor = '#ff6b6b';
                  }
                }

                days.push(
                  <div
                    key={i}
                    style={{
                      background: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '12px',
                      padding: '12px',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: dayData ? 'pointer' : 'default',
                      boxShadow: isToday ? `0 0 20px ${glowColor}, inset 0 0 20px ${glowColor}` : 'none',
                      animation: isToday ? 'pulse 2s infinite' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (dayData && dayData.amount > 0) {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                        e.currentTarget.style.boxShadow = `0 10px 30px ${glowColor}, 0 0 20px ${glowColor}`;
                        e.currentTarget.style.zIndex = '10';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = isToday ? `0 0 20px ${glowColor}, inset 0 0 20px ${glowColor}` : 'none';
                      e.currentTarget.style.zIndex = '1';
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: dayData && dayData.amount > 0 ? '8px' : '0'
                    }}>
                      <span style={{ 
                        color: textColor, 
                        fontSize: '16px', 
                        fontWeight: '700',
                        textShadow: isToday ? `0 0 10px ${glowColor}` : 'none'
                      }}>
                        {i}
                      </span>
                      {isToday && (
                        <div style={{
                          background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontSize: '9px',
                          fontWeight: '700',
                          color: '#fff',
                          textTransform: 'uppercase',
                          boxShadow: '0 0 10px rgba(117, 81, 233, 0.5)'
                        }}>
                          Сегодня
                        </div>
                      )}
                    </div>
                    {dayData && dayData.amount > 0 && (
                      <>
                        <div style={{ 
                          color: textColor, 
                          fontSize: '14px', 
                          fontWeight: '800',
                          marginBottom: '6px',
                          textShadow: `0 0 15px ${glowColor}`
                        }}>
                          {new Intl.NumberFormat('ru-RU').format(dayData.amount)} ₽
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '3px',
                          fontSize: '11px',
                          color: '#a3aed0'
                        }}>
                          {dayData.payments.map((payment, idx) => (
                            <div key={idx} style={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              • {payment}
                            </div>
                          ))}
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: textColor,
                          boxShadow: `0 0 10px ${textColor}`,
                          animation: dayData.category === 'large' ? 'pulse 2s infinite' : 'none'
                        }} />
                      </>
                    )}
                  </div>
                );
              }
              return days;
            })()}
          </div>

          {/* Summary stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '16px',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            {[
              { icon: 'TrendingUp', label: 'Всего за месяц', value: '₽390.5K', color: '#7551e9' },
              { icon: 'Calendar', label: 'Дней с платежами', value: '11', color: '#3965ff' },
              { icon: 'DollarSign', label: 'Средний чек', value: '₽35.5K', color: '#01b574' },
              { icon: 'Target', label: 'Самый крупный', value: '₽95K', color: '#ff6b6b' }
            ].map((stat, idx) => (
              <div key={idx} style={{ 
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}08 100%)`,
                padding: '16px',
                borderRadius: '12px',
                border: `1px solid ${stat.color}30`,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${stat.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <Icon name={stat.icon} size={20} style={{ color: stat.color, marginBottom: '8px' }} />
                <div style={{ 
                  color: stat.color, 
                  fontSize: '20px', 
                  fontWeight: '800',
                  marginBottom: '4px',
                  textShadow: `0 0 15px ${stat.color}60`
                }}>
                  {stat.value}
                </div>
                <div style={{ color: '#a3aed0', fontSize: '11px', fontWeight: '600' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Dashboard2NeonCards;