import { Injectable } from '@angular/core';
import { CURRENT_USER } from '../mocks/current-user';
import type { User } from '../types';

@Injectable({ providedIn: 'root' })
export class UserService {
  async getCurrentUser(): Promise<User> {
    return CURRENT_USER;
  }
}
