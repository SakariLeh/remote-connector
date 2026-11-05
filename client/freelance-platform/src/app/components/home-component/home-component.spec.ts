import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home-component';

describe('HomeComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('shows categories from the API', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const request = httpTesting.expectOne('/task-categories/');
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 1,
        name: 'Разработка и IT',
        description: 'Сайты и приложения',
        created_at: '2026-01-01T00:00:00',
        updated_at: '2026-01-01T00:00:00',
      },
      {
        id: 2,
        name: 'Дизайн и графика',
        description: 'Интерфейсы и графика',
        created_at: '2026-01-01T00:00:00',
        updated_at: '2026-01-01T00:00:00',
      },
    ]);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('.category-card')).toHaveLength(2);
    expect(page.textContent).toContain('Разработка и IT');
    expect(page.textContent).toContain('Дизайн и графика');
  });
});
