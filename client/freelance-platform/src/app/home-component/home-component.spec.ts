import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home-component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows the main work categories and examples', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('.category-card')).toHaveLength(8);
    expect(page.textContent).toContain('Разработка и IT');
    expect(page.textContent).toContain('Дизайн и графика');
    expect(page.textContent).toContain('Монтаж видео');
  });
});
