import { Injectable } from '@angular/core';
import { CONVERSATIONS } from '../mocks/conversations';
import type { Conversation } from '../types';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  async getConversations(): Promise<Conversation[]> {
    return CONVERSATIONS;
  }
}
