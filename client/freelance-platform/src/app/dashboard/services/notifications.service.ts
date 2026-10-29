import { Injectable } from '@angular/core';
import { NOTIFICATIONS } from '../mocks/notifications';
import type { NotificationItem } from '../types';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  async getNotifications(): Promise<NotificationItem[]> {
    return NOTIFICATIONS;
  }
}
