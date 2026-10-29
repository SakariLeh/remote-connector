import type { NotificationItem } from '../types';

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notification-1',
    title: 'Новый отклик на заказ',
    text: 'У вас новый отклик на заказ по дизайну интерфейса.',
    createdAt: '5 минут назад',
    isRead: false,
  },
  {
    id: 'notification-2',
    title: 'Заказчик ответил',
    text: 'Посмотрите новое сообщение по вашему отклику.',
    createdAt: '1 час назад',
    isRead: false,
  },
  {
    id: 'notification-3',
    title: 'Профиль обновлён',
    text: 'Ваш профиль успешно обновлён.',
    createdAt: 'Вчера',
    isRead: true,
  },
];
