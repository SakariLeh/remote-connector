import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WorkCategoryComponent } from './work-category-component';

describe('WorkCategoryComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkCategoryComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ slug: 'web-development' })),
            snapshot: { paramMap: convertToParamMap({ slug: 'web-development' }) },
          },
        },
      ],
    }).compileComponents();
  });

  it('shows example work for the selected topic', async () => {
    const fixture = TestBed.createComponent(WorkCategoryComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Работы: Веб-разработка');
    expect(page.textContent).toContain('Интернет-магазин');
    expect(page.textContent).toContain('не опубликованные объявления');
  });
});
