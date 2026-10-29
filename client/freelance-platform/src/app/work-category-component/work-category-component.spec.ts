import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WorkCategoryComponent } from './work-category-component';

describe('WorkCategoryComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkCategoryComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '7' })),
            snapshot: { paramMap: convertToParamMap({ id: '7' }) },
          },
        },
      ],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('shows the selected category from the API', () => {
    const fixture = TestBed.createComponent(WorkCategoryComponent);
    fixture.detectChanges();

    const request = httpTesting.expectOne('/task-categories/7');
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 7,
      name: 'Веб-разработка',
      description: 'Лендинги и веб-сервисы',
      created_at: '2026-01-01T00:00:00',
      updated_at: '2026-01-01T00:00:00',
    });
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Веб-разработка');
    expect(page.textContent).toContain('Лендинги и веб-сервисы');
  });
});
