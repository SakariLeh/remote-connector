export type UserRole = 'executor' | 'customer';
export type Theme = 'dark' | 'light';

export interface User {
  id: string;
  firstName: string;
  lastNameInitial: string;
  avatarUrl?: string;
  specialization: string;
  grade?: string;
  isPro: boolean;
  availableRoles: UserRole[];
}

export interface NotificationItem {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  peerName: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}
