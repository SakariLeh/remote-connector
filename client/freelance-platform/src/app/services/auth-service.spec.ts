import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
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

    const request = httpTesting.expectOne('/profile/change-password');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      old_password: 'old-secret',
      new_password: 'new-secret',
    });
    request.flush(null);
  });
});
