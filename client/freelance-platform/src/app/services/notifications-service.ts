import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { NotificationItem } from '../components/dashboard/types';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  getNotifications(): Observable<NotificationItem[]> {
    return of([]);
  }
}
