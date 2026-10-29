import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WORK_CATEGORIES } from '../work-categories';

@Component({
  selector: 'app-home-component',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  protected readonly categories = WORK_CATEGORIES;
}
