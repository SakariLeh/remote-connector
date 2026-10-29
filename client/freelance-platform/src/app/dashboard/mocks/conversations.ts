import type { Conversation } from '../types';

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conversation-1',
    peerName: 'Иван Петров',
    lastMessage: 'Отлично, отправлю макеты сегодня.',
    unreadCount: 2,
    updatedAt: '10 мин. назад',
  },
  {
    id: 'conversation-2',
    peerName: 'Мария Смирнова',
    lastMessage: 'Спасибо за быстрый ответ!',
    unreadCount: 1,
    updatedAt: '1 ч. назад',
  },
  {
    id: 'conversation-3',
    peerName: 'Алексей Волков',
    lastMessage: 'Давайте обсудим детали проекта.',
    unreadCount: 0,
    updatedAt: 'Вчера',
  },
];
