import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-profile-component',
  imports: [],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.css',
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);


  protected readonly user = this.authService.user

  logout(): void {
    this.authService.logout();
  }

}


