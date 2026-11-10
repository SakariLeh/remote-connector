import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('fp_auth');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends the change-password payload expected by the API', () => {
    service.changePassword('old-secret', 'new-secret').subscribe();

    const request = httpTesting.expectOne('/auth/change-password');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      old_password: 'old-secret',
      new_password: 'new-secret',
    });
    request.flush({ id: 4, email: 'user@example.com', jwt_token: 'next-token' });
    expect(service.token()).toBe('next-token');
    expect(service.user()).toEqual({ id: 4, email: 'user@example.com', role: undefined });
  });
});
