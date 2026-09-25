import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { AuthService } from '../../auth';
import { AuthComponent } from './auth-component';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: {
            user: signal(null),
            token: signal(null),
            login: () => of({ id: 1, email: 'a@b.c', jwt_token: 't' }),
            register: () => of({ id: 1, email: 'a@b.c', jwt_token: 't' }),
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
