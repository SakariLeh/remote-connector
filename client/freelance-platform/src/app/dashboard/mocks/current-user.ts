import type { User } from '../types';

export const CURRENT_USER: User = {
  id: 'user-1',
  firstName: 'Алина',
  lastNameInitial: 'К.',
  specialization: 'UI/UX & Web',
  grade: 'Middle',
  isPro: true,
  availableRoles: ['executor', 'customer'],
};
