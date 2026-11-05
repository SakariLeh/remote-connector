import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { Conversation } from '../components/dashboard/types';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  getConversations(): Observable<Conversation[]> {
    return of([]);
  }
}
